"use client";

import { Check } from "lucide-react";
import { Suspense } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { inputClass } from "@/components/shared/form/FormField";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { shortDateTime as when } from "@/features/website/format";
import { useEnquiries, useEnquiryCounts } from "@/features/website/hooks/useWebsite";
import { ENQUIRY_TYPE_LABELS, type Enquiry, type HandledFilter } from "@/features/website/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

const FILTER_KEYS = ["handled", "type", "property_id"] as const;

function EnquiriesScreen() {
  const list = useListState(FILTER_KEYS);
  const handled = (list.filters.handled || "open") as HandledFilter;
  const counts = useEnquiryCounts();
  const query = useEnquiries({ q: list.q, page: list.page, handled, enquiry_type: list.filters.type || undefined, property_id: list.filters.property_id || undefined });
  const data = query.data;
  const tabs = [
    { value: "open" as const, label: counts.data ? `To handle (${counts.data.open})` : "To handle" },
    { value: "handled" as const, label: "Handled" },
    { value: "all" as const, label: "All" },
  ];
  return (
    <div className="space-y-6">
      <PageHeader title="Enquiries" tip={getTooltip("website.enquiries")} description="Messages sent from your website, newest first." />
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row">
          <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Name, email, phone or reference" className="sm:w-72" />
          <select aria-label="Type" value={list.filters.type} onChange={(e) => list.set({ type: e.target.value })} className={cn(inputClass, "sm:w-48")}>
            <option value="">All types</option>
            {Object.entries(ENQUIRY_TYPE_LABELS).map(([v, label]) => <option key={v} value={v}>{label}</option>)}
          </select>
        </div>
        <FilterChips label="Show" options={tabs} value={handled} onChange={(v) => list.set({ handled: v === "open" ? null : v })} />
      </div>
      {list.filters.property_id && (
        <p className="text-sm text-muted-foreground">Showing enquiries about one listing. <button type="button" className="text-gold underline" onClick={() => list.set({ property_id: null })}>Show all</button></p>
      )}
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && (
        <EmptyState title={handled === "open" ? "All caught up" : "No enquiries here"} body={handled === "open" ? "New enquiries from the website will appear here." : undefined} />
      )}
      {data && data.items.length > 0 && (
        <>
          <DataView<Enquiry> rows={data.items} rowKey={(e) => e.id} href={(e) => `/admin/enquiries/${e.id}`}
            columns={[
              { header: "From", cell: (e) => <span>{e.name}<span className="block text-xs font-normal text-muted-foreground">{e.email}</span></span> },
              { header: "About", cell: (e) => <span>{ENQUIRY_TYPE_LABELS[e.enquiry_type] ?? e.enquiry_type}{e.property_name && <span className="block text-xs text-muted-foreground">{e.property_name}</span>}</span> },
              { header: "Message", cell: (e) => <span className="line-clamp-2 max-w-sm text-muted-foreground">{e.message}</span> },
              { header: "Came from", cell: (e) => e.source ?? "—" },
              { header: "Received", cell: (e) => when(e.created_at) },
              { header: "Handled", cell: (e) => (e.handled ? <Check className="size-4 text-success" aria-label="Handled" /> : null) },
            ]}
            card={(e) => (
              <div>
                <div className="flex items-start justify-between gap-3">
                  <p className="font-medium">{e.name}</p>
                  <span className="shrink-0 text-xs text-muted-foreground">{when(e.created_at)}</span>
                </div>
                <p className="text-xs text-gold">{ENQUIRY_TYPE_LABELS[e.enquiry_type] ?? e.enquiry_type}{e.property_name ? ` · ${e.property_name}` : ""}</p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{e.message}</p>
                {e.handled && <p className="mt-1 flex items-center gap-1 text-xs text-success"><Check className="size-3" /> Handled</p>}
              </div>
            )} />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
    </div>
  );
}

export default function AdminEnquiriesPage() {
  return <Suspense><EnquiriesScreen /></Suspense>;
}
