import { describe, expect, it } from "vitest";
import { BlogService } from "@/features/blog/services/BlogService";
import type { BlogPost } from "@/features/marketing/types";

const category = { slug: "news", name: "News" };
const make = (slug: string, publishedAt: string, tags: string[] = []): BlogPost => ({
  slug,
  title: `Title ${slug}`,
  excerpt: `Excerpt ${slug}`,
  author: { name: "A", role: "B" },
  category,
  tags,
  publishedAt,
  readingMinutes: 3,
  featuredImage: { src: "/x.jpg", alt: "" },
  body: [],
  seo: { title: "", description: "" },
});

describe("BlogService", () => {
  const posts = [make("old", "2026-01-01", ["Lagos"]), make("new", "2026-10-01", ["Lagos", "Tips"]), make("future", "2027-06-01")];
  const service = new BlogService(posts, [category], () => new Date("2026-11-08"));

  it("hides posts scheduled in the future", () => {
    expect(service.published().map((p) => p.slug)).toEqual(["new", "old"]);
    expect(service.bySlug("future")).toBeUndefined();
  });

  it("sorts newest first and limits latest()", () => {
    expect(service.latest(1)[0].slug).toBe("new");
  });

  it("searches title, excerpt and tags case-insensitively", () => {
    expect(service.search("TIPS").map((p) => p.slug)).toEqual(["new"]);
    expect(service.search("")).toHaveLength(2);
  });

  it("filters by tag and category", () => {
    expect(service.byTag("lagos")).toHaveLength(2);
    expect(service.byCategory("news")).toHaveLength(2);
  });

  it("related() excludes the current post", () => {
    const related = service.related(posts[1]);
    expect(related.map((p) => p.slug)).toEqual(["old"]);
  });
});
