import { Building2, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import Image from "next/image";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { InfoTip } from "@/components/ui/InfoTip";

const PILLARS = [
  { icon: Building2, title: "Quality assured", body: "Eight residences only, en-suite throughout, each with its own domestic quarters and two parking bays." },
  { icon: ShieldCheck, title: "A protected address", body: "Asokoro's diplomatic and security zone, with a concierge-served secured lobby and a security post on site." },
  { icon: KeyRound, title: "Managed for residents", body: "Security, power, water and maintenance looked after for you — a calm, residents-only community." },
  { icon: Smartphone, title: "Everything in one app", body: "Pay your service charge, let visitors in and report repairs from your phone." },
] as const;

export function WhyCitadel() {
  return (
    <section className="py-20 md:py-28">
      <div className="container-lux grid gap-14 lg:grid-cols-[1fr_1.1fr] lg:gap-20">
        <Reveal className="relative order-2 aspect-[4/5] overflow-hidden rounded-brand lg:order-1">
          <Image src="/images/hero/interior-lounge.jpg" alt="Calm, light-filled living room" fill sizes="(min-width: 1024px) 45vw, 100vw" className="object-cover" />
        </Reveal>
        <div className="order-1 lg:order-2">
          <SectionHeading eyebrow="Why The Citadel" title="Luxury in peace and comfort," highlight="by design." />
          <ul className="mt-10 grid gap-8 sm:grid-cols-2">
            {PILLARS.map((pillar, i) => (
              <Reveal as="li" key={pillar.title} delay={i * 0.08}>
                <pillar.icon className="size-5 text-gold" aria-hidden />
                <h3 className="mt-3 flex items-center gap-1 font-display text-xl">
                  {pillar.title}
                  {pillar.title === "Managed for residents" && <InfoTip tip="marketing.serviceCharge" label="What does estate management cost?" />}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{pillar.body}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
