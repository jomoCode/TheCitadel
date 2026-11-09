import { apiClient, type ApiClient } from "@/lib/api/ApiClient";

export type BusinessEvent =
  | "page_viewed"
  | "enquiry_submitted"
  | "property_viewed"
  | "brochure_downloaded"
  | "cta_clicked"
  | "viewing_requested"
  | "referral_submitted";

type GtagFn = (command: "event", name: string, params?: Record<string, unknown>) => void;

/**
 * Sends important business events to two places (PRD §12.2):
 * Google Analytics 4 for traffic insight, and our own backend for reliable business records.
 * Tracking must never break the page, so every failure is swallowed.
 */
export class AnalyticsTracker {
  constructor(private readonly api: ApiClient = apiClient) {}

  track(event: BusinessEvent, properties: Record<string, string | number | undefined> = {}): void {
    this.sendToGa(event, properties);
    void this.api
      .post("/public/events", { event, properties, path: typeof window === "undefined" ? undefined : window.location.pathname })
      .catch(() => undefined);
  }

  private sendToGa(event: string, properties: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    const gtag = (window as unknown as { gtag?: GtagFn }).gtag;
    try {
      gtag?.("event", event, properties);
    } catch {
      /* analytics is best-effort */
    }
  }
}

export const analyticsTracker = new AnalyticsTracker();
