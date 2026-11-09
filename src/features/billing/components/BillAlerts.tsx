"use client";

import { AlertTriangle, BellRing, Clock } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { formatKobo } from "@/lib/utils/money";
import type { BillAlert } from "../types";

const STYLE = {
  overdue: { icon: AlertTriangle, tone: "border-warning/40 bg-warning/10 text-warning" },
  due_tomorrow: { icon: BellRing, tone: "border-gold/40 bg-gold-soft text-gold" },
  due_soon: { icon: Clock, tone: "border-border bg-surface text-foreground" },
};

/** Gentle, friendly reminders (owner decision: warnings only, never penalties). */
export function BillAlerts({ alerts, limit = 3 }: { alerts: BillAlert[]; limit?: number }) {
  if (alerts.length === 0) return null;
  return (
    <ul className="space-y-2" aria-label="Reminders">
      {alerts.slice(0, limit).map((a) => {
        const { icon: Icon, tone } = STYLE[a.level];
        return (
          <li key={a.bill_id} className={cn("flex items-start gap-3 rounded-xl border p-3 text-sm", tone)}>
            <Icon className="mt-0.5 size-4 shrink-0" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-medium">{a.title}</p>
              <p className="text-xs opacity-80">{a.message}</p>
            </div>
            <span className="shrink-0 tabular-nums">{formatKobo(a.balance_kobo, { whole: true })}</span>
          </li>
        );
      })}
      {alerts.length > limit && <li className="text-xs text-muted-foreground">and {alerts.length - limit} more…</li>}
    </ul>
  );
}
