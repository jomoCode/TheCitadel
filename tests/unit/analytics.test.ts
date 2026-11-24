import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsEvent } from "@/features/analytics";

/**
 * Standard website analytics (schema v3, reference: quoec src/analytics).
 * Each test loads fresh modules so the queue, throttle and transport start empty.
 */

const env = vi.hoisted(() => ({ value: "prod" as "prod" | "dev" }));
vi.mock("@/features/analytics/environment", async (original) => ({
  ...(await original<typeof import("@/features/analytics/environment")>()),
  detectEnv: () => env.value,
}));

type W = { dataLayer?: Record<string, unknown>[]; gtag?: unknown };

async function load() {
  vi.resetModules();
  const analytics = await import("@/features/analytics");
  const transport = await import("@/features/analytics/transport");
  return { ...analytics, flush: transport.flush };
}

function sentBatch(fetchMock: ReturnType<typeof vi.fn>, call = 0): AnalyticsEvent[] {
  const [, init] = fetchMock.mock.calls[call] as [string, RequestInit];
  return (JSON.parse(String(init.body)) as { events: AnalyticsEvent[] }).events;
}

let fetchMock: ReturnType<typeof vi.fn>;

beforeEach(() => {
  localStorage.clear();
  env.value = "prod";
  window.history.replaceState(null, "", "/");
  fetchMock = vi.fn(async () => new Response(null, { status: 204 }));
  vi.stubGlobal("fetch", fetchMock);
  vi.spyOn(console, "debug").mockImplementation(() => undefined);
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  delete (window as unknown as W).dataLayer;
  delete (window as unknown as W).gtag;
});

describe("track()", () => {
  it("builds a schema v3 event with this website's id and the session's campaign attribution", async () => {
    window.history.replaceState(null, "", "/?utm_source=instagram&utm_campaign=launch&fbclid=abc");
    const { track, flush } = await load();

    track({ name: "generate_lead", tag: "enquiry_form_submit", meta: { enquiry_type: "viewing" } });
    await flush();

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe("http://localhost:8000/api/v1/public/analytics/events?website_id=citadel");
    expect((init.headers as Record<string, string>)["X-Website-Id"]).toBe("citadel");
    const [event] = sentBatch(fetchMock);
    expect(event).toMatchObject({
      website_id: "citadel",
      name: "generate_lead",
      tag: "enquiry_form_submit",
      priority: "conversion",
      seq: 1,
      page_path: "/",
      utm_source: "instagram",
      utm_campaign: "launch",
      fbclid: "abc",
      schema_version: 3,
      env: "prod",
      meta: { enquiry_type: "viewing" },
    });
    expect(event.event_id).toMatch(/^[0-9a-f-]{36}$/);
  });

  it("keeps one visitor and one session across events, numbering them in order", async () => {
    const { track, flush } = await load();
    track({ name: "page_viewed", tag: "page" });
    window.history.replaceState(null, "", "/about");
    track({ name: "page_viewed", tag: "page" });
    await flush();

    const [a, b] = sentBatch(fetchMock);
    expect(a.visitor_id).toBe(b.visitor_id);
    expect(a.session_id).toBe(b.session_id);
    expect([a.seq, b.seq]).toEqual([1, 2]);
  });

  it("drops accidental repeats on the same page within a second", async () => {
    const { track, flush } = await load();
    track({ name: "cta_click", tag: "hero_primary_cta" });
    track({ name: "cta_click", tag: "hero_primary_cta" });
    await flush();
    expect(sentBatch(fetchMock)).toHaveLength(1);
  });

  it("counts `once: 'session'` events a single time per session", async () => {
    vi.useFakeTimers({ toFake: ["Date"] });
    const { track, flush } = await load();
    track({ name: "cta_click", tag: "header_contact", once: "session" });
    vi.setSystemTime(Date.now() + 5_000); // past the throttle window
    track({ name: "cta_click", tag: "header_contact", once: "session" });
    vi.useRealTimers();
    await flush();
    expect(sentBatch(fetchMock)).toHaveLength(1);
  });

  it("ignores team traffic after ?internal=1 and bots", async () => {
    window.history.replaceState(null, "", "/?internal=1");
    const { track, flush } = await load();
    track({ name: "page_viewed", tag: "page" });
    window.history.replaceState(null, "", "/?internal=0");
    Object.defineProperty(navigator, "webdriver", { value: true, configurable: true });
    try {
      track({ name: "page_viewed", tag: "page" });
    } finally {
      delete (navigator as { webdriver?: boolean }).webdriver;
    }
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("never throws, even when storage is unavailable", async () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    const { track } = await load();
    expect(() => track({ name: "page_viewed", tag: "page" })).not.toThrow();
  });
});

describe("transport", () => {
  it("keeps events after a network error and sends them on the next flush", async () => {
    fetchMock.mockRejectedValueOnce(new TypeError("offline"));
    const { track, flush } = await load();
    track({ name: "page_viewed", tag: "page" });
    await flush();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(sentBatch(fetchMock, 1)).toHaveLength(1);
  });

  it("drops a batch the API rejects as malformed (4xx) instead of retrying forever", async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 422 }));
    const { track, flush } = await load();
    track({ name: "page_viewed", tag: "page" });
    await flush();
    await flush();
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("can be switched off: events stay in the console", async () => {
    vi.stubEnv("NEXT_PUBLIC_ANALYTICS_ENDPOINT", "off");
    const { track, flush } = await load();
    track({ name: "page_viewed", tag: "page" });
    await flush();
    expect(fetchMock).not.toHaveBeenCalled();
    expect(console.debug).toHaveBeenCalled();
  });

  it("pushes named events into Tag Manager's dataLayer when NEXT_PUBLIC_GTM_ID is set", async () => {
    vi.stubEnv("NEXT_PUBLIC_GTM_ID", "GTM-TEST");
    const { track } = await load();
    track({ name: "brochure_download", tag: "brochure_download", meta: { property: "the-citadel-asokoro" } });
    expect((window as unknown as W).dataLayer).toEqual([
      expect.objectContaining({ event: "brochure_download", tag: "brochure_download", property: "the-citadel-asokoro", website_id: "citadel" }),
    ]);
  });

  it("uses GA4's gtag otherwise, and never sends development traffic to Google", async () => {
    const gtag = vi.fn();
    (window as unknown as W).gtag = gtag;
    const { track } = await load();
    track({ name: "property_viewed", tag: "property_page", meta: { property: "the-citadel-asokoro" } });
    expect(gtag).toHaveBeenCalledWith("event", "property_viewed", expect.objectContaining({ property: "the-citadel-asokoro" }));

    env.value = "dev";
    gtag.mockClear();
    window.history.replaceState(null, "", "/elsewhere");
    track({ name: "property_viewed", tag: "property_page" });
    expect(gtag).not.toHaveBeenCalled();
  });
});
