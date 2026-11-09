const STORAGE_KEY = "citadel.attribution";
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export type Attribution = Partial<Record<(typeof UTM_KEYS)[number], string>> & {
  referrer?: string;
  landing_page?: string;
};

/**
 * Remembers where a visitor first came from (ad campaign, Google, Instagram…)
 * so enquiries can be credited to the right marketing channel.
 */
export class AttributionTracker {
  constructor(private readonly storage: () => Storage | null = () => (typeof window === "undefined" ? null : window.sessionStorage)) {}

  /** Call once per page load. Keeps the first-touch values for the session. */
  capture(url: string, referrer: string): void {
    const store = this.safeStorage();
    if (!store || store.getItem(STORAGE_KEY)) return;
    const params = new URL(url).searchParams;
    const data: Attribution = { landing_page: new URL(url).pathname };
    for (const key of UTM_KEYS) {
      const value = params.get(key);
      if (value) data[key] = value;
    }
    if (referrer) data.referrer = referrer;
    store.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  read(): Attribution {
    const raw = this.safeStorage()?.getItem(STORAGE_KEY);
    if (!raw) return {};
    try {
      return JSON.parse(raw) as Attribution;
    } catch {
      return {};
    }
  }

  private safeStorage(): Storage | null {
    try {
      return this.storage();
    } catch {
      return null;
    }
  }
}

export const attributionTracker = new AttributionTracker();
