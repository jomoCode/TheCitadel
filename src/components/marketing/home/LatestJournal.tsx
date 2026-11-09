import Link from "next/link";
import { PostCard } from "@/components/marketing/blog/PostCard";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { loadBlog } from "@/features/marketing/services/ContentSource";

export async function LatestJournal() {
  const posts = (await loadBlog()).latest(3);
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <div className="container-lux">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="The Journal" title="Insight & news" intro="Buying advice, market thinking and the latest from Citadel." />
          <Link href="/blog" className="text-nav hidden shrink-0 border-b border-gold pb-1 hover:text-gold md:inline-block">All articles</Link>
        </div>
        <div className="mt-12 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.1}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
