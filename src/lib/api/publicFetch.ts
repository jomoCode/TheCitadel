/** Website content is re-fetched at most once a minute, so admin changes appear on the site within about 60 seconds. */
export const CONTENT_REVALIDATE_SECONDS = 60;

/** Whether to fall back to the bundled copy when the API can't be reached (default: yes in development, no in production). */
export function bundledFallbackEnabled(): boolean {
  const mode = process.env.CONTENT_FALLBACK ?? (process.env.NODE_ENV === "production" ? "none" : "seed");
  return mode === "seed";
}

/**
 * Server-side GET of a public API path, cached by Next for a minute. Never throws: on failure it logs a located
 * message and returns `fallback()`, so a slow or unavailable API can't take the website down.
 */
export async function publicFetch<T>(path: string, fallback: () => T, tag?: string): Promise<T> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  try {
    const response = await fetch(`${base}${path}`, {
      next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: tag ? [tag] : [] },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (error) {
    console.error(`publicFetch.ts/publicFetch(): could not load ${path} from ${base} — ${String(error)}`);
    return fallback();
  }
}
