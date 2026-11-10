import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { CITADEL_SLUG, citadel } from "@/content/marketing/citadel";
import { cn } from "@/lib/utils/cn";

export const REGISTER_INTEREST_HREF = `/contact?type=purchase&property=${CITADEL_SLUG}`;

/** Gentle grow-on-hover for hero copy. Left-anchored on mobile, centred from md up; off for reduced-motion users. */
const HOVER_GROW =
  "origin-left transition-transform duration-500 ease-out hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 md:origin-center";

/**
 * The Citadel, Asokoro — full-bleed architectural render of the entrance with the development's name as the statement headline.
 * Mobile: full viewport height, copy anchored to the bottom for thumb reach.
 */
export function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[100svh] items-end overflow-hidden text-white md:items-center">
      <Image
        src={citadel.images[0].src}
        alt={citadel.images[0].alt}
        fill
        priority
        sizes="100vw"
        className="animate-kenburns -z-20 object-cover"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/85 via-black/45 to-black/55" />

      <div className="container-lux pb-24 pt-32 md:pb-0 md:text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[#d4af5a]/70 bg-black/30 px-4 py-1.5 text-[0.7rem] uppercase tracking-[0.2em] text-[#e8cf8f] backdrop-blur-sm">
          <span
            className="size-1.5 animate-pulse rounded-full bg-[#d4af5a]"
            aria-hidden
          />{" "}
          {citadel.status}
        </span>
        <h1
          className={cn(
            HOVER_GROW,
            "mt-6 font-hero text-[3.1rem] font-light uppercase leading-[0.95] tracking-[0.08em] sm:text-6xl md:text-7xl lg:text-8xl",
          )}
        >
          {citadel.name}
        </h1>
        <p
          className={cn(
            HOVER_GROW,
            "mt-4 font-display text-xl italic text-[#e8cf8f] md:text-3xl",
          )}
        >
          {citadel.tagline}
        </p>
        <p className={cn(HOVER_GROW, "text-eyebrow mt-4 text-white/80")}>
          {citadel.place}
        </p>
        <p
          className={cn(
            HOVER_GROW,
            "mt-6 max-w-lg text-sm leading-relaxed text-white/85 md:mx-auto md:text-base",
          )}
        >
          Eight Three-Bedroom Residences on the Hilltop of Asokoro — Abuja’s
          Diplomatic Enclave.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row md:justify-center">
          <Link
            href={REGISTER_INTEREST_HREF}
            className={cn(buttonVariants({ variant: "gold", size: "lg" }))}
          >
            Register your interest
          </Link>
          <Link
            href={`/properties/${CITADEL_SLUG}`}
            className={cn(
              buttonVariants({ variant: "ghostLight", size: "lg" }),
            )}
          >
            View the residences
          </Link>
        </div>
      </div>

      <a
        href="#the-citadel"
        aria-label="Scroll to The Citadel"
        className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 animate-bounce text-white/70 md:block"
      >
        <ArrowDown className="size-5" aria-hidden />
      </a>
    </section>
  );
}
