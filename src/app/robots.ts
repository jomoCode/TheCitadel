import type { MetadataRoute } from "next";
import { siteConfig } from "@/content/marketing/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/admin", "/resident", "/security", "/login", "/api"] }],
    sitemap: `${siteConfig.url}/sitemap.xml`,
  };
}
