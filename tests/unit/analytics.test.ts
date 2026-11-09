import { afterEach, describe, expect, it, vi } from "vitest";
import { AnalyticsTracker } from "@/features/marketing/services/AnalyticsTracker";
import type { ApiClient } from "@/lib/api/ApiClient";

const api = () => ({ post: vi.fn(async () => undefined) }) as unknown as ApiClient & { post: ReturnType<typeof vi.fn> };
type W = { dataLayer?: Record<string, unknown>[]; gtag?: unknown };

describe("AnalyticsTracker", () => {
  afterEach(() => { delete (window as unknown as W).dataLayer; delete (window as unknown as W).gtag; });

  it("with Tag Manager: pushes a named event into the dataLayer and records it first-party", () => {
    const client = api();
    new AnalyticsTracker(client, true).track("enquiry_submitted", { enquiry_type: "viewing" });
    expect((window as unknown as W).dataLayer).toEqual([{ event: "enquiry_submitted", enquiry_type: "viewing" }]);
    expect(client.post).toHaveBeenCalledWith("/public/events", expect.objectContaining({ event: "enquiry_submitted" }));
  });

  it("without Tag Manager: uses GA4's gtag when it is loaded", () => {
    const gtag = vi.fn();
    (window as unknown as W).gtag = gtag;
    new AnalyticsTracker(api(), false).track("property_viewed", { property: "the-citadel-asokoro" });
    expect(gtag).toHaveBeenCalledWith("event", "property_viewed", { property: "the-citadel-asokoro" });
    expect((window as unknown as W).dataLayer).toBeUndefined();
  });

  it("never breaks the page if Google's script misbehaves", () => {
    (window as unknown as W).gtag = () => { throw new Error("blocked"); };
    expect(() => new AnalyticsTracker(api(), false).track("cta_clicked")).not.toThrow();
  });
});
