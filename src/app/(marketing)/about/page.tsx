import type { Metadata } from "next";
import { ContactCta } from "@/components/marketing/home/ContactCta";
import { PhotoHero } from "@/components/marketing/primitives/PhotoHero";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { aboutContent } from "@/content/marketing/about";
import { citadel } from "@/content/marketing/citadel";
import { developerGroup, keyFigures, siteConfig } from "@/content/marketing/site";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/about", {
    title: "About Us",
    description: "The Citadel, Asokoro is developed by Quo Engineering & Construction Limited — the team behind River Park Estate in Abuja and award-winning luxury developments in Accra.",
  });
}

export default function AboutPage() {
  const { story, mission, vision, values, heroImage } = aboutContent;
  return (
    <>
      <PhotoHero image={heroImage} eyebrow="About the developer" title="Luxury in peace and comfort, by design." />

      <section className="container-lux grid gap-12 py-20 md:py-28 lg:grid-cols-[1fr_1.3fr]">
        <SectionHeading eyebrow="The developer" title={citadel.developerName.replace(" Limited", "")} highlight={citadel.promise} />
        <div className="space-y-5 text-sm leading-relaxed text-muted-foreground md:text-base">
          {story.map((p) => <p key={p.slice(0, 20)}>{p}</p>)}
          <a href={siteConfig.developerUrl} target="_blank" rel="noreferrer" className="text-nav inline-block border-b border-gold pb-1 text-foreground hover:text-gold">
            www.quoec.com
          </a>
        </div>
      </section>

      <section className="bg-[#140e0c] py-20 text-[#f4ede3] md:py-28">
        <div className="container-lux grid gap-12 md:grid-cols-2">
          {[{ label: "Our mission", text: mission }, { label: "Our vision", text: vision }].map((item) => (
            <Reveal key={item.label}>
              <p className="text-eyebrow text-[#d4af5a]">{item.label}</p>
              <p className="mt-4 font-display text-2xl leading-snug md:text-3xl">{item.text}</p>
            </Reveal>
          ))}
        </div>
        <dl className="container-lux mt-16 grid grid-cols-2 gap-8 border-t border-[#33261f] pt-12 md:grid-cols-4">
          {keyFigures.map((s) => (
            <div key={s.label}><dd className="font-display text-4xl text-[#d4af5a]">{s.value}</dd><dt className="text-eyebrow mt-2 text-[#a8998a]">{s.label}</dt></div>
          ))}
        </dl>
      </section>

      <section className="container-lux py-20 md:py-28">
        <SectionHeading eyebrow="What guides us" title="Our values" />
        <ul className="mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {values.map((v, i) => (
            <Reveal as="li" key={v.title} delay={i * 0.08} className="border-t border-gold pt-5">
              <h3 className="font-display text-xl">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{v.body}</p>
            </Reveal>
          ))}
        </ul>
      </section>

      <section className="bg-surface-muted py-16">
        <div className="container-lux">
          <p className="text-eyebrow text-muted-foreground">The team behind {citadel.developerName}</p>
          <ul className="mt-5 flex flex-wrap gap-x-10 gap-y-3 font-display text-xl">
            {developerGroup.map((name) => <li key={name}>{name}</li>)}
          </ul>
        </div>
      </section>
      <ContactCta />
    </>
  );
}
