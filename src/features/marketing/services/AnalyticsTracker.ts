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
type AnalyticsWindow = { gtag?: GtagFn; dataLayer?: Record<string, unknown>[] };

/**
 * Sends important business events to two places (PRD §12.2):
 * Google (Tag Manager's dataLayer when NEXT_PUBLIC_GTM_ID is set, otherwise GA4's gtag) for traffic insight,
 * and our own backend for reliable business records. Tracking must never break the page, so every failure is swallowed.
 */
export class AnalyticsTracker {
  constructor(
    private readonly api: ApiClient = apiClient,
    private readonly useTagManager: boolean = Boolean(process.env.NEXT_PUBLIC_GTM_ID),
  ) {}

  track(event: BusinessEvent, properties: Record<string, string | number | undefined> = {}): void {
    this.sendToGoogle(event, properties);
    void this.api
      .post("/public/events", { event, properties, path: typeof window === "undefined" ? undefined : window.location.pathname })
      .catch(() => undefined);
  }

  private sendToGoogle(event: string, properties: Record<string, unknown>) {
    if (typeof window === "undefined") return;
    const w = window as unknown as AnalyticsWindow;
    try {
      if (this.useTagManager) {
        // Tag Manager reads custom events from the dataLayer; use "Custom Event" triggers with these names.
        w.dataLayer = w.dataLayer || [];
        w.dataLayer.push({ event, ...properties });
      } else {
        w.gtag?.("event", event, properties);
      }
    } catch {
      /* analytics is best-effort */
    }
  }
}

export const analyticsTracker = new AnalyticsTracker();
