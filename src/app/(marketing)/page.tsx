import { CitadelLocation } from "@/components/marketing/home/CitadelLocation";
import { CitadelShowcase } from "@/components/marketing/home/CitadelShowcase";
import { ComingSoonUrbane } from "@/components/marketing/home/ComingSoonUrbane";
import { ContactCta } from "@/components/marketing/home/ContactCta";
import { HeroSection } from "@/components/marketing/home/HeroSection";
import { LatestJournal } from "@/components/marketing/home/LatestJournal";
import { QuickActions } from "@/components/marketing/home/QuickActions";
import { WhyCitadel } from "@/components/marketing/home/WhyCitadel";
import { OrganizationJsonLd } from "@/components/marketing/seo/JsonLd";
import type { Metadata } from "next";
import { siteConfig } from "@/content/marketing/site";
import { loadTestimonials, pageMetadata } from "@/features/marketing/services/ContentSource";
import { TestimonialCards } from "@/components/marketing/home/TestimonialCards";

/**
 * Landing page for The Citadel, Asokoro (now selling).
 * Testimonials appear only once the team has added and published real, consented client quotes.
 */
export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/", { title: `${siteConfig.name} — ${siteConfig.tagline}`, description: siteConfig.description });
}

export default async function HomePage() {
  const testimonials = await loadTestimonials();
  return (
    <>
      <OrganizationJsonLd />
      <HeroSection />
      <CitadelShowcase />
      <CitadelLocation />
      <WhyCitadel />
      <ComingSoonUrbane />
      <QuickActions />
      {testimonials.length > 0 && <TestimonialCards testimonials={testimonials} />}
      <LatestJournal />
      <ContactCta />
    </>
  );
}
