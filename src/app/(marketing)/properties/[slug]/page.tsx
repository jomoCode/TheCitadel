import { Check } from "lucide-react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/marketing/properties/PropertyCard";
import { PropertyEnquiry } from "@/components/marketing/properties/PropertyEnquiry";
import { PropertyFacts } from "@/components/marketing/properties/PropertyFacts";
import { PropertyGallery } from "@/components/marketing/properties/PropertyGallery";
import { PropertyViewTracker } from "@/components/marketing/properties/PropertyViewTracker";
import { PhotoHero } from "@/components/marketing/primitives/PhotoHero";
import { StatusBadge } from "@/components/marketing/primitives/StatusBadge";
import { PropertyJsonLd } from "@/components/marketing/seo/JsonLd";
import { loadCatalog } from "@/features/marketing/services/PropertySource";

type Params = { params: Promise<{ slug: string }> };

export const revalidate = 60;

export async function generateStaticParams() {
  return (await loadCatalog()).all().map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const property = (await loadCatalog()).bySlug((await params).slug);
  if (!property) return {};
  return {
    title: property.seo.title,
    description: property.seo.description,
    alternates: { canonical: `/properties/${property.slug}` },
    openGraph: { images: [{ url: property.images[0].src, alt: property.images[0].alt }] },
  };
}

function CheckList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <h2 className="text-eyebrow text-gold">{title}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <li key={item} className="flex items-start gap-2 text-sm"><Check className="mt-0.5 size-4 shrink-0 text-gold" aria-hidden />{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default async function PropertyPage({ params }: Params) {
  const catalog = await loadCatalog();
  const property = catalog.bySlug((await params).slug);
  if (!property) notFound();
  const related = catalog.related(property);

  return (
    <>
      <PropertyJsonLd property={property} />
      <PropertyViewTracker slug={property.slug} />
      <PhotoHero image={property.images[0]} eyebrow={`${property.neighbourhood}, ${property.city}`} title={property.name}>
        <p className="mt-4 max-w-xl text-sm text-white/85 md:text-base">{property.summary}</p>
        <StatusBadge status={property.status} className="mt-6 [&_button]:text-white/80" />
      </PhotoHero>

      <div className="container-lux py-12 pb-32 md:py-20 lg:pb-24">
        <PropertyFacts property={property} />
        <div className="mt-14 grid gap-14 lg:grid-cols-[1fr_24rem] lg:gap-16">
          <div className="space-y-12">
            <section>
              <h2 className="font-display text-3xl">{property.units}</h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-muted-foreground md:text-base">
                {property.description.map((paragraph) => <p key={paragraph.slice(0, 24)}>{paragraph}</p>)}
              </div>
            </section>
            <PropertyGallery images={property.images} />
            {property.features.length > 0 && <CheckList title="Features" items={property.features} />}
            {property.amenities.length > 0 && <CheckList title="Amenities" items={property.amenities} />}
            <section>
              <h2 className="text-eyebrow text-gold">Location</h2>
              <p className="mt-3 text-sm">{property.address}</p>
              <iframe
                title={`Map of ${property.name}`}
                src={`https://maps.google.com/maps?q=${encodeURIComponent(property.address)}&output=embed`}
                loading="lazy"
                className="mt-4 h-72 w-full rounded-brand border border-border grayscale"
              />
            </section>
          </div>
          <div><PropertyEnquiry property={property} /></div>
        </div>

        {related.length > 0 && (
        <section className="mt-24">
          <h2 className="font-display text-3xl">You may also like</h2>
          <ul className="mt-8 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((p) => <li key={p.slug}><PropertyCard property={p} /></li>)}
          </ul>
        </section>
        )}
      </div>
    </>
  );
}
