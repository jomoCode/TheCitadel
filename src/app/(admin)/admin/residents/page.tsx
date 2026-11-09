"use client";

import { Home, Plus } from "lucide-react";
import { Suspense } from "react";
import { DataView } from "@/components/shared/app/DataView";
import { Pagination, SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { Perm } from "@/features/auth/permissions";
import { ResidentFormSheet } from "@/features/estate-core/components/ResidentFormSheet";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { useResidents } from "@/features/estate-core/hooks/usePeople";
import type { Account } from "@/features/estate-core/types";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const FILTER_KEYS = ["estate_id", "house_id"] as const;

function currentHomes(a: Account): string {
  const active = a.occupancies.filter((o) => o.status === "active");
  return active.length ? active.map((o) => `${o.house_identifier} · ${o.estate_name}`).join(", ") : "No house assigned";
}

function ResidentsScreen() {
  const list = useListState(FILTER_KEYS);
  const canManage = usePermission(Perm.ResidentsManage);
  const query = useResidents({ q: list.q, page: list.page, estate_id: list.filters.estate_id || undefined });
  const data = query.data;
  const addButton = canManage && <Button onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> New resident</Button>;

  return (
    <div className="space-y-6">
      <PageHeader title="Residents" tip={getTooltip("admin.residents")} description="People living in your estates." actions={addButton} />
      <SearchInput value={list.q} onChange={(q) => list.set({ q })} placeholder="Search by name, email or phone" className="sm:w-96" />
      {list.filters.estate_id && <button type="button" onClick={() => list.set({ estate_id: null })} className="text-xs underline">Showing one estate — show all</button>}

      {query.error && <ErrorState error={query.error} onRetry={query.refetch} />}
      {query.isLoading && <SkeletonRows />}
      {data && data.items.length === 0 && <EmptyState title={list.q ? "No residents match your search" : "No residents yet"} action={!list.q && addButton} />}
      {data && data.items.length > 0 && (
        <>
          <DataView<Account>
            rows={data.items}
            rowKey={(a) => a.id}
            href={(a) => `/admin/residents/${a.id}`}
            columns={[
              { header: "Name", cell: (a) => a.full_name },
              { header: "Home", cell: currentHomes },
              { header: "Contact", cell: (a) => <span className="text-muted-foreground">{a.email}{a.phone ? ` · ${a.phone}` : ""}</span> },
              { header: "Account", cell: (a) => <StatusPill status={a.status} /> },
            ]}
            card={(a) => (
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.full_name}</p>
                  <p className="mt-1 flex items-center gap-1 truncate text-xs text-muted-foreground"><Home className="size-3 shrink-0" /> {currentHomes(a)}</p>
                </div>
                {a.status !== "active" && <StatusPill status={a.status} />}
              </div>
            )}
          />
          <Pagination page={data.page} pageSize={data.page_size} total={data.total} onPage={(page) => list.set({ page })} />
        </>
      )}
      <ResidentFormSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null, house_id: null })} defaultHouseId={list.filters.house_id || undefined} />
    </div>
  );
}

export default function ResidentsPage() {
  return <Suspense><ResidentsScreen /></Suspense>;
}
