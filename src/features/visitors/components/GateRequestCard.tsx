"use client";

import { BellRing } from "lucide-react";
import { Button } from "@/components/ui/Button";
import type { GateRequest } from "../types";

/** "Someone is at the gate" — the resident answers with one big tap. */
export function GateRequestCard({ request, onDecide, busy }: { request: GateRequest; onDecide: (approve: boolean) => void; busy?: boolean }) {
  return (
    <article className="rounded-2xl border-2 border-gold bg-gold-soft p-5" role="alert">
      <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-gold"><BellRing className="size-4 animate-pulse" /> At the gate now</p>
      <p className="mt-2 font-display text-2xl">{request.visitor_name}</p>
      <p className="text-sm text-muted-foreground">
        {request.kind === "arrival_approval" ? "Your invited guest has arrived." : request.purpose || "No reason given"}
        {request.headcount > 1 ? ` · ${request.headcount} people` : ""} · House {request.house_identifier}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button size="lg" variant="outline" disabled={busy} onClick={() => onDecide(false)}>Don&apos;t let in</Button>
        <Button size="lg" disabled={busy} onClick={() => onDecide(true)}>Let them in</Button>
      </div>
    </article>
  );
}
