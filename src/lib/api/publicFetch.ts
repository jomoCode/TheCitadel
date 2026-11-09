import { apiBaseUrl } from "@/lib/config/apiBaseUrl";

/** Website content is re-fetched at most once a minute, so admin changes appear on the site within about 60 seconds. */
export const CONTENT_REVALIDATE_SECONDS = 60;

/** Whether to fall back to the bundled copy when the API can't be reached (default: yes in development, no in production). */
export function bundledFallbackEnabled(): boolean {
  const mode = process.env.CONTENT_FALLBACK ?? (process.env.NODE_ENV === "production" ? "none" : "seed");
  return mode === "seed";
}

/**
 * Server-side GET of a public API path, cached by Next for a minute. If the API is slow or down it logs a located
 * warning and returns `fallback()`, so the website stays up. A missing NEXT_PUBLIC_API_URL is a setup mistake, so that
 * one does throw (the build fails loudly instead of shipping a site that silently shows nothing).
 */
export async function publicFetch<T>(path: string, fallback: () => T, tag?: string): Promise<T> {
  const base = apiBaseUrl();
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: tag ? [tag] : [] },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    // warn, not error: the page still renders from the fallback (and Next's dev overlay treats errors as crashes)
    console.warn(`publicFetch.ts/publicFetch(): could not load ${path} from ${base} — ${String(error)}`);
    return fallback();
  }
}
