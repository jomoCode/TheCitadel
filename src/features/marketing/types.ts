export type PropertyStatus = "selling" | "offPlan" | "ready" | "soldOut";
/** Free text managed in the admin panel (e.g. "Apartments", "Terraces", "Detached Duplexes"). */
export type PropertyType = string;

export type MarketingImage = { src: string; alt: string };

export type Property = {
  slug: string;
  name: string;
  type: PropertyType;
  neighbourhood: string;
  city: string;
  address: string;
  priceFrom: number; // naira
  status: PropertyStatus;
  units: string; // e.g. "Studio to 3-bedroom + penthouses"
  bedroomsMin: number;
  bedroomsMax: number;
  completion: string;
  paymentPlan: boolean;
  featured: boolean;
  summary: string;
  description: string[];
  features: string[];
  amenities: string[];
  images: MarketingImage[];
  seo: { title: string; description: string };
};

export type Testimonial = {
  id: string;
  name: string;
  location: string;
  purchase: string;
  quote: string;
  rating: 1 | 2 | 3 | 4 | 5;
  image?: MarketingImage;
};

export type BlogCategory = { slug: string; name: string };

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  author: { name: string; role: string };
  category: BlogCategory;
  tags: string[];
  publishedAt: string; // ISO date
  readingMinutes: number;
  featuredImage: MarketingImage;
  /** Simple block content — replaced by CMS rich text when the backend is connected. */
  body: BlogBlock[];
  seo: { title: string; description: string };
};

export type BlogBlock =
  | { kind: "paragraph"; text: string }
  | { kind: "heading"; text: string }
  | { kind: "list"; items: string[] }
  | { kind: "quote"; text: string; cite?: string }
  | { kind: "image"; image: MarketingImage; caption?: string };

export type GuideStep = { title: string; body: string };

export type Guide = {
  slug: "how-to-buy" | "how-to-rent" | "sell-your-land";
  title: string;
  intro: string;
  image: MarketingImage;
  steps: GuideStep[];
  enquiryType: EnquiryType;
};

export type Faq = { question: string; answer: string; topic: "Buying" | "Payments" | "Living" | "Referrals" };

export type EnquiryType =
  | "general"
  | "property"
  | "viewing"
  | "purchase"
  | "rental"
  | "landowner"
  | "partnership"
  | "referral";
