import Image from "next/image";
import Link from "next/link";
import type { BlogPost } from "@/features/marketing/types";
import { cn } from "@/lib/utils/cn";
import { formatLongDate } from "@/lib/utils/format";

export function PostCard({ post, className }: { post: BlogPost; className?: string }) {
  return (
    <article className={cn("group relative", className)}>
      <div className="relative aspect-[3/2] overflow-hidden rounded-brand bg-surface-muted">
        <Image src={post.featuredImage.src} alt={post.featuredImage.alt} fill sizes="(min-width: 1024px) 33vw, 100vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
      </div>
      <p className="text-eyebrow mt-5 text-gold">
        {post.category.name} · <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time>
      </p>
      <h3 className="mt-2 font-display text-xl leading-snug md:text-2xl">
        <Link href={`/blog/${post.slug}`} className="after:absolute after:inset-0">{post.title}</Link>
      </h3>
      <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
      <p className="mt-3 text-xs text-muted-foreground">{post.readingMinutes} min read</p>
    </article>
  );
}
