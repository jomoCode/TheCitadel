import type { Metadata } from "next";
import { EnquiryForm } from "@/components/marketing/forms/EnquiryForm";
import { PhotoHero } from "@/components/marketing/primitives/PhotoHero";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { InfoTip } from "@/components/ui/InfoTip";
import { referralContent } from "@/content/marketing/about";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/referral", {
    title: "Referral Programme — Earn as You Refer",
    description: "Introduce a buyer to Citadel and earn 1% of the sale value once their purchase completes.",
  });
}

export default function ReferralPage() {
  const { heroImage, commission, steps, terms } = referralContent;
  return (
    <>
      <PhotoHero image={heroImage} eyebrow="Referral programme" title="Earn as you refer.">
        <p className="mt-4 flex max-w-xl items-center gap-1 text-sm text-white/85 md:text-base">
          Introduce someone who buys a Citadel home and earn {commission} of the sale value.
          <InfoTip tip="marketing.referral" className="text-white/80" />
        </p>
      </PhotoHero>

      <section className="container-lux py-20 md:py-28">
        <SectionHeading eyebrow="How it works" title="Four simple steps" align="center" />
        <ol className="mt-14 grid gap-8 md:grid-cols-4">
          {steps.map((step, i) => (
            <Reveal as="li" key={step.title} delay={i * 0.08} className="text-center">
              <span className="mx-auto flex size-14 items-center justify-center rounded-full border border-gold font-display text-xl text-gold">{i + 1}</span>
              <h3 className="mt-5 font-display text-xl">{step.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      <section className="bg-surface-muted py-20 md:py-28">
        <div className="container-lux grid gap-14 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Good to know" title="Programme terms" />
            <ul className="mt-8 space-y-4 text-sm text-muted-foreground">
              {terms.map((t) => <li key={t} className="border-l-2 border-gold pl-4">{t}</li>)}
            </ul>
          </div>
          <div className="rounded-lg border border-border bg-background p-6 md:p-10">
            <p className="mb-6 font-display text-2xl">Become a referrer</p>
            <EnquiryForm compact defaultType="referral" />
          </div>
        </div>
      </section>
    </>
  );
}
