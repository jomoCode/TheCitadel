"use client";

import { LogOut } from "lucide-react";
import { EmptyState, ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { useGateActions, useInsideNow } from "@/features/visitors/hooks/useVisitors";
import { getTooltip } from "@/lib/tooltips/registry";

export default function InsidePage() {
  const inside = useInsideNow();
  const { exit } = useGateActions();
  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-1 font-display text-3xl">Inside now <InfoTip text={getTooltip("gate.inside")} />
        {inside.data && <span className="ml-2 rounded-full bg-gold-soft px-3 py-1 text-base text-gold">{inside.data.length}</span>}</h1>
      {inside.error && <ErrorState error={inside.error} onRetry={inside.refetch} />}
      {inside.isLoading && <SkeletonRows rows={3} />}
      {inside.data?.length === 0 && <EmptyState title="No visitors inside" />}
      <ul className="space-y-3">
        {inside.data?.map((v) => (
          <li key={v.id} className="flex items-center gap-3 rounded-2xl border border-border bg-surface p-4">
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-medium">{v.visitor_name}{v.headcount > 1 ? ` +${v.headcount - 1}` : ""}</p>
              <p className="text-sm text-muted-foreground">House {v.house_identifier} · in since {new Date(v.entered_at).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}</p>
              {v.entry_method === "override" && <p className="text-xs text-warning">Override</p>}
            </div>
            <Button size="lg" variant="outline" disabled={exit.isPending} onClick={() => exit.mutate(v.id)}><LogOut className="size-4" /> Check out</Button>
          </li>
        ))}
      </ul>
    </div>
  );
}
