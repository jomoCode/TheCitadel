import { apiBaseUrl } from "@/lib/config/apiBaseUrl";
import { WEBSITE_HEADER } from "@/lib/config/websiteId";
import { local, readJSON, removeKey, writeJSON } from "./storage";
import { WEBSITE_ID, type AnalyticsEvent } from "./types";

/**
 * The only file that knows where events go.
 * - Backend: citadel-api POST /public/analytics/events (derived from NEXT_PUBLIC_API_URL). Receives { events: AnalyticsEvent[] }
 *   and stores each event_id once — retries and beacons may resend events.
 *   NEXT_PUBLIC_ANALYTICS_ENDPOINT overrides the address; set it to "off" to keep events in the browser console.
 * - Google: Tag Manager's dataLayer when NEXT_PUBLIC_GTM_ID is set, otherwise GA4's gtag (loaded by the layout).
 * In development, events are also logged to the console.
 */

const QUEUE_KEY = "qa_queue";
const MAX_BATCH = 20;
const MAX_QUEUE = 200; // cap so an offline device can't grow storage forever
const FLUSH_INTERVAL_MS = 5000;

type AnalyticsWindow = { dataLayer?: unknown[]; gtag?: (...args: unknown[]) => void };

/** Resolved once; null = no backend (console only). Never throws: analytics must not break the page. */
function resolveEndpoint(): string | null {
  // Written out in full so Next.js inlines them.
  const override = (process.env.NEXT_PUBLIC_ANALYTICS_ENDPOINT ?? "").trim();
  if (override === "off") return null;
  try {
    const base = override || `${apiBaseUrl()}/public/analytics/events`;
    const url = new URL(base);
    // Beacons can't send headers, so the website also travels in the query string.
    url.searchParams.set("website_id", WEBSITE_ID);
    return url.toString();
  } catch {
    return null;
  }
}

let endpoint: string | null | undefined;
const tagManagerEnabled = () => Boolean(process.env.NEXT_PUBLIC_GTM_ID);

// Queue is persisted so events survive offline periods and page closes.
// Each event keeps its event_id, so a resend is deduped server-side.
let queue: AnalyticsEvent[] = [];
let flushing = false;
let initialised = false;

function persist() {
  if (queue.length) writeJSON(local(), QUEUE_KEY, queue.slice(-MAX_QUEUE));
  else removeKey(local(), QUEUE_KEY);
}

export function initTransport() {
  if (initialised || typeof window === "undefined") return;
  initialised = true;
  endpoint = resolveEndpoint();
  queue = readJSON<AnalyticsEvent[]>(local(), QUEUE_KEY) ?? [];

  if (endpoint) {
    window.setInterval(() => void flush(), FLUSH_INTERVAL_MS);
    window.addEventListener("online", () => void flush());
    // Last chance before the page goes away (tab close, navigation, app switch on mobile).
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") flushWithBeacon();
    });
    window.addEventListener("pagehide", flushWithBeacon);
    void flush(); // send anything left over from a previous visit
  }
}

export function send(event: AnalyticsEvent) {
  sendToGoogle(event);

  if (!endpoint || event.env === "dev") {
    console.debug("[analytics]", event.name, event.tag, event);
    if (!endpoint) return;
  }

  queue.push(event);
  if (queue.length > MAX_QUEUE) queue = queue.slice(-MAX_QUEUE);
  persist();
  if (queue.length >= MAX_BATCH) void flush();
}

export async function flush() {
  if (!endpoint || flushing || !queue.length || !navigator.onLine) return;
  flushing = true;
  const batch = queue.slice(0, MAX_BATCH);
  try {
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json", [WEBSITE_HEADER]: WEBSITE_ID },
      body: JSON.stringify({ events: batch }),
      keepalive: true,
    });
    // 4xx (other than 429) means the batch itself is bad — drop it rather than retry forever.
    if (res.ok || (res.status >= 400 && res.status < 500 && res.status !== 429)) {
      const sent = new Set(batch.map((e) => e.event_id));
      queue = queue.filter((e) => !sent.has(e.event_id));
      persist();
    }
  } catch {
    // Network error: keep the events and retry on the next interval / when back online.
  } finally {
    flushing = false;
  }
}

function flushWithBeacon() {
  if (!endpoint || !queue.length || typeof navigator.sendBeacon !== "function") return;
  // text/plain: browsers refuse cross-origin beacons with application/json. The API parses the body either way.
  const blob = new Blob([JSON.stringify({ events: queue.slice(0, MAX_BATCH) })], { type: "text/plain;charset=UTF-8" });
  // sendBeacon gives no delivery confirmation, so events stay queued; if they are resent
  // next visit, the backend's event_id uniqueness drops the duplicates.
  navigator.sendBeacon(endpoint, blob);
}

// ---- Google (Tag Manager or GA4) ----

function googleParams(event: AnalyticsEvent): Record<string, string | number | boolean> {
  // GA4: flat params, values <= 100 chars, max 25 params. meta is spread to top level.
  const params: Record<string, string | number | boolean> = {
    website_id: event.website_id,
    tag: event.tag,
    priority: event.priority,
    page_path: event.page_path,
    visitor_id: event.visitor_id,
    event_id: event.event_id,
    schema_version: event.schema_version,
  };
  for (const [k, v] of Object.entries(event.meta ?? {})) {
    if (Object.keys(params).length >= 25) break;
    if (!(k in params)) params[k] = v;
  }
  for (const k of Object.keys(params)) {
    const v = params[k];
    if (typeof v === "string" && v.length > 100) params[k] = v.slice(0, 100);
  }
  return params;
}

function sendToGoogle(event: AnalyticsEvent) {
  if (event.env === "dev") return;
  const w = window as unknown as AnalyticsWindow;
  try {
    if (tagManagerEnabled()) {
      // Tag Manager reads custom events from the dataLayer; use "Custom Event" triggers with these names.
      w.dataLayer = w.dataLayer || [];
      w.dataLayer.push({ event: event.name, ...googleParams(event) });
    } else {
      w.gtag?.("event", event.name, googleParams(event));
    }
  } catch {
    /* analytics is best-effort */
  }
}

/** Test hook: forget module state between tests. */
export function __resetTransportForTests() {
  initialised = false;
  flushing = false;
  queue = [];
  endpoint = undefined;
}
