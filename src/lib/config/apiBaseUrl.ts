/**
 * The backend's address, from NEXT_PUBLIC_API_URL only — nothing is hard-coded.
 *
 * Accepts the bare host ("https://citadel-api.up.railway.app") or the full API path ("…/api/v1"),
 * with or without a trailing slash. Next.js bakes NEXT_PUBLIC_* values in at build time, so redeploy after changing it.
 */
export const API_PATH = "/api/v1";

export function normaliseApiUrl(raw: string | undefined): string {
  const value = (raw ?? "").trim().replace(/\/+$/, "");
  if (!value) {
    throw new Error(
      "apiBaseUrl.ts/normaliseApiUrl(): NEXT_PUBLIC_API_URL is not set. Add it to frontend/.env.development (local) " +
        "or to your hosting provider's environment variables, e.g. https://your-api.up.railway.app",
    );
  }
  if (!/^https?:\/\//.test(value)) throw new Error(`apiBaseUrl.ts/normaliseApiUrl(): NEXT_PUBLIC_API_URL must start with http:// or https:// (got "${value}")`);
  return value.endsWith(API_PATH) ? value : `${value}${API_PATH}`;
}

let cached: string | null = null;

/** Resolved lazily so a missing value gives a clear error where it is used, not a blank screen at import time. */
export function apiBaseUrl(): string {
  // Must be written out in full: Next.js only inlines `process.env.NEXT_PUBLIC_API_URL` when it appears literally.
  cached ??= normaliseApiUrl(process.env.NEXT_PUBLIC_API_URL);
  return cached;
}
