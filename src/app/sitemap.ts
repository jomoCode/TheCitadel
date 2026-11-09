import type { MetadataRoute } from "next";
import { guides } from "@/content/marketing/guides";
import { siteConfig } from "@/content/marketing/site";
import { loadBlog } from "@/features/marketing/services/ContentSource";
import { loadProperties } from "@/features/marketing/services/PropertySource";

/** XML sitemap generated from live content (PRD §13). */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [properties, blog] = await Promise.all([loadProperties(), loadBlog()]);
  const base = siteConfig.url;
  const staticPaths = ["", "/properties", "/about", "/contact", "/blog", "/faq", "/referral"];
  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, changeFrequency: "weekly" as const, priority: path === "" ? 1 : 0.7 })),
    ...guides.map((g) => ({ url: `${base}/guides/${g.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...properties.map((p) => ({ url: `${base}/properties/${p.slug}`, changeFrequency: "weekly" as const, priority: 0.9 })),
    ...blog.categories().map((c) => ({ url: `${base}/blog/category/${c.slug}`, changeFrequency: "weekly" as const, priority: 0.5 })),
    ...blog.published().map((post) => ({ url: `${base}/blog/${post.slug}`, lastModified: post.publishedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
  ];
}
