import type { Metadata } from "next";
import { BlogIndex } from "@/components/marketing/blog/BlogIndex";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadBlog } from "@/features/marketing/services/ContentSource";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/blog", {
    title: "The Journal — Property Insight & News",
    description: "Buying guides, Abuja living and news from The Citadel, Asokoro.",
  });
}

type Props = { searchParams: Promise<{ q?: string }> };

export default async function BlogPage({ searchParams }: Props) {
  const { q } = await searchParams;
  return (
    <>
      <PageIntro eyebrow="The Journal" title="Insight, ideas" highlight="& news." intro="Practical advice for buyers and investors, and the latest from Citadel." />
      <BlogIndex posts={(await loadBlog()).search(q ?? "")} categories={(await loadBlog()).categories()} query={q} />
    </>
  );
}
