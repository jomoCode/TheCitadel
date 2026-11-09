"use client";

import { Users } from "lucide-react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { useHouses } from "../hooks/useEstates";
import type { House, HouseStatus } from "../types";

const STATUS_OPTIONS: { value: HouseStatus | ""; label: string }[] = [
  { value: "", label: "All" },
  { value: "occupied", label: "Occupied" },
  { value: "available", label: "Available" },
  { value: "reserved", label: "Reserved" },
  { value: "under_maintenance", label: "Maintenance" },
  { value: "inactive", label: "Inactive" },
];

type HouseListProps = {
  estateId?: string;
  q: string;
  page: number;
  status: string;
  onChange: (changes: Record<string, string | number | null>) => void;
  showEstate?: boolean;
  emptyAction?: React.ReactNode;
};

/** Searchable, filterable list of houses. Reused on the Houses page and inside an estate's page. */
export function HouseList({ estateId, q, page, status, onChange, showEstate = true, emptyAction }: HouseListProps) {
  const query = useHouses({ estate_id: estateId, q, page, status: status || undefined });
  const data = query.data;

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <SearchInput value={q} onChange={(value) => onChange({ q: value })} placeholder="Search by house no., block or location" className="lg:w-80" />
        <FilterChips label="House status" options={STATUS_OPTIONS} value={status as HouseStatus | ""} onChange={(value) => onChange({ status: value })} />
      </div>
      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title="No houses found" body={q || status ? "Try a different search or filter." : "Add the first house to get started."} action={!q && !status && emptyAction} />}
      {data && data.items.length > 0 && (
        <>
          <DataView<House>
            rows={data.items}
            rowKey={(h) => h.id}
            href={(h) => `/admin/houses/${h.id}`}
            columns={[
              { header: "House", cell: (h) => h.identifier },
              ...(showEstate ? [{ header: "Estate", cell: (h: House) => h.estate_name ?? "—" }] : []),
              { header: "Location", cell: (h) => [h.block, h.location].filter(Boolean).join(" · ") },
              { header: "Residents", cell: (h) => h.active_residents, className: "text-right" },
              { header: "Status", cell: (h) => <StatusPill status={h.status} scope="house" /> },
            ]}
            card={(h) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-medium">House {h.identifier}</p>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">{[showEstate && h.estate_name, h.block, h.location].filter(Boolean).join(" · ")}</p>
                  <p className="mt-2 flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" /> {h.active_residents} resident{h.active_residents === 1 ? "" : "s"}</p>
                </div>
                <StatusPill status={h.status} />
              </div>
            )}
          />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(p) => onChange({ page: p })} />
        </>
      )}
    </div>
  );
}
