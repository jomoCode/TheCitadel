import { afterEach, describe, expect, it, vi } from "vitest";
import { pageMetadata, postFromApi } from "@/features/marketing/services/ContentSource";


describe("journal mapping", () => {
  it("fills in a cover and category when an article has none", () => {
    const post = postFromApi({ slug: "a", title: "A", excerpt: "E", body: [], featured_image_url: null, featured_image_alt: null, author_name: "Team", author_role: null,
      category: null, tags: [], published_at: "2026-11-08T10:00:00Z", reading_minutes: 2, seo_title: null, seo_description: null });
    expect(post.category).toEqual({ slug: "journal", name: "Journal" });
    expect(post.featuredImage.src).toMatch(/^\/images\//);
    expect(post.seo).toEqual({ title: "A", description: "E" });
  });
});

describe("pageMetadata", () => {
  afterEach(() => vi.unstubAllGlobals());
  it("uses the team's search text when set, and the built-in text otherwise", async () => {
    vi.stubGlobal("fetch", vi.fn(async () => new Response(JSON.stringify([{ path: "/about", title: "About Quo", description: null, image_url: null }]))));
    const about = await pageMetadata("/about", { title: "About Us", description: "Built-in" });
    expect(about).toMatchObject({ title: "About Quo", description: "Built-in", alternates: { canonical: "/about" } });
    const faq = await pageMetadata("/faq", { title: "FAQs", description: "Answers" });
    expect(faq.title).toBe("FAQs");
  });
});
