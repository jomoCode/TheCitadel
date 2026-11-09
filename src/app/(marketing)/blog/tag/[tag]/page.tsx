import type { Metadata } from "next";
import { BlogIndex } from "@/components/marketing/blog/BlogIndex";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadBlog } from "@/features/marketing/services/ContentSource";

type Params = { params: Promise<{ tag: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const tag = decodeURIComponent((await params).tag);
  return { title: `Articles tagged “${tag}”`, robots: { index: false, follow: true } };
}

export default async function BlogTagPage({ params }: Params) {
  const tag = decodeURIComponent((await params).tag);
  return (
    <>
      <PageIntro eyebrow="Tag" title={tag} />
      <BlogIndex posts={(await loadBlog()).byTag(tag)} categories={(await loadBlog()).categories()} />
    </>
  );
}
