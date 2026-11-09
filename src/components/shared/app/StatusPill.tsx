import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip, hasTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

const TONES: Record<string, string> = {
  active: "bg-success/15 text-success",
  available: "bg-success/15 text-success",
  occupied: "bg-info/15 text-info",
  reserved: "bg-gold-soft text-gold",
  under_maintenance: "bg-warning/15 text-warning",
  inactive: "bg-muted-foreground/15 text-muted-foreground",
  archived: "bg-muted-foreground/15 text-muted-foreground",
  ended: "bg-muted-foreground/15 text-muted-foreground",
  // Bills
  draft: "bg-surface-muted text-muted-foreground",
  issued: "bg-info/15 text-info",
  partially_paid: "bg-gold-soft text-gold",
  paid: "bg-success/15 text-success",
  overdue: "bg-warning/15 text-warning",
  cancelled: "bg-muted-foreground/15 text-muted-foreground",
  written_off: "bg-muted-foreground/15 text-muted-foreground",
  // Payments
  initiated: "bg-surface-muted text-muted-foreground",
  pending: "bg-warning/15 text-warning",
  successful: "bg-success/15 text-success",
  failed: "bg-danger/15 text-danger",
  abandoned: "bg-muted-foreground/15 text-muted-foreground",
  expired: "bg-muted-foreground/15 text-muted-foreground",
  refunded: "bg-info/15 text-info",
  partially_refunded: "bg-info/15 text-info",
};

export function humanize(value: string): string {
  return value.replace(/_/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/** Coloured status label. If a plain-language explanation exists for the status, an ⓘ is shown next to it. */
export function StatusPill({ status, scope, className }: { status: string; scope?: string; className?: string }) {
  const tipKey = scope ? `${scope}.status.${status}` : "";
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)}>
      <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-medium", TONES[status] ?? "bg-surface-muted")}>{humanize(status)}</span>
      {tipKey && hasTooltip(tipKey) && <InfoTip text={getTooltip(tipKey)} label={`What does ${humanize(status)} mean?`} />}
    </span>
  );
}
