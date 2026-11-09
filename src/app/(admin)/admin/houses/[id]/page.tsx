"use client";

import { ArrowLeft, Pencil, UserPlus } from "lucide-react";
import Link from "next/link";
import { use, useState } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { Button, buttonVariants } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Perm } from "@/features/auth/permissions";
import { ActivityTimeline } from "@/features/estate-core/components/ActivityTimeline";
import { HouseActions } from "@/features/estate-core/components/HouseActions";
import { HouseFormSheet } from "@/features/estate-core/components/HouseFormSheet";
import { OccupancyHistory } from "@/features/estate-core/components/OccupancyHistory";
import { useHouse } from "@/features/estate-core/hooks/useEstates";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

function Fact({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-sm">{value || "—"}</dd>
    </div>
  );
}

export default function HousePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const house = useHouse(id);
  const canManage = usePermission(Perm.HousesManage);
  const canAddResident = usePermission(Perm.ResidentsManage);
  const [editing, setEditing] = useState(false);

  if (house.error) return <ErrorState error={house.error} onRetry={house.refetch} />;
  if (!house.data) return <SkeletonRows rows={4} />;
  const h = house.data;

  return (
    <div className="space-y-8">
      <Link href={`/admin/estates/${h.estate_id}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> {h.estate_name ?? "Estate"}
      </Link>
      <PageHeader eyebrow={h.estate_name ?? undefined} title={`House ${h.identifier}`}
        actions={<>
          {canManage && <Button variant="outline" size="sm" onClick={() => setEditing(true)}><Pencil className="size-3.5" /> Edit</Button>}
          {canAddResident && h.status !== "inactive" && (
            <Link href={`/admin/residents?new=1&house_id=${h.id}`} className={buttonVariants({ size: "sm" })}><UserPlus className="size-3.5" /> Add resident</Link>
          )}
        </>} />
      <StatusPill status={h.status} scope="house" />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <dl className="grid grid-cols-2 gap-5 rounded-lg border border-border bg-surface p-5 sm:grid-cols-3">
          <Fact label="Location" value={h.location} />
          <Fact label="Block" value={h.block} />
          <Fact label="Category" value={h.category} />
          <Fact label="Rooms" value={h.rooms} />
          <Fact label="Bedrooms" value={h.bedrooms} />
          <Fact label="Residents now" value={h.active_residents} />
          {h.description && <div className="col-span-full"><Fact label="Notes" value={h.description} /></div>}
        </dl>
        {canManage && <HouseActions house={h} />}
      </div>

      <section className="space-y-3">
        <h2 className="flex items-center gap-1 font-display text-2xl">Who has lived here <InfoTip text={getTooltip("admin.occupancyHistory")} /></h2>
        <OccupancyHistory houseId={h.id} />
      </section>
      <section className="space-y-3">
        <h2 className="flex items-center gap-1 font-display text-2xl">Activity <InfoTip text={getTooltip("admin.activityLog")} /></h2>
        <ActivityTimeline entityType="house" entityId={h.id} />
      </section>

      <HouseFormSheet open={editing} onOpenChange={setEditing} house={h} />
    </div>
  );
}
