"use client";

import Link from "next/link";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { StatusPill } from "@/components/shared/app/StatusPill";
import { formatLongDate } from "@/lib/utils/format";
import { useHouseOccupancies } from "../hooks/useEstates";

/** Everyone who has lived in a house — current residents first. History is never deleted. */
export function OccupancyHistory({ houseId }: { houseId: string }) {
  const query = useHouseOccupancies(houseId);
  if (query.error) return <ErrorState error={query.error} onRetry={query.refetch} />;
  if (!query.data) return <SkeletonRows rows={2} />;
  if (query.data.length === 0) return <EmptyState title="No one has lived here yet" />;

  const rows = [...query.data].sort((a, b) => Number(b.status === "active") - Number(a.status === "active"));
  return (
    <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
      {rows.map((o) => (
        <li key={o.id} className="flex items-center justify-between gap-3 p-4">
          <div className="min-w-0">
            <Link href={`/admin/residents/${o.resident_id}`} className="font-medium hover:text-gold">{o.resident_name ?? "Resident"}</Link>
            {o.is_primary && <span className="ml-2 text-xs text-gold">Primary</span>}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {formatLongDate(o.start_date)} — {o.end_date ? formatLongDate(o.end_date) : "present"}
              {o.end_reason && ` · ${o.end_reason}`}
            </p>
          </div>
          <StatusPill status={o.status} />
        </li>
      ))}
    </ul>
  );
}
