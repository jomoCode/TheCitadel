import { InfoTip } from "@/components/ui/InfoTip";
import { STATUS_LABELS } from "@/features/marketing/services/PropertyCatalog";
import type { PropertyStatus } from "@/features/marketing/types";
import { cn } from "@/lib/utils/cn";

const TONES: Record<PropertyStatus, string> = {
  selling: "bg-gold text-[#140e0c]",
  offPlan: "bg-white/90 text-[#140e0c]",
  ready: "bg-success text-white",
  soldOut: "bg-[#140e0c]/80 text-white",
};

/** Availability label with a plain-language explanation of what it means. */
export function StatusBadge({ status, className, withTip = true }: { status: PropertyStatus; className?: string; withTip?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1", className)}>
      <span className={cn("text-eyebrow rounded-full px-2.5 py-1 !text-[0.6rem]", TONES[status])}>{STATUS_LABELS[status]}</span>
      {withTip && <InfoTip tip={`marketing.status.${status}`} label={`What does ${STATUS_LABELS[status]} mean?`} />}
    </span>
  );
}
