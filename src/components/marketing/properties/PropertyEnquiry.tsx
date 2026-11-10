"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Phone } from "lucide-react";
import { EnquiryForm } from "@/components/marketing/forms/EnquiryForm";
import { ResponsiveSwitch } from "@/components/shared/ResponsiveSwitch";
import { Button, buttonVariants } from "@/components/ui/Button";
import { useSiteSettings } from "@/features/marketing/context/SiteSettingsContext";
import { telHref } from "@/features/website/format";
import type { Property } from "@/features/marketing/types";
import { cn } from "@/lib/utils/cn";
import { priceLabel } from "@/lib/utils/format";

function DesktopEnquiryCard({ property }: { property: Property }) {
  return (
    <aside className="sticky top-28 rounded-lg border border-border bg-surface p-7">
      <p className="text-eyebrow text-gold">Enquire</p>
      <p className="mt-2 font-display text-2xl">Arrange a private viewing</p>
      <p className="mt-1 text-sm text-muted-foreground">An adviser replies within one working day.</p>
      <div className="mt-6">
        <EnquiryForm compact defaultType="viewing" propertySlug={property.slug} propertyName={property.name} />
      </div>
    </aside>
  );
}

/** Phone pattern: sticky bottom action bar; the form opens as a bottom sheet. */
function MobileEnquiryBar({ property }: { property: Property }) {
  const { contact } = useSiteSettings();
  return (
    <div className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="min-w-0 flex-1">
          {property.priceFrom > 0 && <p className="text-xs text-muted-foreground">From</p>}
          <p className="font-display text-lg leading-none">{priceLabel(property.priceFrom, { compact: true })}</p>
        </div>
        <a href={telHref(contact.mobile)} aria-label="Call an adviser" className={cn(buttonVariants({ variant: "outline", size: "md" }), "px-4")}>
          <Phone className="size-4" />
        </a>
        <Dialog.Root>
          <Dialog.Trigger asChild>
            <Button size="md">Enquire</Button>
          </Dialog.Trigger>
          <Dialog.Portal>
            <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50" />
            <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[92svh] overflow-y-auto rounded-t-2xl bg-background px-5 pb-6 pt-3 focus:outline-none">
              <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
              <Dialog.Title className="font-display text-2xl">{property.name}</Dialog.Title>
              <Dialog.Description className="mb-5 mt-1 text-sm text-muted-foreground">Tell us a little about yourself and we will be in touch.</Dialog.Description>
              <EnquiryForm compact defaultType="viewing" propertySlug={property.slug} propertyName={property.name} />
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </div>
    </div>
  );
}

export function PropertyEnquiry({ property }: { property: Property }) {
  if (property.status === "soldOut") {
    return (
      <aside className="rounded-lg border border-border bg-surface p-7">
        <p className="font-display text-2xl">This development is sold out</p>
        <p className="mt-2 text-sm text-muted-foreground">Leave your details to hear about resales and similar launches first.</p>
        <div className="mt-6"><EnquiryForm compact defaultType="property" propertySlug={property.slug} propertyName={property.name} /></div>
      </aside>
    );
  }
  return <ResponsiveSwitch mobile={<MobileEnquiryBar property={property} />} desktop={<DesktopEnquiryCard property={property} />} />;
}
