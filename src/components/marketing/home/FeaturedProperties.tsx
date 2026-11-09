import Link from "next/link";
import { PropertyCard } from "@/components/marketing/properties/PropertyCard";
import { SectionHeading } from "@/components/marketing/primitives/SectionHeading";
import { loadCatalog } from "@/features/marketing/services/PropertySource";

/**
 * Mobile: a native-feeling horizontal swipe carousel with snap points.
 * Desktop: an editorial grid. Same cards, different arrangement.
 */
export async function FeaturedProperties() {
  const featured = (await loadCatalog()).featured(4);
  if (featured.length === 0) return null;

  return (
    <section className="bg-surface-muted py-20 md:py-28">
      <div className="container-lux flex items-end justify-between gap-6">
        <SectionHeading eyebrow="Featured developments" title="Homes for every chapter" intro="From lagoon-view apartments to detached family homes — each one designed, built and managed by Citadel." />
        <Link href="/properties" className="text-nav hidden shrink-0 border-b border-gold pb-1 hover:text-gold md:inline-block">
          View all
        </Link>
      </div>

      <ul className="mt-12 flex snap-x snap-mandatory gap-5 overflow-x-auto scroll-smooth px-5 pb-4 [scrollbar-width:none] md:px-10 lg:container-lux lg:grid lg:grid-cols-4 lg:overflow-visible lg:px-10">
        {featured.map((property, index) => (
          <li key={property.slug} className="w-[82%] shrink-0 snap-start sm:w-[45%] lg:w-auto">
            <PropertyCard property={property} priority={index === 0} />
          </li>
        ))}
      </ul>

      <div className="container-lux mt-8 md:hidden">
        <Link href="/properties" className="text-nav border-b border-gold pb-1">View all properties</Link>
      </div>
    </section>
  );
}
