"use client";

import { ImageOff, Plus } from "lucide-react";
import Image from "next/image";
import { Suspense } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { STATUS_LABELS } from "@/features/marketing/services/PropertyCatalog";
import { NewListingSheet } from "@/features/website/components/NewListingSheet";
import { useListings } from "@/features/website/hooks/useWebsite";
import type { Listing } from "@/features/website/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { formatKobo } from "@/lib/utils/money";

const FILTER_KEYS = ["show"] as const;
const SHOW = [{ value: "", label: "All" }, { value: "live", label: "Live" }, { value: "hidden", label: "Hidden" }];

function Thumb({ listing }: { listing: Listing }) {
  const cover = listing.photos[0];
  return (
    <div className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-muted">
      {cover ? <Image src={cover.url} alt="" fill sizes="48px" className="object-cover" /> : <ImageOff className="m-3.5 size-5 text-muted-foreground" aria-hidden />}
    </div>
  );
}

const Visibility = ({ live }: { live: boolean }) => (
  <span className={cn("rounded-full px-2.5 py-0.5 text-xs", live ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground")}>{live ? "Live" : "Hidden"}</span>
);

function ListingsScreen() {
  const list = useListState(FILTER_KEYS);
  const show = list.filters.show;
  const query = useListings({ q: list.q, page: list.page, published: show === "live" ? true : show === "hidden" ? false : undefined });
  const data = query.data;
  return (
    <div className="space-y-6">
      <PageHeader title="Listings" tip={getTooltip("website.listings")} description="The homes shown on your public website."
        actions={<Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New listing</Button>} />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search by name or area" className="lg:w-72" />
        <FilterChips label="Show" options={SHOW} value={show} onChange={(v) => list.set({ show: v })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="No listings here" body="Create a listing, add photos, then make it live." />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Listing> rows={data.items} rowKey={(l) => l.id} href={(l) => `/admin/properties/${l.id}`}
            columns={[
              { header: "Listing", cell: (l) => <span className="flex items-center gap-3"><Thumb listing={l} /><span>{l.name}<span className="block text-xs font-normal text-muted-foreground">{l.property_type}</span></span></span> },
              { header: "Location", cell: (l) => `${l.neighbourhood}, ${l.city}` },
              { header: "Price", cell: (l) => (l.price_from_kobo > 0 ? `From ${formatKobo(l.price_from_kobo, { whole: true })}` : "On request") },
              { header: "Availability", cell: (l) => STATUS_LABELS[l.status] },
              { header: "Enquiries", cell: (l) => l.enquiry_count },
              { header: "Website", cell: (l) => <span className="flex items-center gap-2"><Visibility live={l.is_published} />{l.featured && <span className="text-xs text-gold">Featured</span>}</span> },
            ]}
            card={(l) => (
              <div className="flex gap-3">
                <Thumb listing={l} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2"><p className="truncate font-medium">{l.name}</p><Visibility live={l.is_published} /></div>
                  <p className="text-xs text-muted-foreground">{l.neighbourhood}, {l.city} · {l.price_from_kobo > 0 ? `from ${formatKobo(l.price_from_kobo, { whole: true })}` : "price on request"}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{l.photos.length} photos · {l.enquiry_count} enquiries</p>
                </div>
              </div>
            )} />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
      <NewListingSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} />
    </div>
  );
}

export default function AdminListingsPage() {
  return <Suspense><ListingsScreen /></Suspense>;
}
