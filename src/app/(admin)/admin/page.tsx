"use client";

import { Building2, Home, UserPlus } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { StatCard } from "@/components/shared/app/StatCard";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { Perm } from "@/features/auth/permissions";
import { useOverview } from "@/features/estate-core/hooks/usePeople";
import { EnquiriesBanner } from "@/features/website/components/EnquiriesBanner";
import { getTooltip } from "@/lib/tooltips/registry";
import { useAuth } from "@/providers/AuthProvider";

const STATUS_ORDER = ["occupied", "available", "reserved", "under_maintenance", "inactive"];
const BAR_TONES: Record<string, string> = { occupied: "bg-info", available: "bg-success", reserved: "bg-gold", under_maintenance: "bg-warning", inactive: "bg-muted-foreground" };

export default function AdminOverviewPage() {
  const { data, error, isLoading, refetch } = useOverview();
  const { can } = useAuth();
  const usable = data ? data.houses - (data.houses_by_status.inactive ?? 0) : 0;
  const occupancyRate = data && usable ? Math.round(((data.houses_by_status.occupied ?? 0) / usable) * 100) : 0;

  const actions = [
    { label: "Add an estate", href: "/admin/estates?new=1", icon: Building2, show: can(Perm.EstatesManage) },
    { label: "Add a house", href: "/admin/houses?new=1", icon: Home, show: can(Perm.HousesManage) },
    { label: "Add a resident", href: "/admin/residents?new=1", icon: UserPlus, show: can(Perm.ResidentsManage) },
  ].filter((a) => a.show);

  return (
    <div className="space-y-8">
      <PageHeader eyebrow="Overview" title="Good to see you" tip={getTooltip("admin.overview")} description="Here is how your estates look today." />
      {can(Perm.LeadsView) && <EnquiriesBanner />}
      {error && <ErrorState error={error} onRetry={refetch} />}
      {isLoading && <SkeletonRows rows={2} />}
      {data && (
        <>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            <StatCard label="Estates" value={data.estates} href="/admin/estates" />
            <StatCard label="Houses" value={data.houses} href="/admin/houses" />
            <StatCard label="Residents" value={data.residents} href="/admin/residents" />
            <StatCard label="Occupancy" value={`${occupancyRate}%`} tip={getTooltip("admin.occupancyRate")} hint={`${data.houses_by_status.occupied ?? 0} of ${usable} houses`} />
          </div>

          <section className="rounded-lg border border-border bg-surface p-5">
            <h2 className="font-display text-xl">Houses by status</h2>
            <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-surface-muted" role="img" aria-label="Houses by status">
              {STATUS_ORDER.map((s) => {
                const count = data.houses_by_status[s] ?? 0;
                return count ? <div key={s} className={BAR_TONES[s]} style={{ width: `${(count / data.houses) * 100}%` }} /> : null;
              })}
            </div>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-sm md:grid-cols-5">
              {STATUS_ORDER.map((s) => (
                <li key={s}>
                  <Link href={`/admin/houses?status=${s}`} className="flex items-center gap-2 hover:text-gold">
                    <span className={`size-2.5 rounded-full ${BAR_TONES[s]}`} aria-hidden /> {humanize(s)} <span className="text-muted-foreground">{data.houses_by_status[s] ?? 0}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}

      {actions.length > 0 && (
        <section>
          <h2 className="font-display text-xl">Quick actions</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {actions.map((a) => (
              <Link key={a.href} href={a.href} className="flex items-center gap-3 rounded-lg border border-border bg-surface p-4 transition-colors hover:border-gold">
                <a.icon className="size-5 text-gold" aria-hidden /> <span className="text-sm font-medium">{a.label}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
