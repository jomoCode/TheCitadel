/** Mirrors backend app/contracts/marketing/post.py, content.py and insights.py. */
import type { BlogBlock } from "@/features/marketing/types";

export type PostStatus = "draft" | "scheduled" | "published" | "archived";
export type Category = { id: string; slug: string; name: string };

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: BlogBlock[];
  featured_image_url: string | null;
  featured_image_alt: string | null;
  author_name: string;
  author_role: string | null;
  category: Category | null;
  tags: string[];
  status: PostStatus;
  published_at: string | null;
  reading_minutes: number;
  seo_title: string | null;
  seo_description: string | null;
  updated_at: string;
  is_live: boolean;
};

export type PostInput = Partial<{
  title: string; excerpt: string; body: BlogBlock[]; author_name: string; author_role: string | null; category_id: string | null;
  tags: string[]; featured_image_alt: string; seo_title: string | null; seo_description: string | null;
}>;

export type Contact = { phone: string; mobile: string; email: string; address: string; hours: string; mapQuery: string };
export type SocialLink = { name: string; href: string };
export type SiteSettings = { contact: Contact; socials: SocialLink[]; updated_at?: string | null };

export type Faq = { id: string; topic: string; question: string; answer: string; sort_order: number; is_published: boolean };
export type FaqInput = { topic: string; question: string; answer: string; is_published?: boolean };

export type Testimonial = {
  id: string; name: string; location: string | null; purchase: string | null; quote: string; rating: number;
  image_url: string | null; is_published: boolean; sort_order: number;
};
export type TestimonialInput = { name: string; location?: string | null; purchase?: string | null; quote: string; rating?: number; consent_confirmed?: boolean };

export type PageSeo = { path: string; title: string | null; description: string | null; image_url: string | null; updated_at: string | null };

export type Ranked = { label: string; value: number; href: string | null };
export type DayPoint = { day: string; page_views: number; visitors: number; enquiries: number };
export type Insights = {
  days: number; page_views: number; visitors: number; property_views: number; enquiries: number; enquiry_rate: number; previous_enquiries: number;
  daily: DayPoint[]; top_pages: Ranked[]; top_properties: Ranked[]; enquiries_by_source: Ranked[]; enquiries_by_type: Ranked[]; enquiries_by_property: Ranked[];
};

export const POST_STATUS_LABELS: Record<PostStatus, string> = { draft: "Draft", scheduled: "Scheduled", published: "Published", archived: "Archived" };
