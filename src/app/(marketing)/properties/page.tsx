import type { Metadata } from "next";
import { PropertyBrowser } from "@/components/marketing/properties/PropertyBrowser";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadProperties } from "@/features/marketing/services/PropertySource";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

export const revalidate = 60; // keep in step with PROPERTY_REVALIDATE_SECONDS

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/properties", {
    title: "Properties & Developments",
    description: "The Citadel, Asokoro — eight en-suite three-bedroom residences for sale in Abuja’s diplomatic enclave.",
  });
}

export default async function PropertiesPage() {
  const properties = await loadProperties();
  return (
    <>
      <PageIntro
        eyebrow="Our developments"
        title="Find your"
        highlight="Citadel home."
        intro="Every development is designed, built and managed by Citadel. Filter by city, home type or availability."
      />
      <section className="container-lux pb-24">
        <PropertyBrowser properties={properties} />
      </section>
    </>
  );
}
