/**
 * The analytics contract (standard website analytics, schema v3 — reference: quoec `src/analytics/types.ts`).
 * Every tracked event must fit these types. Rows in the backend `analytics_events` table
 * (POST /public/analytics/events) and GA4 / Tag Manager events are both derived from `AnalyticsEvent`.
 */

import { websiteId } from "@/lib/config/websiteId";
import type { AppEnv, DeviceType } from "./environment";

/** Bump when the event shape changes so old/new rows can be told apart. */
export const SCHEMA_VERSION = 3; // v3: adds website_id for filtering events by website

/** This website's id: the same value sent as X-Website-Id, so analytics and content agree. */
export const WEBSITE_ID: string = websiteId();

/**
 * Event names: specific actions, snake_case, <= 40 chars (GA4 rules).
 * Avoid GA4 reserved names (page_view, session_start, first_visit, ...).
 * Mark conversions as "key events" in GA4 by these names.
 */
export type EventName =
  | "page_viewed" // a page was shown (the Insights dashboard counts these)
  | "property_viewed" // a listing's detail page was shown (Insights "top properties": meta.property)
  | "cta_click" // a call-to-action was clicked (intent)
  | "generate_lead" // an enquiry was successfully submitted (conversion) — GA4 recommended name
  | "brochure_download" // a brochure PDF was downloaded
  | "project_view" // a development came into view / was opened
  | "nav_click" // internal navigation
  | "outbound_click"; // link leaving the site

export type AnalyticsPriority = "conversion" | "engagement" | "navigation";

/**
 * Tag registry: one entry per trackable element. Mirrors the `analytics_tags` table.
 * Adding a tag here is the only way to make it trackable, so tags can't drift or be misspelled.
 */
export const TAGS = {
  page: { description: "Any page, recorded once per route change", priority: "navigation" },
  property_page: { description: "A listing's detail page", priority: "engagement" },
  brochure_download: { description: "Brochure PDF download button", priority: "engagement" },
  enquiry_form_submit: { description: "Enquiry form (contact, viewing, referral, property), successful submission", priority: "conversion" },
  newsletter_submit: { description: "Footer newsletter form, submitted", priority: "conversion" },
  header_contact: { description: 'Header "Contact" button (desktop)', priority: "engagement" },
  mobile_menu_contact: { description: 'Mobile menu "Contact" button', priority: "engagement" },
  hero_primary_cta: { description: "Landing hero, primary call to action", priority: "engagement" },
  hero_secondary_cta: { description: "Landing hero, secondary call to action", priority: "engagement" },
  showcase_cta: { description: "Landing showcase section call to action", priority: "engagement" },
  contact_cta_viewing: { description: 'Landing contact band "Book a viewing"', priority: "engagement" },
  contact_cta_email: { description: "Landing contact band email link", priority: "engagement" },
  contact_phone: { description: "A tap on the phone number", priority: "engagement" },
  sister_development: { description: "A card or link to another development's website", priority: "navigation" },
  nav_properties: { description: 'Main navigation "Properties" (leaves for the developer site)', priority: "navigation" },
  footer_social: { description: "Footer social media link", priority: "navigation" },
} as const satisfies Record<string, { description: string; priority: AnalyticsPriority }>;

export type AnalyticsTag = keyof typeof TAGS;

/** Flat values only — GA4 can't take nested objects. Never put user-typed values here. */
export type AnalyticsMeta = Record<string, string | number | boolean>;

/** What a component passes in. Everything else is filled in by `track()`. */
export interface TrackInput {
  name: EventName;
  tag: AnalyticsTag;
  meta?: AnalyticsMeta;
  /**
   * Count at most once per session ('session') or once per page per session ('page').
   * Use for intent/impression events where repeats add noise, not signal.
   */
  once?: "session" | "page";
}

/**
 * Where a session came from. Captured once, from the landing URL, when the session starts,
 * and copied onto every event in that session.
 */
export interface Attribution {
  /** Hostname of the external site that linked here (e.g. "www.google.com"). Null for direct visits and internal navigation. */
  referrer: string | null;
  utm_source: string | null; // where: instagram, google, newsletter
  utm_medium: string | null; // channel type: cpc, paid_social, email
  utm_campaign: string | null; // which promotion: lekki_launch
  utm_term: string | null; // paid search keyword
  utm_content: string | null; // which ad/link variant was clicked
  /** Google Ads auto-tagging click id. Present = came from a Google ad, even without UTMs. */
  gclid: string | null;
  /** Meta (Facebook/Instagram) click id. Present = came from a Meta link or ad. */
  fbclid: string | null;
}

export interface AnalyticsEvent extends Attribution {
  website_id: string; // identifies the website in a shared analytics database
  event_id: string; // idempotency key — backend rejects duplicates
  name: EventName;
  tag: AnalyticsTag;
  priority: AnalyticsPriority;
  visitor_id: string;
  session_id: string;
  seq: number; // order within the session
  page_path: string;
  device_type: DeviceType;
  viewport_width: number;
  language: string;
  env: AppEnv;
  schema_version: number;
  client_ts: string; // ISO; server adds its own server_ts
  meta?: AnalyticsMeta;
}
