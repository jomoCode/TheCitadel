import type { Metadata } from "next";
import { cache } from "react";
import { blogCategories, blogPosts } from "@/content/blog/posts";
import { faqs as bundledFaqs } from "@/content/marketing/faqs";
import { siteConfig } from "@/content/marketing/site";
import { BlogService } from "@/features/blog/services/BlogService";
import { publicFetch, bundledFallbackEnabled } from "@/lib/api/publicFetch";
import type { BlogBlock, BlogCategory, BlogPost, Faq, Testimonial } from "../types";

// ── API shapes (backend app/contracts/marketing/post.py & content.py) ─────
type ApiPost = {
  slug: string; title: string; excerpt: string; body: BlogBlock[]; featured_image_url: string | null; featured_image_alt: string | null;
  author_name: string; author_role: string | null; category: { slug: string; name: string } | null; tags: string[]; published_at: string;
  reading_minutes: number; seo_title: string | null; seo_description: string | null;
};
export type Contact = { phone: string; mobile: string; email: string; address: string; hours: string; mapQuery: string };
export type SiteSettings = { contact: Contact; socials: { name: string; href: string }[] };
type ApiFaq = { topic: string; question: string; answer: string };
type ApiTestimonial = { id: string; name: string; location: string | null; purchase: string | null; quote: string; rating: number; image_url: string | null };
type ApiPageSeo = { path: string; title: string | null; description: string | null; image_url: string | null };

const UNCATEGORISED: BlogCategory = { slug: "journal", name: "Journal" };
const COVER_FALLBACK = { src: "/images/hero/interior-lounge.jpg", alt: "The Citadel journal" };

export function postFromApi(p: ApiPost): BlogPost {
  return {
    slug: p.slug, title: p.title, excerpt: p.excerpt, body: p.body, tags: p.tags, publishedAt: p.published_at, readingMinutes: p.reading_minutes,
    author: { name: p.author_name, role: p.author_role ?? "" }, category: p.category ?? UNCATEGORISED,
    featuredImage: p.featured_image_url ? { src: p.featured_image_url, alt: p.featured_image_alt || p.title } : COVER_FALLBACK,
    seo: { title: p.seo_title || p.title, description: p.seo_description || p.excerpt },
  };
}

// ── Journal ───────────────────────────────────────────────────────────────
export const loadBlog = cache(async (): Promise<BlogService> => {
  const fallback = bundledFallbackEnabled();
  const [posts, categories] = await Promise.all([
    publicFetch<ApiPost[] | null>("/public/posts", () => null, "posts").then((rows) => rows?.map(postFromApi) ?? null),
    publicFetch<BlogCategory[] | null>("/public/post-categories", () => null, "posts"),
  ]);
  return new BlogService(posts ?? (fallback ? blogPosts : []), categories ?? (fallback ? blogCategories : []));
});

// ── Contact details ───────────────────────────────────────────────────────
const bundledSettings = (): SiteSettings => ({ contact: { ...siteConfig.contact }, socials: siteConfig.socials.map((s) => ({ ...s })) });

/** Contact details and social links. Falls back to the bundled copy (also in production) — better than a site with no way to reach you. */
export const loadSiteSettings = cache(async (): Promise<SiteSettings> => {
  const row = await publicFetch<Partial<SiteSettings> | null>("/public/site", () => null, "site");
  const base = bundledSettings();
  return { contact: { ...base.contact, ...(row?.contact ?? {}) }, socials: row?.socials?.length ? row.socials : base.socials };
});

// ── FAQs & testimonials ───────────────────────────────────────────────────
export const loadFaqs = cache(async (): Promise<Faq[]> =>
  publicFetch<ApiFaq[]>("/public/faqs", () => (bundledFallbackEnabled() ? bundledFaqs : []), "faqs").then((rows) =>
    rows.map((f) => ({ topic: f.topic as Faq["topic"], question: f.question, answer: f.answer }))));

/** Only real, consented testimonials the team has published. Never falls back to the dummy ones. */
export const loadTestimonials = cache(async (): Promise<Testimonial[]> =>
  publicFetch<ApiTestimonial[]>("/public/testimonials", () => [], "testimonials").then((rows) =>
    rows.map((t) => ({
      id: t.id, name: t.name, location: t.location ?? "", purchase: t.purchase ?? "", quote: t.quote, rating: t.rating as Testimonial["rating"],
      image: t.image_url ? { src: t.image_url, alt: t.name } : undefined,
    }))));

// ── Page SEO ──────────────────────────────────────────────────────────────
const loadPageSeo = cache(async (): Promise<Record<string, ApiPageSeo>> =>
  Object.fromEntries((await publicFetch<ApiPageSeo[]>("/public/page-seo", () => [], "page-seo")).map((p) => [p.path, p])));

/** Page metadata with any search-engine text the team has set in the admin (Website → Site content → Search engines). */
export async function pageMetadata(path: string, defaults: Metadata & { title: string; description: string }): Promise<Metadata> {
  const override = (await loadPageSeo())[path];
  const title = override?.title || defaults.title;
  const description = override?.description || defaults.description;
  return {
    ...defaults,
    title: path === "/" ? { absolute: title } : title,
    description,
    alternates: { canonical: path, ...defaults.alternates },
    openGraph: { ...defaults.openGraph, title, description, ...(override?.image_url ? { images: [{ url: override.image_url }] } : {}) },
  };
}
