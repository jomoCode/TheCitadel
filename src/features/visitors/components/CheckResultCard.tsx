import { CheckCircle2, Clock, Users, XCircle } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { GateCheck } from "../types";
import { windowText } from "./PassCard";

const TONE = {
  go: { icon: CheckCircle2, box: "border-success bg-success/10", text: "text-success", title: "Let them in" },
  wait: { icon: Clock, box: "border-warning bg-warning/10", text: "text-warning", title: "Please wait" },
  stop: { icon: XCircle, box: "border-danger bg-danger/10", text: "text-danger", title: "Do not let in" },
};

export function toneFor(check: GateCheck): keyof typeof TONE {
  if (check.can_admit) return "go";
  return check.result === "awaiting_approval" || check.result === "not_yet_valid" ? "wait" : "stop";
}

/** Huge, colour-coded answer an officer can read at a glance — green go, amber wait, red stop. */
export function CheckResultCard({ check, children }: { check: GateCheck; children?: React.ReactNode }) {
  const tone = TONE[toneFor(check)];
  return (
    <section aria-live="assertive" className={cn("rounded-3xl border-4 p-6", tone.box)}>
      <div className="flex items-center gap-3">
        <tone.icon className={cn("size-12 shrink-0", tone.text)} aria-hidden />
        <div>
          <p className={cn("font-display text-3xl leading-tight", tone.text)}>{tone.title}</p>
          <p className="text-sm">{check.message}</p>
        </div>
      </div>
      {check.visitor_name && (
        <dl className="mt-5 grid grid-cols-2 gap-4 border-t border-border/60 pt-5 text-sm">
          <div className="col-span-2"><dt className="text-xs text-muted-foreground">Visitor</dt><dd className="font-display text-2xl">{check.visitor_name}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Going to</dt><dd className="text-lg font-medium">House {check.house_identifier}</dd></div>
          <div><dt className="text-xs text-muted-foreground">Host</dt><dd className="text-lg">{check.host_name ?? "—"}</dd></div>
          <div><dt className="text-xs text-muted-foreground">People</dt><dd className="flex items-center gap-1 text-lg"><Users className="size-4" /> {check.headcount}</dd></div>
          {check.valid_from && check.valid_until && <div><dt className="text-xs text-muted-foreground">Valid</dt><dd>{windowText(check.valid_from, check.valid_until)}</dd></div>}
          {check.guest_names.length > 0 && <div className="col-span-2"><dt className="text-xs text-muted-foreground">With</dt><dd>{check.guest_names.join(", ")}</dd></div>}
          {check.purpose && <div className="col-span-2"><dt className="text-xs text-muted-foreground">Purpose</dt><dd>{check.purpose}</dd></div>}
          {check.instructions && <div className="col-span-2 rounded-xl bg-background/60 p-3"><dt className="text-xs text-muted-foreground">Note from resident</dt><dd>{check.instructions}</dd></div>}
        </dl>
      )}
      {children && <div className="mt-5">{children}</div>}
    </section>
  );
}
