import Image from "next/image";
import { buttonVariants } from "@/components/ui/Button";
import { TrackedAnchor, TrackedLink } from "@/features/analytics";
import { loadSiteSettings } from "@/features/marketing/services/ContentSource";
import { cn } from "@/lib/utils/cn";

export async function ContactCta() {
  const { contact } = await loadSiteSettings();
  return (
    <section className="relative isolate overflow-hidden py-24 text-white md:py-36">
      <Image src="/images/citadel/facade-front.jpg" alt="" fill sizes="100vw" className="-z-20 object-cover" />
      <div className="absolute inset-0 -z-10 bg-black/60" />
      <div className="container-lux text-center">
        <p className="text-eyebrow text-white/80">Private viewings</p>
        <h2 className="mx-auto mt-5 max-w-3xl font-hero text-4xl font-light uppercase leading-tight tracking-[0.05em] md:text-6xl">
          Luxury in peace and comfort
        </h2>
        <p className="mx-auto mt-5 max-w-md text-sm text-white/80">
          Arrange a private viewing at The Citadel, Asokoro — in person in Abuja, or by video from anywhere in the world.
        </p>
        <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
          <TrackedLink href="/contact?type=viewing" tracking={{ name: "cta_click", tag: "contact_cta_viewing" }} className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>Book a viewing</TrackedLink>
          <TrackedAnchor href={`mailto:${contact.email}`} tracking={{ name: "cta_click", tag: "contact_cta_email" }} className={cn(buttonVariants({ variant: "ghostLight", size: "lg" }))}>
            {contact.email}
          </TrackedAnchor>
        </div>
      </div>
    </section>
  );
}
