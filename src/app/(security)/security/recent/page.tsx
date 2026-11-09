"use client";

import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { humanize } from "@/components/shared/app/StatusPill";
import { useRecentVisits } from "@/features/visitors/hooks/useVisitors";

const time = (iso: string) => new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });

export default function RecentPage() {
  const recent = useRecentVisits();
  return (
    <div className="space-y-5">
      <h1 className="font-display text-3xl">Last 24 hours</h1>
      {recent.error && <ErrorState error={recent.error} onRetry={recent.refetch} />}
      {recent.isLoading && <SkeletonRows rows={4} />}
      {recent.data?.items.length === 0 && <EmptyState title="No visitors in the last 24 hours" />}
      <ul className="divide-y divide-border rounded-2xl border border-border bg-surface">
        {recent.data?.items.map((v) => (
          <li key={v.id} className="flex items-center justify-between gap-3 p-4 text-sm">
            <div className="min-w-0">
              <p className="truncate font-medium">{v.visitor_name}</p>
              <p className="text-xs text-muted-foreground">House {v.house_identifier} · {humanize(v.entry_method)}{v.entry_officer_name ? ` · ${v.entry_officer_name}` : ""}</p>
            </div>
            <p className="shrink-0 text-right text-xs tabular-nums">In {time(v.entered_at)}<br />{v.exited_at ? `Out ${time(v.exited_at)}` : <span className="text-success">Inside</span>}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
