import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { EyebrowPill } from "@/components/marketing/primitives/SectionHeading";
import { CITADEL_SLUG, citadel } from "@/content/marketing/citadel";
import { keyFigures } from "@/content/marketing/site";

/** Introduces The Citadel straight under the hero: the story, key figures and the residences at a glance. */
export function CitadelShowcase() {
  return (
    <section id="the-citadel" className="py-20 md:py-32">
      <div className="container-lux grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <Reveal>
          <EyebrowPill>Asokoro · Abuja</EyebrowPill>
          <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">
            Eight residences.
            <span className="block italic text-gold">Abuja’s most protected address.</span>
          </h2>
          <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
            <p>{citadel.intro}</p>
            <p>{citadel.detail}</p>
          </div>
          <Link href={`/properties/${CITADEL_SLUG}`} className="text-nav mt-8 inline-block border-b border-gold pb-1 hover:text-gold">
            Explore the residences
          </Link>
        </Reveal>

        <Reveal delay={0.15}>
          <figure className="bg-surface p-3 shadow-sm md:p-4">
            <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4]">
              <Image src={citadel.images[1].src} alt={citadel.images[1].alt} fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
            </div>
            <figcaption className="flex justify-between pt-3 text-[0.7rem] text-muted-foreground">
              <span>{citadel.name}, Mary Slessor Street</span>
              <span className="text-eyebrow !text-[0.55rem]">{citadel.status}</span>
            </figcaption>
          </figure>
        </Reveal>
      </div>

      <div className="container-lux mt-20">
        <dl className="grid grid-cols-2 gap-y-10 border-y border-border py-10 md:grid-cols-4">
          {keyFigures.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <dt className="text-eyebrow order-2 mt-2 text-muted-foreground">{stat.label}</dt>
              <dd className="font-display text-4xl md:text-5xl">{stat.value}</dd>
            </Reveal>
          ))}
        </dl>
      </div>

      <div className="container-lux mt-20">
        <p className="text-eyebrow text-gold">The residences</p>
        <ul className="mt-6 grid gap-px overflow-hidden rounded-brand border border-border bg-border sm:grid-cols-2 lg:grid-cols-3">
          {citadel.residences.map((item, i) => (
            <Reveal as="li" key={item.label} delay={i * 0.05} className="bg-background p-6 md:p-8">
              <p className="text-eyebrow text-muted-foreground">{item.label}</p>
              <p className="mt-3 font-display text-2xl">{item.value}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.note}</p>
            </Reveal>
          ))}
        </ul>
      </div>
    </section>
  );
}
