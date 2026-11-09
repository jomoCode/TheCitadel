import { Plus } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadFaqs, pageMetadata } from "@/features/marketing/services/ContentSource";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/faq", {
    title: "Frequently Asked Questions",
    description: "Answers about buying, living at and visiting The Citadel, Asokoro.",
  });
}

export const revalidate = 60;

export default async function FaqPage() {
  const faqs = await loadFaqs();
  const topics = [...new Set(faqs.map((f) => f.topic))];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({ "@type": "Question", name: f.question, acceptedAnswer: { "@type": "Answer", text: f.answer } })),
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <PageIntro eyebrow="FAQs" title="Questions," highlight="answered." intro="Can't find what you are looking for? Our advisers are a call or message away." />
      <section className="container-lux max-w-4xl space-y-14 pb-24">
        {topics.map((topic) => (
          <div key={topic}>
            <h2 className="text-eyebrow text-gold">{topic}</h2>
            <div className="mt-4 divide-y divide-border border-y border-border">
              {faqs.filter((f) => f.topic === topic).map((faq) => (
                <details key={faq.question} className="group py-5">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-display text-lg md:text-xl">
                    {faq.question}
                    <Plus className="size-4 shrink-0 text-gold transition-transform group-open:rotate-45" aria-hidden />
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        ))}
        <p className="text-sm text-muted-foreground">
          Still have a question? <Link href="/contact" className="text-foreground underline underline-offset-4 hover:text-gold">Contact our team</Link>.
        </p>
      </section>
    </>
  );
}
