import { cache } from "react";
import { citadelListing } from "@/content/marketing/citadel";
import { bundledFallbackEnabled } from "@/lib/api/publicFetch";
import type { Property, PropertyStatus } from "../types";
import { PropertyCatalog } from "./PropertyCatalog";

/** Listings are re-fetched at most once a minute, so admin changes appear on the website within about 60 seconds. */
export const PROPERTY_REVALIDATE_SECONDS = 60;
export const FALLBACK_IMAGE = { src: "/images/hero/hero-buildings-dusk.jpg", alt: "Citadel development" };

/** Shape returned by GET /public/properties (backend app/contracts/marketing/property.py → PublicProperty). */
export type ApiProperty = {
  slug: string; name: string; property_type: string; neighbourhood: string; city: string; address: string;
  price_from_kobo: number; bedrooms_min: number; bedrooms_max: number; status: PropertyStatus; summary: string;
  description: string[]; features: string[]; amenities: string[]; units: string; completion: string | null;
  payment_plan: boolean; featured: boolean; seo_title: string | null; seo_description: string | null;
  photos: { url: string; alt: string }[];
};

function bedroomsText(min: number, max: number): string {
  if (max <= 0) return "";
  const range = min === max || min <= 0 ? `${max}` : `${min}–${max}`;
  return `${range}-bedroom homes`;
}

export function fromApi(p: ApiProperty): Property {
  const images = p.photos.length ? p.photos.map((x) => ({ src: x.url, alt: x.alt || p.name })) : [FALLBACK_IMAGE];
  return {
    slug: p.slug, name: p.name, type: p.property_type, neighbourhood: p.neighbourhood, city: p.city, address: p.address,
    priceFrom: Math.round(p.price_from_kobo / 100), status: p.status, units: p.units || bedroomsText(p.bedrooms_min, p.bedrooms_max) || p.name,
    bedroomsMin: p.bedrooms_min, bedroomsMax: p.bedrooms_max, completion: p.completion ?? "", paymentPlan: p.payment_plan, featured: p.featured,
    summary: p.summary, description: p.description.length ? p.description : [p.summary].filter(Boolean), features: p.features, amenities: p.amenities,
    images, seo: { title: p.seo_title || p.name, description: p.seo_description || p.summary },
  };
}

/**
 * What to show when the API can't be reached. Production shows nothing rather than risk showing a hidden or
 * deleted listing; development shows the bundled copy of The Citadel. Override with CONTENT_FALLBACK=seed|none.
 */
export function fallbackProperties(): Property[] {
  return bundledFallbackEnabled() ? [citadelListing] : [];
}

/** Server-side only. De-duplicated per request (React cache) and cached across requests by Next for a minute. */
export const loadProperties = cache(async (): Promise<Property[]> => {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";
  try {
    const response = await fetch(`${base}/public/properties`, {
      next: { revalidate: PROPERTY_REVALIDATE_SECONDS, tags: ["properties"] },
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return ((await response.json()) as ApiProperty[]).map(fromApi);
  } catch (error) {
    console.error(`PropertySource.ts/loadProperties(): could not load listings from ${base} — ${String(error)}`);
    return fallbackProperties();
  }
});

export const loadCatalog = async () => new PropertyCatalog(await loadProperties());
