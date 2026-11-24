/**
 * Standard website analytics (schema v3). Shared by every marketing site; the reference implementation is
 * quoec `src/analytics`. Components only ever call `track()` / `withTracking()` or use `TrackedLink`.
 */
export { track, withTracking } from "./track";
export { TrackedAnchor, TrackedLink } from "./TrackedLink";
export { TAGS, SCHEMA_VERSION, WEBSITE_ID } from "./types";
export type { AnalyticsEvent, AnalyticsMeta, AnalyticsPriority, AnalyticsTag, EventName, TrackInput } from "./types";
