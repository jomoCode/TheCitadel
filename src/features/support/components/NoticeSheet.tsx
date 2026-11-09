"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { HousePicker } from "@/features/estate-core/components/HousePicker";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useNoticeActions } from "../hooks/useSupport";
import type { NoticeScope, Severity } from "../types";
import { FilePicker } from "./Attachments";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };
const SCOPES: { value: NoticeScope; label: string }[] = [
  { value: "general", label: "Everyone" }, { value: "estate", label: "One estate" }, { value: "house", label: "One house" },
];
const SEVERITIES: { value: Severity; label: string }[] = [
  { value: "informational", label: "For information" }, { value: "important", label: "Important" }, { value: "urgent", label: "Urgent" },
];

export function NoticeSheet(props: Props) {
  return <NoticeBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Write a notice, choose who sees it and how important it is, then publish now, schedule, or save a draft. */
function NoticeBody({ open, onOpenChange }: Props) {
  const close = () => onOpenChange(false);
  const estates = useEstates({ page_size: 100, status: "active" });
  const { create } = useNoticeActions(close);
  const [f, setF] = useState({ title: "", body: "", scope: "general" as NoticeScope, estateId: "", houseId: "", severity: "informational" as Severity,
    when: "now" as "now" | "later" | "draft", publishAt: "", expiresAt: "" });
  const [files, setFiles] = useState<File[]>([]);
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));
  const targetOk = f.scope === "general" || (f.scope === "estate" ? Boolean(f.estateId) : Boolean(f.houseId));
  const valid = f.title.trim().length >= 3 && f.body.trim().length >= 3 && targetOk && (f.when !== "later" || Boolean(f.publishAt));
  const toIso = (local: string) => (local ? new Date(local).toISOString() : null);

  const submit = () => create.mutate({
    input: {
      title: f.title.trim(), body: f.body.trim(), scope: f.scope, severity: f.severity,
      estate_id: f.scope === "estate" ? f.estateId : null, house_id: f.scope === "house" ? f.houseId : null,
      publish_now: f.when === "now", publish_at: f.when === "later" ? toIso(f.publishAt) : null, expires_at: toIso(f.expiresAt),
    },
    files,
  });

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New notice" tip={getTooltip("notices.overview")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2" disabled={!valid || create.isPending} onClick={submit}>
          {create.isPending ? "Saving…" : f.when === "now" ? "Publish now" : f.when === "later" ? "Schedule" : "Save draft"}
        </Button></>}>
      <div className="space-y-4">
        <FormField id="notice-title" label="Title"><input id="notice-title" value={f.title} onChange={(e) => set({ title: e.target.value })} className={inputClass} maxLength={140} /></FormField>
        <FormField id="notice-body" label="Message"><textarea id="notice-body" rows={5} value={f.body} onChange={(e) => set({ body: e.target.value })} className={inputClass} /></FormField>
        <fieldset>
          <legend className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Who should see it? <InfoTip text={getTooltip("notices.scope")} /></legend>
          <div className="grid grid-cols-3 gap-2">
            {SCOPES.map((s) => (
              <button key={s.value} type="button" aria-pressed={f.scope === s.value} onClick={() => set({ scope: s.value })}
                className={cn("rounded-lg border px-2 py-2 text-sm", f.scope === s.value ? "border-gold bg-gold-soft" : "border-border")}>{s.label}</button>
            ))}
          </div>
          {f.scope === "estate" && (
            <select aria-label="Estate" value={f.estateId} onChange={(e) => set({ estateId: e.target.value })} className={`${inputClass} mt-3`}>
              <option value="">Choose an estate…</option>
              {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          )}
          {f.scope === "house" && <div className="mt-3"><HousePicker value={f.houseId} onChange={(houseId) => set({ houseId })} idPrefix="notice" /></div>}
        </fieldset>
        <fieldset>
          <legend className="mb-2 flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">How important? <InfoTip text={getTooltip("notices.severity")} /></legend>
          <div className="grid grid-cols-3 gap-2">
            {SEVERITIES.map((s) => (
              <button key={s.value} type="button" aria-pressed={f.severity === s.value} onClick={() => set({ severity: s.value })}
                className={cn("rounded-lg border px-2 py-2 text-sm", f.severity === s.value ? "border-gold bg-gold-soft" : "border-border")}>{s.label}</button>
            ))}
          </div>
        </fieldset>
        <fieldset className="space-y-2">
          <legend className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">When?</legend>
          {(["now", "later", "draft"] as const).map((w) => (
            <label key={w} className="flex items-center gap-2 text-sm">
              <input type="radio" checked={f.when === w} onChange={() => set({ when: w })} className="accent-gold" />
              {w === "now" ? "Publish now and notify residents" : w === "later" ? "Schedule for later" : "Save as a draft"}
            </label>
          ))}
          {f.when === "later" && <input type="datetime-local" aria-label="Publish at" value={f.publishAt} onChange={(e) => set({ publishAt: e.target.value })} className={inputClass} />}
        </fieldset>
        <FormField id="notice-expiry" label="Stop showing it on (optional)" tip={getTooltip("notices.expiry")}>
          <input id="notice-expiry" type="datetime-local" value={f.expiresAt} onChange={(e) => set({ expiresAt: e.target.value })} className={inputClass} />
        </FormField>
        <FilePicker onPick={(file) => setFiles((x) => [...x, file].slice(0, 5))} label="Attach a flyer or PDF" />
        {files.length > 0 && <p className="text-xs text-muted-foreground">{files.map((x) => x.name).join(", ")}</p>}
      </div>
    </Sheet>
  );
}
