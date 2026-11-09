import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { legalPages } from "@/content/marketing/about";

type Params = { params: Promise<{ slug: string }> };
type LegalSlug = keyof typeof legalPages;

const isLegalSlug = (slug: string): slug is LegalSlug => slug in legalPages;

export function generateStaticParams() {
  return Object.keys(legalPages).map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  return isLegalSlug(slug) ? { title: legalPages[slug].title, robots: { index: true, follow: true } } : {};
}

export default async function LegalPage({ params }: Params) {
  const { slug } = await params;
  if (!isLegalSlug(slug)) notFound();
  const page = legalPages[slug];
  return (
    <>
      <PageIntro title={page.title} />
      <article className="container-lux max-w-3xl space-y-5 pb-24 text-sm leading-relaxed text-muted-foreground md:text-base">
        {page.body.map((p) => <p key={p.slice(0, 24)}>{p}</p>)}
      </article>
    </>
  );
}
