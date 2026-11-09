"use client";

import { Clock, ShieldAlert } from "lucide-react";
import { useMemo, useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { useGateActions, useGateHouses, useWalkinStatus } from "@/features/visitors/hooks/useVisitors";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePermission } from "@/providers/AuthProvider";

const STATUS_TEXT = {
  pending: { title: "Waiting for the household…", body: "We've asked them on their phone. This updates by itself.", tone: "border-warning bg-warning/10" },
  approved: { title: "Approved — let them in", body: "The resident has said yes.", tone: "border-success bg-success/10" },
  rejected: { title: "Declined — do not let in", body: "The resident has said no.", tone: "border-danger bg-danger/10" },
  expired: { title: "No answer", body: "The household didn't respond in time. Try calling them, or register again.", tone: "border-border bg-surface" },
  admitted: { title: "Checked in", body: "All done.", tone: "border-success bg-success/10" },
  overridden: { title: "Let in by override", body: "Your reason has been recorded.", tone: "border-warning bg-warning/10" },
} as const;

export default function WalkinPage() {
  const houses = useGateHouses();
  const actions = useGateActions();
  const canOverride = usePermission("visitors.override");
  const [requestId, setRequestId] = useState<string | null>(null);
  const [overriding, setOverriding] = useState(false);
  const [filter, setFilter] = useState("");
  const [f, setF] = useState({ houseId: "", name: "", phone: "", purpose: "", headcount: 1 });
  const status = useWalkinStatus(requestId);
  const shown = useMemo(() => (houses.data ?? []).filter((h) => `${h.identifier} ${h.block ?? ""}`.toLowerCase().includes(filter.toLowerCase())).slice(0, 60), [houses.data, filter]);
  const reset = () => { setRequestId(null); setF({ houseId: "", name: "", phone: "", purpose: "", headcount: 1 }); setFilter(""); };

  if (requestId && status.data) {
    const s = STATUS_TEXT[status.data.status];
    return (
      <div className="space-y-5">
        <section aria-live="assertive" className={`rounded-3xl border-4 p-6 ${s.tone}`}>
          {status.data.status === "pending" && <Clock className="size-10 animate-pulse text-warning" aria-hidden />}
          <p className="mt-2 font-display text-3xl">{s.title}</p>
          <p className="text-sm text-muted-foreground">{s.body}</p>
          <p className="mt-4 text-lg">{status.data.visitor_name} → House {status.data.house_identifier}</p>
        </section>
        {status.data.status === "approved" && (
          <Button size="lg" className="h-16 w-full" disabled={actions.admitWalkin.isPending} onClick={() => actions.admitWalkin.mutate(requestId)}>Check them in</Button>
        )}
        {canOverride && ["pending", "rejected", "expired"].includes(status.data.status) && (
          <Button size="lg" variant="outline" className="w-full border-warning text-warning" onClick={() => setOverriding(true)}>
            <ShieldAlert className="size-5" /> Emergency override
          </Button>
        )}
        <Button size="lg" variant="outline" className="w-full" onClick={reset}>Done — next visitor</Button>
        <ConfirmDialog open={overriding} onOpenChange={setOverriding} requireReason tone="danger" pending={actions.override.isPending}
          title="Let them in without approval?" body={getTooltip("gate.override")} confirmLabel="Override and let in"
          onConfirm={(reason) => actions.override.mutate({ id: requestId, reason }, { onSuccess: () => setOverriding(false) })} />
      </div>
    );
  }

  const valid = f.houseId && f.name.trim().length >= 2;
  return (
    <div className="space-y-5">
      <h1 className="flex items-center gap-1 font-display text-3xl">Visitor without a pass <InfoTip text={getTooltip("gate.walkin")} /></h1>
      <FormField id="w-name" label="Visitor's name"><input id="w-name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} className={`${inputClass} h-14 text-lg`} /></FormField>
      <fieldset>
        <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Which house?</legend>
        <input aria-label="Find house" value={filter} onChange={(e) => setFilter(e.target.value)} placeholder="Type house number…" className={`${inputClass} h-14 text-lg`} />
        <div className="mt-2 grid max-h-56 grid-cols-3 gap-2 overflow-y-auto sm:grid-cols-4">
          {shown.map((h) => (
            <button key={h.id} type="button" aria-pressed={f.houseId === h.id} onClick={() => setF({ ...f, houseId: h.id })}
              className={`rounded-xl border-2 py-3 text-lg ${f.houseId === h.id ? "border-gold bg-gold-soft" : "border-border"}`}>{h.identifier}</button>
          ))}
        </div>
      </fieldset>
      <FormField id="w-purpose" label="Reason for visit (optional)"><input id="w-purpose" value={f.purpose} onChange={(e) => setF({ ...f, purpose: e.target.value })} className={inputClass} placeholder="Delivery, plumber, family…" /></FormField>
      <div className="grid grid-cols-2 gap-3">
        <FormField id="w-phone" label="Phone (optional)"><input id="w-phone" type="tel" value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} className={inputClass} /></FormField>
        <FormField id="w-count" label="People"><input id="w-count" type="number" min={1} max={50} inputMode="numeric" value={f.headcount} onChange={(e) => setF({ ...f, headcount: Math.max(1, Number(e.target.value) || 1) })} className={inputClass} /></FormField>
      </div>
      <Button size="lg" className="h-16 w-full" disabled={!valid || actions.registerWalkin.isPending}
        onClick={() => actions.registerWalkin.mutate({ house_id: f.houseId, visitor_name: f.name.trim(), visitor_phone: f.phone.trim() || null, purpose: f.purpose.trim() || null, headcount: f.headcount },
          { onSuccess: (r) => setRequestId(r.id) })}>
        Ask the household
      </Button>
    </div>
  );
}
