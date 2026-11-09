import { siteConfig } from "@/content/marketing/site";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";
import type { BlogPost, Property } from "@/features/marketing/types";

/** Structured data (schema.org) helps search engines show rich results — PRD §13. */
function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export async function OrganizationJsonLd() {
  const { contact, socials } = await loadSiteSettings();
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        name: siteConfig.legalName,
        url: siteConfig.url,
        email: contact.email,
        telephone: contact.phone,
        address: { "@type": "PostalAddress", streetAddress: contact.address, addressLocality: "Abuja", addressCountry: "NG" },
        sameAs: socials.map((s) => s.href),
      }}
    />
  );
}

export function PropertyJsonLd({ property }: { property: Property }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Residence",
        name: property.name,
        description: property.summary,
        address: { "@type": "PostalAddress", streetAddress: property.address, addressLocality: property.city, addressCountry: "NG" },
        image: property.images.map((img) => (img.src.startsWith("http") ? img.src : `${siteConfig.url}${img.src}`)),
        offers: { "@type": "Offer", priceCurrency: "NGN", ...(property.priceFrom > 0 && { price: property.priceFrom }), availability: property.status === "soldOut" ? "https://schema.org/SoldOut" : "https://schema.org/InStock" },
      }}
    />
  );
}

export function ArticleJsonLd({ post }: { post: BlogPost }) {
  return (
    <JsonLd
      data={{
        "@context": "https://schema.org",
        "@type": "Article",
        headline: post.title,
        description: post.excerpt,
        datePublished: post.publishedAt,
        author: { "@type": "Person", name: post.author.name },
        image: `${siteConfig.url}${post.featuredImage.src}`,
        publisher: { "@type": "Organization", name: siteConfig.legalName },
      }}
    />
  );
}
