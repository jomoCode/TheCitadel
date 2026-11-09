import { Quote } from "lucide-react";
import { RatingStars } from "@/components/marketing/primitives/RatingStars";
import { Reveal } from "@/components/marketing/primitives/Reveal";
import { EyebrowPill } from "@/components/marketing/primitives/SectionHeading";
import { developerGroup as partners } from "@/content/marketing/site";
import type { Testimonial } from "@/features/marketing/types";

function initials(name: string) {
  return name
    .split(/[\s&]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

/** Espresso & gold testimonial cards with a partner strip. Always dark, as a deliberate luxury band. */
export function TestimonialCards({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <section className="bg-[#140e0c] py-20 text-[#f4ede3] md:py-28">
      <div className="container-lux">
        <header className="mx-auto max-w-2xl text-center">
          <EyebrowPill>Client testimonials</EyebrowPill>
          <h2 className="mt-5 font-display text-3xl leading-tight md:text-5xl">
            What our clients say about
            <span className="block italic text-[#d4af5a]">their new homes</span>
          </h2>
          <p className="mt-4 text-sm text-[#a8998a]">
            In their own words — shared with their permission.
          </p>
        </header>

        <ul className="-mx-5 mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-2 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
          {testimonials.map((t, i) => (
            <Reveal as="li" key={t.id} delay={i * 0.1} className="flex w-[85%] shrink-0 snap-center flex-col rounded-lg border border-[#33261f] bg-[#1e1613] p-7 md:w-auto">
              <Quote className="size-7 rotate-180 text-[#d4af5a]/70" aria-hidden />
              <p className="mt-5 flex-1 text-sm leading-relaxed text-[#e8dfd3]">&ldquo;{t.quote}&rdquo;</p>
              <RatingStars rating={t.rating} className="mt-5" />
              <div className="mt-5 flex items-center gap-3 border-t border-[#33261f] pt-5">
                <span className="flex size-10 items-center justify-center rounded-full border border-[#d4af5a]/50 font-display text-xs text-[#d4af5a]">
                  {initials(t.name)}
                </span>
                <div>
                  <p className="font-display text-sm">{t.name}</p>
                  <p className="text-xs text-[#a8998a]">{t.purchase}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>

        <div className="mt-16 border-t border-[#33261f] pt-10 text-center">
          <p className="text-eyebrow text-[#d4af5a]/80">The team behind the developer</p>
          <ul className="mt-6 flex flex-wrap justify-center gap-x-10 gap-y-4 font-display text-sm text-[#a8998a]/60">
            {partners.map((partner) => (
              <li key={partner}>{partner}</li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
