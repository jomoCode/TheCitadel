/** Mirrors backend app/contracts/marketing/property.py and lead.py. */
import type { PropertyStatus } from "@/features/marketing/types";

export type ListingPhoto = { id: string; url: string; alt: string; position: number };

export type Listing = {
  id: string;
  slug: string;
  name: string;
  property_type: string;
  neighbourhood: string;
  city: string;
  address: string;
  price_from_kobo: number;
  bedrooms_min: number;
  bedrooms_max: number;
  status: PropertyStatus;
  summary: string;
  description: string[];
  features: string[];
  featured: boolean;
  is_published: boolean;
  seo_title: string | null;
  seo_description: string | null;
  photos: ListingPhoto[];
  enquiry_count: number;
  updated_at: string;
};

export type ListingInput = {
  name?: string;
  property_type?: string;
  neighbourhood?: string;
  city?: string;
  address?: string;
  price_from_kobo?: number;
  bedrooms_min?: number;
  bedrooms_max?: number;
  status?: PropertyStatus;
  summary?: string;
  description?: string[];
  features?: string[];
  featured?: boolean;
  is_published?: boolean;
  seo_title?: string | null;
  seo_description?: string | null;
};

export type Enquiry = {
  id: string;
  reference: string;
  enquiry_type: string;
  name: string;
  email: string;
  phone: string | null;
  property_id: string | null;
  property_name: string | null;
  property_slug: string | null;
  message: string | null;
  source_page: string | null;
  source: string | null;
  attribution: Record<string, string>;
  handled: boolean;
  handled_at: string | null;
  handled_by_name: string | null;
  created_at: string;
};

export type EnquiryNote = { id: string; body: string; author_name: string | null; created_at: string };
export type EnquiryDetail = Enquiry & { notes: EnquiryNote[]; other_enquiries: Enquiry[] };
export type EnquiryCounts = { open: number; today: number };
export type HandledFilter = "open" | "handled" | "all";

export const ENQUIRY_TYPE_LABELS: Record<string, string> = {
  general: "General", property: "About a property", viewing: "Viewing request", purchase: "Wants to buy", rental: "Rental",
  landowner: "Landowner", partnership: "Partnership", referral: "Referral", newsletter: "Newsletter",
};
