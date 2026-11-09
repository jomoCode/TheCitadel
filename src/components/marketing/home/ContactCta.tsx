import Image from "next/image";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
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
          <Link href="/contact?type=viewing" className={cn(buttonVariants({ variant: "gold", size: "lg" }))}>Book a viewing</Link>
          <a href={`mailto:${contact.email}`} className={cn(buttonVariants({ variant: "ghostLight", size: "lg" }))}>
            {contact.email}
          </a>
        </div>
      </div>
    </section>
  );
}
