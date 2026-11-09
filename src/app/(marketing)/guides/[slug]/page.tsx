import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EnquiryForm } from "@/components/marketing/forms/EnquiryForm";
import { PhotoHero } from "@/components/marketing/primitives/PhotoHero";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { guides } from "@/content/marketing/guides";
import { cn } from "@/lib/utils/cn";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

type Params = { params: Promise<{ slug: string }> };

const findGuide = (slug: string) => guides.find((g) => g.slug === slug);

export function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const guide = findGuide((await params).slug);
  return guide ? pageMetadata(`/guides/${guide.slug}`, { title: guide.title, description: guide.intro }) : {};
}

export default async function GuidePage({ params }: Params) {
  const guide = findGuide((await params).slug);
  if (!guide) notFound();

  return (
    <>
      <PhotoHero image={guide.image} eyebrow="Buy · Rent · Sell" title={guide.title}>
        <p className="mt-4 max-w-xl text-sm text-white/85 md:text-base">{guide.intro}</p>
      </PhotoHero>

      <nav aria-label="Guides" className="container-lux mt-8 flex gap-2 overflow-x-auto [scrollbar-width:none]">
        {guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className={cn("shrink-0 rounded-full border px-4 py-2 text-xs", g.slug === guide.slug ? "border-foreground bg-foreground text-background" : "border-border")}>
            {g.title.replace(/ (a Citadel home|with Citadel|with us)$/, "")}
          </Link>
        ))}
      </nav>

      <section className="container-lux grid gap-14 py-16 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-20">
        <ol className="space-y-10">
          {guide.steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.05} className="flex gap-6">
              <span className="font-display text-4xl leading-none text-gold md:text-5xl">{String(i + 1).padStart(2, "0")}</span>
              <div className="border-b border-border pb-8">
                <h2 className="font-display text-2xl">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground md:text-base">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </ol>
        <aside className="h-fit rounded-lg border border-border bg-surface p-6 md:p-8 lg:sticky lg:top-28">
          <p className="font-display text-2xl">Ready to start?</p>
          <p className="mb-6 mt-1 text-sm text-muted-foreground">Send us your details and an adviser will guide you through every step.</p>
          <EnquiryForm compact defaultType={guide.enquiryType} />
        </aside>
      </section>
    </>
  );
}
