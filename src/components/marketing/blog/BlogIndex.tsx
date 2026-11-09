import Link from "next/link";
import { PostCard } from "@/components/marketing/blog/PostCard";
import type { BlogCategory, BlogPost } from "@/features/marketing/types";
import { cn } from "@/lib/utils/cn";

type BlogIndexProps = { posts: BlogPost[]; categories: BlogCategory[]; activeCategory?: string; query?: string };

/** Category chips + search + post grid. Shared by /blog, category and tag pages. */
export function BlogIndex({ posts, categories, activeCategory, query }: BlogIndexProps) {
  return (
    <section className="container-lux pb-24">
      <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
        <nav aria-label="Categories" className="-mx-5 flex gap-2 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:px-0">
          {[{ slug: "", name: "All" }, ...categories].map((c) => {
            const active = (activeCategory ?? "") === c.slug;
            return (
              <Link key={c.slug || "all"} href={c.slug ? `/blog/category/${c.slug}` : "/blog"} aria-current={active ? "page" : undefined}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-xs", active ? "border-foreground bg-foreground text-background" : "border-border hover:border-foreground")}>
                {c.name}
              </Link>
            );
          })}
        </nav>
        <form action="/blog" role="search" className="md:w-72">
          <label htmlFor="blog-search" className="sr-only">Search articles</label>
          <input id="blog-search" name="q" type="search" defaultValue={query} placeholder="Search articles"
            className="h-11 w-full rounded-brand border border-border bg-surface px-4 text-base placeholder:text-muted-foreground focus:border-gold focus:outline-none md:text-sm" />
        </form>
      </div>

      {posts.length === 0 ? (
        <p className="py-24 text-center text-muted-foreground">No articles found{query ? ` for “${query}”` : ""}.</p>
      ) : (
        <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => <PostCard key={post.slug} post={post} className={i === 0 && posts.length > 2 ? "md:col-span-2" : undefined} />)}
        </div>
      )}
    </section>
  );
}
