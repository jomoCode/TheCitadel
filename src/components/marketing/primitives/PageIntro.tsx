import { EyebrowPill } from "./SectionHeading";

type PageIntroProps = { eyebrow?: string; title: string; highlight?: string; intro?: string; children?: React.ReactNode };

/** Title block for pages without a photo hero. Pads below the fixed header. */
export function PageIntro({ eyebrow, title, highlight, intro, children }: PageIntroProps) {
  return (
    <section className="container-lux pb-10 pt-28 md:pb-14 md:pt-40">
      {eyebrow && <EyebrowPill>{eyebrow}</EyebrowPill>}
      <h1 className="mt-5 max-w-4xl font-display text-4xl leading-[1.05] tracking-tight md:text-6xl">
        {title}
        {highlight && <span className="block italic text-gold">{highlight}</span>}
      </h1>
      {intro && <p className="mt-5 max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">{intro}</p>}
      {children}
    </section>
  );
}
