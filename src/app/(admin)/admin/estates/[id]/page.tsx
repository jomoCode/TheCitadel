"use client";

import { ArrowLeft, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import { Suspense, use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { StatCard } from "@/components/shared/app/StatCard";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { EstateFormSheet } from "@/features/estate-core/components/EstateFormSheet";
import { HouseFormSheet } from "@/features/estate-core/components/HouseFormSheet";
import { HouseList } from "@/features/estate-core/components/HouseList";
import { useEstateSummary, useUpdateEstate } from "@/features/estate-core/hooks/useEstates";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { VisitorSettingsCard } from "@/features/visitors/components/admin/VisitorSettingsCard";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const FILTER_KEYS = ["status"] as const;

function EstateDetail({ id }: { id: string }) {
  const list = useListState(FILTER_KEYS);
  const summary = useEstateSummary(id);
  const canManageEstate = usePermission(Perm.EstatesManage);
  const canManageHouses = usePermission(Perm.HousesManage);
  const [editing, setEditing] = useState(false);
  const [archiving, setArchiving] = useState(false);
  const update = useUpdateEstate(id, () => setArchiving(false));

  if (summary.error) return <ErrorState error={summary.error} onRetry={summary.refetch} />;
  if (!summary.data) return <SkeletonRows rows={3} />;
  const { estate, houses_by_status: counts, active_residents } = summary.data;
  const archived = estate.status === "archived";

  return (
    <div className="space-y-8">
      <Link href="/admin/estates" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="size-4" /> Estates</Link>
      <PageHeader title={estate.name} description={[estate.location, estate.address].filter(Boolean).join(" · ") || undefined}
        actions={canManageEstate && (
          <>
            <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="size-3.5" /> Edit</Button>
            <Button variant="outline" size="sm" onClick={() => setArchiving(true)}>{archived ? "Restore" : "Archive"}</Button>
            <InfoTip text={getTooltip("admin.estate.archive")} />
          </>
        )} />
      <div className="flex items-center gap-2"><StatusPill status={estate.status} scope="estate" /></div>
      {estate.description && <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{estate.description}</p>}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Houses" value={estate.house_count} />
        <StatCard label="Occupied" value={counts.occupied ?? 0} />
        <StatCard label="Available" value={counts.available ?? 0} />
        <StatCard label="Residents" value={active_residents} href={`/admin/residents?estate_id=${id}`} />
      </div>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-2xl">Houses</h2>
          {canManageHouses && !archived && <Button size="sm" onClick={() => list.set({ new: 1 })}><Plus className="size-4" /> Add house</Button>}
        </div>
        <HouseList estateId={id} q={list.q} page={list.page} status={list.filters.status} onChange={list.set} showEstate={false} />
      </section>

      <VisitorSettingsCard estateId={id} />

      <EstateFormSheet open={editing} onOpenChange={setEditing} estate={estate} />
      <HouseFormSheet open={list.creating} onOpenChange={(open) => !open && list.set({ new: null })} defaultEstateId={id} />
      <ConfirmDialog open={archiving} onOpenChange={setArchiving} pending={update.isPending}
        title={archived ? "Restore this estate?" : "Archive this estate?"}
        body={archived ? "The estate will appear in day-to-day lists again." : "The estate will be hidden from day-to-day lists. No houses, residents or history are deleted."}
        confirmLabel={archived ? "Restore" : "Archive"}
        onConfirm={() => update.mutate({ status: archived ? "active" : "archived" })} />
    </div>
  );
}

export default function EstatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <Suspense><EstateDetail id={id} /></Suspense>;
}
