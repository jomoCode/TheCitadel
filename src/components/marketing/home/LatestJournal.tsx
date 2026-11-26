import Link from "next/link";
import { PostCard } from "@/components/marketing/blog/PostCard";
import { PostCardSkeleton } from "@/components/marketing/blog/PostCardSkeleton";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { loadBlog } from "@/features/marketing/services/ContentSource";

const SLOTS = 3;

export async function LatestJournal() {
  const posts = (await loadBlog()).latest(SLOTS);
  if (posts.length === 0) return null;

  return (
    <section className="bg-surface-muted py-14 md:py-20">
      <div className="container-lux">
        <div className="flex items-end justify-between gap-6">
          <SectionHeading eyebrow="The Journal" title="Insight & news" intro="Buying advice, market thinking and the latest from Citadel." />
          <Link href="/blog" className="text-nav hidden shrink-0 border-b border-gold pb-1 hover:text-gold md:inline-block">All articles</Link>
        </div>
        <div className="mt-10 grid gap-10 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.1}>
              <PostCard post={post} />
            </Reveal>
          ))}
          {/* Top the row up to a full set so a young journal doesn't leave the section looking empty. Placeholders
              only fill a row (2 columns on tablet, 3 on desktop); phones stack cards, so they get none. */}
          {Array.from({ length: SLOTS - posts.length }, (_, i) => {
            const slot = posts.length + i;
            return (
              <Reveal key={`placeholder-${i}`} delay={slot * 0.1} className={slot < 2 ? "hidden md:block" : "hidden lg:block"}>
                <PostCardSkeleton />
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
