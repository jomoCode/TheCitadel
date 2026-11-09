"use client";

import { MapPin, Plus } from "lucide-react";
import { Suspense } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { FilterChips, Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { EstateFormSheet } from "@/features/estate-core/components/EstateFormSheet";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { useListState } from "@/features/estate-core/hooks/useListState";
import type { Estate } from "@/features/estate-core/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const FILTER_KEYS = ["status"] as const;

function EstatesScreen() {
  const list = useListState(FILTER_KEYS);
  const canManage = usePermission(Perm.EstatesManage);
  const query = useEstates({ q: list.q, page: list.page, status: list.filters.status || undefined });
  const data = query.data;

  return (
    <div className="space-y-6">
      <PageHeader title="Estates" tip={getTooltip("admin.estates")} description="Groups of houses you manage."
        actions={canManage && <Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New estate</Button>} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search estates" className="sm:w-80" />
        <FilterChips label="Status" value={list.filters.status as "" | "active" | "archived"} onChange={(status) => list.set({ status })}
          options={[{ value: "", label: "All" }, { value: "active", label: "Active" }, { value: "archived", label: "Archived" }]} />
      </div>

      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && (
        <EmptyState title={list.q ? "No estates match your search" : "No estates yet"} body="Create your first estate, then add its houses."
          action={canManage && !list.q && <Button onClick={() => list.set({ new: 1 })}>Create an estate</Button>} />
      )}
      {data && data.items.length > 0 && (
        <>
          <DataView<Estate>
            rows={data.items}
            rowKey={(e) => e.id}
            href={(e) => `/admin/estates/${e.id}`}
            columns={[
              { header: "Name", cell: (e) => e.name },
              { header: "Location", cell: (e) => e.location ?? "—" },
              { header: "Houses", cell: (e) => e.house_count, className: "text-right" },
              { header: "Status", cell: (e) => <StatusPill status={e.status} /> },
            ]}
            card={(e) => (
              <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{e.name}</p>
                  {e.location && <p className="mt-0.5 flex items-center gap-1 truncate text-xs text-muted-foreground"><MapPin className="size-3" />{e.location}</p>}
                </div>
                <div className="text-right">
                  <p className="font-display text-2xl leading-none">{e.house_count}</p>
                  <p className="text-[0.65rem] uppercase tracking-wider text-muted-foreground">houses</p>
                </div>
              </div>
            )}
          />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
      <EstateFormSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} />
    </div>
  );
}

export default function EstatesPage() {
  return <Suspense><EstatesScreen /></Suspense>;
}
