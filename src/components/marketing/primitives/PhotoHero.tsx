import Image from "next/image";
import type { MarketingImage } from "@/features/marketing/types";

type PhotoHeroProps = { image: MarketingImage; eyebrow?: string; title: string; children?: React.ReactNode; height?: "full" | "tall" };

/** Reusable full-bleed photo header for inner pages (property, guides, about, referral). */
export function PhotoHero({ image, eyebrow, title, children, height = "tall" }: PhotoHeroProps) {
  return (
    <section className={`relative isolate flex items-end overflow-hidden text-white ${height === "full" ? "min-h-[100svh]" : "min-h-[75svh] md:min-h-[80vh]"}`}>
      <Image src={image.src} alt={image.alt} fill priority sizes="100vw" className="animate-kenburns -z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-black/80 via-black/25 to-black/40" />
      <div className="container-lux pb-12 pt-32 md:pb-20">
        {eyebrow && <p className="text-eyebrow text-white/80">{eyebrow}</p>}
        <h1 className="mt-4 max-w-4xl font-display text-4xl leading-[1.05] md:text-7xl">{title}</h1>
        {children}
      </div>
    </section>
  );
}
