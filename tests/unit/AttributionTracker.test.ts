import { beforeEach, describe, expect, it } from "vitest";
import { AttributionTracker } from "@/features/marketing/services/AttributionTracker";

describe("AttributionTracker", () => {
  beforeEach(() => sessionStorage.clear());
  const tracker = new AttributionTracker(() => sessionStorage);

  it("captures UTM tags, landing page and referrer on first visit", () => {
    tracker.capture("https://citadel.example/properties?utm_source=instagram&utm_campaign=launch", "https://instagram.com/");
    expect(tracker.read()).toEqual({
      landing_page: "/properties",
      utm_source: "instagram",
      utm_campaign: "launch",
      referrer: "https://instagram.com/",
    });
  });

  it("keeps first-touch attribution for the rest of the session", () => {
    tracker.capture("https://citadel.example/?utm_source=google", "");
    tracker.capture("https://citadel.example/blog?utm_source=newsletter", "");
    expect(tracker.read().utm_source).toBe("google");
  });

  it("never throws when storage is unavailable", () => {
    const broken = new AttributionTracker(() => {
      throw new Error("blocked");
    });
    expect(() => broken.capture("https://citadel.example/", "")).not.toThrow();
    expect(broken.read()).toEqual({});
  });
});
