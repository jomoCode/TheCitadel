import { Clock, MapPin } from "lucide-react";
import Link from "next/link";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { buttonVariants } from "@/components/ui/Button";
import { citadel } from "@/content/marketing/citadel";
import { siteConfig } from "@/content/marketing/site";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";
import { cn } from "@/lib/utils/cn";
import { REGISTER_INTEREST_HREF } from "./HeroSection";

/** Where The Citadel is and how close everything is, followed by the developer and a register-interest call to action. */
export async function CitadelLocation() {
  const { contact } = await loadSiteSettings();
  return (
    <>
      <section className="bg-[#140e0c] py-20 text-[#f4ede3] md:py-28">
        <div className="container-lux grid gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-20">
          <Reveal>
            <p className="text-eyebrow text-[#d4af5a]">The location</p>
            <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">In the heart of the diplomatic enclave.</h2>
            <p className="mt-6 flex items-start gap-2 text-sm text-[#d9cdbd]"><MapPin className="mt-0.5 size-4 shrink-0 text-[#d4af5a]" aria-hidden /> {citadel.address}</p>
            <p className="mt-4 text-sm leading-relaxed text-[#a8998a] md:text-base">{citadel.location}</p>
          </Reveal>
          <Reveal delay={0.1}>
            <ul className="divide-y divide-[#33261f] border-y border-[#33261f]">
              {citadel.distances.map((d) => (
                <li key={d.place} className="flex items-center justify-between gap-4 py-4 text-sm">
                  <span>{d.place}</span>
                  <span className="flex shrink-0 items-center gap-1.5 text-[#d4af5a]"><Clock className="size-3.5" aria-hidden /> {d.time}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      <section className="container-lux grid gap-10 py-20 md:py-28 lg:grid-cols-[1fr_1fr] lg:items-end">
        <div>
          <SectionHeading eyebrow="The developer" title="Quo Engineering & Construction" highlight={citadel.promise} />
          <p className="mt-6 text-sm leading-relaxed text-muted-foreground md:text-base">{citadel.developer}</p>
        </div>
        <div className="rounded-brand border border-gold/40 bg-surface p-8">
          <p className="text-eyebrow text-gold">Register your interest</p>
          <p className="mt-3 font-display text-2xl">A limited release of Premium residences is now offered for sale.</p>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <Link href={REGISTER_INTEREST_HREF} className={cn(buttonVariants({ variant: "gold" }))}>Register your interest</Link>
            <a href={`mailto:${contact.email}?subject=${encodeURIComponent("The Citadel, Asokoro — register interest")}`} className={cn(buttonVariants({ variant: "outline" }))}>
              {contact.email}
            </a>
          </div>
          <a href={siteConfig.developerUrl} target="_blank" rel="noreferrer" className="mt-4 inline-block text-xs text-muted-foreground hover:text-gold">www.quoec.com</a>
        </div>
      </section>
    </>
  );
}
