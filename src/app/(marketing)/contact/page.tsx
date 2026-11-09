import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import { EnquiryForm } from "@/components/marketing/forms/EnquiryForm";
import { PageIntro } from "@/components/marketing/primitives/PageIntro";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";
import { ENQUIRY_TYPES } from "@/features/marketing/schemas/enquiry";
import type { EnquiryType } from "@/features/marketing/types";
import { pageMetadata } from "@/features/marketing/services/ContentSource";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata("/contact", {
    title: "Contact Us",
    description: "Speak to a Citadel adviser, book a private viewing or visit The Citadel in Asokoro, Abuja.",
  });
}

type Props = { searchParams: Promise<{ type?: string; property?: string }> };

export default async function ContactPage({ searchParams }: Props) {
  const { type, property } = await searchParams;
  const defaultType = (ENQUIRY_TYPES.some((t) => t.value === type) ? type : "general") as EnquiryType;
  const { contact } = await loadSiteSettings();
  const details = [
    { icon: Phone, label: "Call", value: `${contact.phone} · ${contact.mobile}`, href: `tel:${contact.phone.replace(/[^+\d]/g, "")}` },
    { icon: Mail, label: "Email", value: contact.email, href: `mailto:${contact.email}` },
    { icon: MapPin, label: "Visit", value: contact.address },
    { icon: Clock, label: "Hours", value: contact.hours },
  ];

  return (
    <>
      <PageIntro eyebrow="Contact" title="Let's talk about" highlight="your next home." intro="Send us a message and an adviser will reply within one working day. Prefer to talk now? Call us." />
      <section className="container-lux grid gap-14 pb-24 lg:grid-cols-[1fr_1.2fr] lg:gap-20">
        <div className="space-y-8">
          <ul className="space-y-6">
            {details.map((d) => (
              <li key={d.label} className="flex gap-4">
                <d.icon className="mt-1 size-5 shrink-0 text-gold" aria-hidden />
                <div>
                  <p className="text-eyebrow text-muted-foreground">{d.label}</p>
                  {d.href ? <a href={d.href} className="mt-1 block hover:text-gold">{d.value}</a> : <p className="mt-1">{d.value}</p>}
                </div>
              </li>
            ))}
          </ul>
          <iframe
            title="Citadel office location"
            src={`https://maps.google.com/maps?q=${encodeURIComponent(contact.mapQuery)}&output=embed`}
            loading="lazy"
            className="h-72 w-full rounded-brand border border-border grayscale"
          />
        </div>
        <div className="rounded-lg border border-border bg-surface p-6 md:p-10">
          <EnquiryForm defaultType={defaultType} propertySlug={property} />
        </div>
      </section>
    </>
  );
}
