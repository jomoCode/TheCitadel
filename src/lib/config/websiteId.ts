/**
 * Which website this is on the backend, sent as `X-Website-Id` on every API call so the API returns this site's
 * content and files enquiries/analytics under it. From NEXT_PUBLIC_WEBSITE_ID; defaults to "citadel".
 */
export const WEBSITE_HEADER = "X-Website-Id";

export function websiteId(): string {
  // Written out in full so Next.js inlines it.
  return (process.env.NEXT_PUBLIC_WEBSITE_ID ?? "").trim().toLowerCase() || "citadel";
}

export const websiteHeaders = (): Record<string, string> => ({ [WEBSITE_HEADER]: websiteId() });
