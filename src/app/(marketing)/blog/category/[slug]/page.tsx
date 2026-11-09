import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BlogIndex } from "@/components/marketing/blog/BlogIndex";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadBlog } from "@/features/marketing/services/ContentSource";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return (await loadBlog()).categories().map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const category = (await loadBlog()).category((await params).slug);
  return category ? { title: `${category.name} — The Journal`, alternates: { canonical: `/blog/category/${category.slug}` } } : {};
}

export default async function BlogCategoryPage({ params }: Params) {
  const category = (await loadBlog()).category((await params).slug);
  if (!category) notFound();
  return (
    <>
      <PageIntro eyebrow="The Journal" title={category.name} />
      <BlogIndex posts={(await loadBlog()).byCategory(category.slug)} categories={(await loadBlog()).categories()} activeCategory={category.slug} />
    </>
  );
}
