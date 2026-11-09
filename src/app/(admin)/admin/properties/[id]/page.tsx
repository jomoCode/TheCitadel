"use client";

import { ArrowLeft, ExternalLink, Inbox } from "lucide-react";
import Link from "next/link";
import { Suspense, use } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { InfoTip } from "@/components/ui/InfoTip";
import { ListingForm } from "@/features/website/components/ListingForm";
import { PhotoManager } from "@/features/website/components/PhotoManager";
import { useListing, useListingActions } from "@/features/website/hooks/useWebsite";
import type { Listing } from "@/features/website/types";
import { getTooltip } from "@/lib/tooltips/registry";

function Switch({ label, tip, checked, disabled, onChange, hint }: { label: string; tip: string; checked: boolean; disabled?: boolean; onChange: (v: boolean) => void; hint?: string }) {
  return (
    <label className="flex items-center justify-between gap-4 p-4 text-sm">
      <span>
        <span className="flex items-center gap-1 font-medium">{label} <InfoTip text={tip} /></span>
        {hint && <span className="block text-xs text-muted-foreground">{hint}</span>}
      </span>
      <input type="checkbox" role="switch" aria-label={label} className="size-5 shrink-0 accent-gold" checked={checked} disabled={disabled} onChange={(e) => onChange(e.target.checked)} />
    </label>
  );
}

function Visibility({ listing }: { listing: Listing }) {
  const { update } = useListingActions(listing.id);
  const ready = listing.photos.length > 0 && listing.summary.trim().length > 0;
  return (
    <div className="divide-y divide-border rounded-lg border border-border bg-surface">
      <Switch label="Live on the website" tip={getTooltip("website.publish")} checked={listing.is_published} disabled={update.isPending || (!ready && !listing.is_published)}
        hint={!ready && !listing.is_published ? "Add at least one photo and a short description first." : undefined}
        onChange={(v) => update.mutate({ is_published: v })} />
      <Switch label="Feature on the home page" tip={getTooltip("website.featured")} checked={listing.featured} disabled={update.isPending}
        onChange={(v) => update.mutate({ featured: v })} />
    </div>
  );
}

function Editor({ id }: { id: string }) {
  const query = useListing(id);
  const { update } = useListingActions(id);
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={4} />;
  const l = query.data;
  return (
    <div className="space-y-8">
      <Link href="/admin/properties" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Listings</Link>
      <PageHeader title={l.name} description={`${l.neighbourhood}, ${l.city}`}
        actions={(
          <div className="flex flex-wrap gap-3 text-sm">
            {l.enquiry_count > 0 && <Link href={`/admin/enquiries?property_id=${l.id}&handled=all`} className="inline-flex items-center gap-1 hover:text-gold"><Inbox className="size-4" /> {l.enquiry_count} enquiries</Link>}
            {l.is_published && <a href={`/properties/${l.slug}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-gold"><ExternalLink className="size-4" /> View on website</a>}
          </div>
        )} />
      <Visibility listing={l} />
      <PhotoManager listing={l} />
      <section className="max-w-3xl space-y-4">
        <h2 className="font-display text-2xl">Details</h2>
        <ListingForm key={l.id} listing={l} full pending={update.isPending} submitLabel="Save changes" onSubmit={(input) => update.mutate(input)} />
      </section>
    </div>
  );
}

export default function ListingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><Editor id={id} /></Suspense>;
}
