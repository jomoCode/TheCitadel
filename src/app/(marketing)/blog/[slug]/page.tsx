import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArticleBody } from "@/components/marketing/blog/ArticleBody";
import { PostCard } from "@/components/marketing/blog/PostCard";
import { ShareButtons } from "@/components/marketing/blog/ShareButtons";
import { ArticleJsonLd } from "@/components/marketing/seo/JsonLd";
import { siteConfig } from "@/content/marketing/site";
import { loadBlog } from "@/features/marketing/services/ContentSource";

export const revalidate = 60;
import { formatLongDate } from "@/lib/utils/format";

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadBlog()).published().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const post = (await loadBlog()).bySlug((await params).slug);
  if (!post) return {};
  return {
    title: post.seo.title,
    description: post.seo.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: { type: "article", publishedTime: post.publishedAt, authors: [post.author.name], images: [{ url: post.featuredImage.src, alt: post.featuredImage.alt }] },
  };
}

export default async function ArticlePage({ params }: Params) {
  const blog = await loadBlog();
  const post = blog.bySlug((await params).slug);
  if (!post) notFound();
  const related = blog.related(post);

  return (
    <article>
      <ArticleJsonLd post={post} />
      <header className="container-lux max-w-3xl pb-10 pt-28 text-center md:pt-40">
        <Link href={`/blog/category/${post.category.slug}`} className="text-eyebrow text-gold">{post.category.name}</Link>
        <h1 className="mt-5 font-display text-4xl leading-[1.1] md:text-6xl">{post.title}</h1>
        <p className="mt-6 text-sm text-muted-foreground">
          By {post.author.name}, {post.author.role} · <time dateTime={post.publishedAt}>{formatLongDate(post.publishedAt)}</time> · {post.readingMinutes} min read
        </p>
      </header>

      <div className="relative mx-auto aspect-[16/9] max-w-6xl overflow-hidden md:rounded-brand">
        <Image src={post.featuredImage.src} alt={post.featuredImage.alt} fill priority sizes="(min-width: 1152px) 1152px, 100vw" className="object-cover" />
      </div>

      <div className="container-lux max-w-3xl py-14 md:py-20">
        <p className="mb-10 font-display text-xl leading-relaxed text-muted-foreground md:text-2xl">{post.excerpt}</p>
        <ArticleBody blocks={post.body} />
        <footer className="mt-14 space-y-6 border-t border-border pt-8">
          <ul className="flex flex-wrap gap-2">
            {post.tags.map((tag) => (
              <li key={tag}><Link href={`/blog/tag/${encodeURIComponent(tag)}`} className="rounded-full bg-surface-muted px-3 py-1.5 text-xs hover:text-gold">#{tag}</Link></li>
            ))}
          </ul>
          <ShareButtons title={post.title} url={`${siteConfig.url}/blog/${post.slug}`} />
        </footer>
      </div>

      {related.length > 0 && (
        <section className="bg-surface-muted py-20">
          <div className="container-lux">
            <h2 className="font-display text-3xl">Keep reading</h2>
            <div className="mt-10 grid gap-10 md:grid-cols-3">{related.map((p) => <PostCard key={p.slug} post={p} />)}</div>
          </div>
        </section>
      )}
    </article>
  );
}
