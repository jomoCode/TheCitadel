import type { BlogCategory, BlogPost } from "@/features/marketing/types";

/**
 * Read-side queries over journal articles. Built per request from `loadBlog()` (ContentSource.ts).
 * Only posts whose publish date has passed are ever returned (drafts/scheduled stay hidden).
 */
export class BlogService {
  constructor(
    private readonly posts: readonly BlogPost[],
    private readonly categoryList: readonly BlogCategory[],
    private readonly now: () => Date = () => new Date(),
  ) {}

  published(): BlogPost[] {
    const now = this.now().getTime();
    return this.posts
      .filter((post) => new Date(post.publishedAt).getTime() <= now)
      .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt));
  }

  latest(limit = 3): BlogPost[] {
    return this.published().slice(0, limit);
  }

  bySlug(slug: string): BlogPost | undefined {
    return this.published().find((post) => post.slug === slug);
  }

  byCategory(categorySlug: string): BlogPost[] {
    return this.published().filter((post) => post.category.slug === categorySlug);
  }

  byTag(tag: string): BlogPost[] {
    const wanted = tag.toLowerCase();
    return this.published().filter((post) => post.tags.some((t) => t.toLowerCase() === wanted));
  }

  search(query: string): BlogPost[] {
    const q = query.trim().toLowerCase();
    if (!q) return this.published();
    return this.published().filter((post) =>
      [post.title, post.excerpt, ...post.tags].some((text) => text.toLowerCase().includes(q)),
    );
  }

  related(post: BlogPost, limit = 3): BlogPost[] {
    return this.published()
      .filter((p) => p.slug !== post.slug)
      .map((p) => ({ p, score: Number(p.category.slug === post.category.slug) * 2 + p.tags.filter((t) => post.tags.includes(t)).length }))
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map(({ p }) => p);
  }

  categories(): BlogCategory[] {
    return [...this.categoryList];
  }

  category(slug: string): BlogCategory | undefined {
    return this.categoryList.find((c) => c.slug === slug);
  }
}

