"use client";

import { Minus, Plus } from "lucide-react";
import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useResidentVisitorActions } from "../hooks/useVisitors";
import type { Invitation } from "../types";

type Home = { house_id: string; house_identifier: string | null; estate_name: string | null };
type Props = { open: boolean; onOpenChange: (open: boolean) => void; homes: Home[]; onCreated: (invite: Invitation) => void };

const local = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60_000).toISOString().slice(0, 16);
function preset(kind: "now" | "tonight" | "tomorrow" | "weekend") {
  const now = new Date();
  const at = (days: number, h: number) => { const d = new Date(now); d.setDate(d.getDate() + days); d.setHours(h, 0, 0, 0); return d; };
  if (kind === "now") return { from: now, until: new Date(now.getTime() + 6 * 3_600_000) };
  if (kind === "tonight") return { from: at(0, 17), until: at(0, 23) };
  if (kind === "tomorrow") return { from: at(1, 8), until: at(1, 22) };
  const saturday = (6 - now.getDay() + 7) % 7 || 7;
  return { from: at(saturday, 8), until: at(saturday + 1, 22) };
}
const PRESETS = [{ id: "now", label: "Next 6 hours" }, { id: "tonight", label: "This evening" }, { id: "tomorrow", label: "Tomorrow" }, { id: "weekend", label: "Weekend" }] as const;

export function InviteSheet(props: Props) {
  return <InviteBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Invite a guest in a few taps. Quick time presets cover most visits; "Custom" for anything else. */
function InviteBody({ open, onOpenChange, homes, onCreated }: Props) {
  const { invite } = useResidentVisitorActions();
  const initial = preset("now");
  const [f, setF] = useState({ houseId: homes.length === 1 ? homes[0].house_id : "", name: "", phone: "", purpose: "", headcount: 1, guests: "",
    from: local(initial.from), until: local(initial.until), multi: false, instructions: "", preset: "now" as string });
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));
  const choose = (id: (typeof PRESETS)[number]["id"]) => { const p = preset(id); set({ preset: id, from: local(p.from), until: local(p.until) }); };
  const windowOk = f.from && f.until && new Date(f.until) > new Date(f.from);
  const valid = f.houseId && f.name.trim().length >= 2 && windowOk;

  const submit = () => invite.mutate({
    house_id: f.houseId, visitor_name: f.name.trim(), visitor_phone: f.phone.trim() || null, purpose: f.purpose.trim() || null,
    headcount: f.headcount, guest_names: f.guests.split(",").map((g) => g.trim()).filter(Boolean),
    valid_from: new Date(f.from).toISOString(), valid_until: new Date(f.until).toISOString(), multi_entry: f.multi, instructions: f.instructions.trim() || null,
  }, { onSuccess: (created) => { onOpenChange(false); onCreated(created); } });

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Invite a visitor" tip={getTooltip("visitors.overview")}
      footer={<Button size="lg" className="w-full" disabled={!valid || invite.isPending} onClick={submit}>{invite.isPending ? "Creating pass…" : "Create pass"}</Button>}>
      <div className="space-y-4">
        {homes.length > 1 && (
          <FormField id="visit-house" label="Visiting">
            <select id="visit-house" value={f.houseId} onChange={(e) => set({ houseId: e.target.value })} className={inputClass}>
              <option value="">Choose a home…</option>
              {homes.map((h) => <option key={h.house_id} value={h.house_id}>House {h.house_identifier} · {h.estate_name}</option>)}
            </select>
          </FormField>
        )}
        <FormField id="visit-name" label="Visitor's name"><input id="visit-name" value={f.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} autoComplete="off" /></FormField>
        <div className="flex items-end gap-3">
          <FormField id="visit-phone" label="Phone (optional)" className="flex-1">
            <input id="visit-phone" type="tel" inputMode="tel" value={f.phone} onChange={(e) => set({ phone: e.target.value })} className={inputClass} />
          </FormField>
          <div>
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">People <InfoTip text={getTooltip("visitors.headcount")} /></span>
            <div className="mt-1.5 flex h-12 items-center rounded-brand border border-border">
              <button type="button" aria-label="Fewer people" className="px-3" onClick={() => set({ headcount: Math.max(1, f.headcount - 1) })}><Minus className="size-4" /></button>
              <span className="w-6 text-center tabular-nums" aria-live="polite">{f.headcount}</span>
              <button type="button" aria-label="More people" className="px-3" onClick={() => set({ headcount: Math.min(50, f.headcount + 1) })}><Plus className="size-4" /></button>
            </div>
          </div>
        </div>
        {f.headcount > 1 && (
          <FormField id="visit-guests" label="Other names (optional, comma-separated)">
            <input id="visit-guests" value={f.guests} onChange={(e) => set({ guests: e.target.value })} className={inputClass} />
          </FormField>
        )}
        <fieldset>
          <legend className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">When <InfoTip text={getTooltip("visitors.window")} /></legend>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button key={p.id} type="button" aria-pressed={f.preset === p.id} onClick={() => choose(p.id)}
                className={cn("rounded-full border px-3 py-1.5 text-xs", f.preset === p.id ? "border-foreground bg-foreground text-background" : "border-border")}>{p.label}</button>
            ))}
            <button type="button" aria-pressed={f.preset === "custom"} onClick={() => set({ preset: "custom" })}
              className={cn("rounded-full border px-3 py-1.5 text-xs", f.preset === "custom" ? "border-foreground bg-foreground text-background" : "border-border")}>Custom</button>
          </div>
          {f.preset === "custom" && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input type="datetime-local" aria-label="From" value={f.from} onChange={(e) => set({ from: e.target.value })} className={inputClass} />
              <input type="datetime-local" aria-label="Until" value={f.until} onChange={(e) => set({ until: e.target.value })} className={inputClass} />
            </div>
          )}
          {!windowOk && <p role="alert" className="mt-1 text-xs text-danger">The end must be after the start.</p>}
        </fieldset>
        <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-3 text-sm">
          <span className="flex items-center gap-1">Can come and go several times <InfoTip text={getTooltip("visitors.multiEntry")} /></span>
          <input type="checkbox" role="switch" checked={f.multi} onChange={(e) => set({ multi: e.target.checked })} className="size-5 accent-gold" />
        </label>
        <FormField id="visit-note" label="Note for security (optional)">
          <input id="visit-note" value={f.instructions} onChange={(e) => set({ instructions: e.target.value })} className={inputClass} placeholder="e.g. Delivering furniture — white van" />
        </FormField>
      </div>
    </Sheet>
  );
}
