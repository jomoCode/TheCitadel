import { detectEnv, deviceType, isBot } from "./environment";
import { getSession, getVisitorId, saveSession } from "./identity";
import { local, readJSON, removeKey, uuid, writeJSON } from "./storage";
import { initTransport, send } from "./transport";
import { SCHEMA_VERSION, TAGS, WEBSITE_ID, type AnalyticsEvent, type TrackInput } from "./types";

const THROTTLE_MS = 1000; // same event+tag+page within this window = accidental double click / re-render
const INTERNAL_KEY = "qa_internal";
const MAX_SEEN = 500;

const lastFired = new Map<string, number>();

/** Visit any page with ?internal=1 once to exclude this browser (team traffic); ?internal=0 to undo. */
function isInternal(): boolean {
  const flag = new URLSearchParams(window.location.search).get("internal");
  if (flag === "1") writeJSON(local(), INTERNAL_KEY, true);
  if (flag === "0") removeKey(local(), INTERNAL_KEY);
  return readJSON<boolean>(local(), INTERNAL_KEY) === true;
}

/**
 * The single entry point for analytics. Fire-and-forget: never throws, never blocks.
 * Drops: bots, internal traffic, accidental double-fires, repeats of `once` events.
 */
export function track(input: TrackInput): void {
  try {
    if (typeof window === "undefined" || isBot() || isInternal()) return;
    initTransport();

    const tagInfo = TAGS[input.tag];
    if (!tagInfo) {
      if (process.env.NODE_ENV === "development") console.warn(`[analytics] unknown tag "${input.tag}" — add it to TAGS`);
      return;
    }

    const now = Date.now();
    const page = window.location.pathname;

    // Throttle accidental rapid repeats (double clicks, touch + click, React Strict Mode effects).
    // The page is part of the key so quick page-to-page navigation still records every page view.
    const throttleKey = `${input.name}|${input.tag}`;
    const last = lastFired.get(`${throttleKey}|${page}`);
    if (last !== undefined && now - last < THROTTLE_MS) return;
    lastFired.set(`${throttleKey}|${page}`, now);

    const session = getSession();

    if (input.once) {
      const onceKey = input.once === "page" ? `${throttleKey}|${page}` : throttleKey;
      if (session.seen.includes(onceKey)) {
        session.lastActivity = now;
        saveSession(session);
        return;
      }
      session.seen = [...session.seen, onceKey].slice(-MAX_SEEN);
    }

    session.seq += 1;
    session.lastActivity = now;
    saveSession(session);

    const width = window.innerWidth;
    const event: AnalyticsEvent = {
      website_id: WEBSITE_ID,
      event_id: uuid(),
      name: input.name,
      tag: input.tag,
      priority: tagInfo.priority,
      visitor_id: getVisitorId(),
      session_id: session.id,
      seq: session.seq,
      page_path: page,
      ...session.attribution,
      device_type: deviceType(width),
      viewport_width: width,
      language: navigator.language,
      env: detectEnv(),
      schema_version: SCHEMA_VERSION,
      client_ts: new Date(now).toISOString(),
      ...(input.meta ? { meta: input.meta } : {}),
    };

    send(event);
  } catch (err) {
    if (process.env.NODE_ENV === "development") console.warn("[analytics] track failed", err);
  }
}

/**
 * Wraps any event handler so it tracks first, then runs the original.
 * Works for any component: <X onClick={withTracking({ name, tag }, handler)} />
 */
export function withTracking<Args extends unknown[]>(input: TrackInput, handler?: (...args: Args) => void): (...args: Args) => void {
  return (...args: Args) => {
    track(input);
    handler?.(...args);
  };
}

/** Test hook: forget throttling between tests. */
export function __resetTrackForTests() {
  lastFired.clear();
}
