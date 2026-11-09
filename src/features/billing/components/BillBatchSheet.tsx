"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { useEstates, useHouses } from "@/features/estate-core/hooks/useEstates";
import { getTooltip } from "@/lib/tooltips/registry";
import { koboToInput, parseNairaToKobo } from "@/lib/utils/money";
import { useBillActions, usePaymentHeads } from "../hooks/useBillingAdmin";
import type { Frequency } from "../types";

const FREQUENCIES: { value: Frequency; label: string }[] = [
  { value: "monthly", label: "Monthly" }, { value: "quarterly", label: "Quarterly" }, { value: "annually", label: "Yearly" },
  { value: "weekly", label: "Weekly" }, { value: "one_time", label: "One-time" }, { value: "custom", label: "Custom dates" },
];
const iso = (d: Date) => d.toISOString().slice(0, 10);
const inDays = (n: number) => iso(new Date(Date.now() + n * 86_400_000));

type Props = { open: boolean; onOpenChange: (open: boolean) => void; defaultEstateId?: string };

export function BillBatchSheet(props: Props) {
  return <BillBatchBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Bill a whole estate or chosen houses in one go. Duplicate bills for the same period are skipped automatically. */
function BillBatchBody({ open, onOpenChange, defaultEstateId }: Props) {
  const close = () => onOpenChange(false);
  const heads = usePaymentHeads();
  const estates = useEstates({ page_size: 100, status: "active" });
  const { createBatch } = useBillActions(close);
  const [form, setForm] = useState({
    headId: "", amount: "", frequency: "monthly" as Frequency, periodStart: iso(new Date()), periodEnd: "", issueDate: iso(new Date()),
    dueDate: inDays(14), description: "", targetMode: "estate" as "estate" | "houses", estateId: defaultEstateId ?? "", houseIds: [] as string[], asDraft: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const houses = useHouses({ estate_id: form.estateId, page_size: 100 }, form.targetMode === "houses" && Boolean(form.estateId));
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }));

  const amountKobo = parseNairaToKobo(form.amount);
  const needsStart = form.frequency !== "one_time";
  const needsEnd = form.frequency === "custom";
  const errors = {
    headId: !form.headId && "Choose what you are billing for",
    amount: !amountKobo && "Enter an amount, e.g. 50,000",
    periodStart: needsStart && !form.periodStart && "Choose the billing period",
    periodEnd: needsEnd && (!form.periodEnd || form.periodEnd < form.periodStart) && "The end date must be on or after the start date",
    dueDate: (!form.dueDate || form.dueDate < form.issueDate) && "The due date can't be before the issue date",
    target: (form.targetMode === "estate" ? !form.estateId : form.houseIds.length === 0) && "Choose who to bill",
  };
  const valid = !Object.values(errors).some(Boolean);
  const show = (key: keyof typeof errors) => (submitted && errors[key]) || undefined;

  const pickHead = (headId: string) => {
    const head = heads.data?.find((h) => h.id === headId);
    set({ headId, ...(head?.default_amount_kobo && !form.amount ? { amount: koboToInput(head.default_amount_kobo) } : {}),
          ...(head?.default_frequency ? { frequency: head.default_frequency } : {}) });
  };

  const submit = () => {
    setSubmitted(true);
    if (!valid || !amountKobo) return;
    createBatch.mutate({
      payment_head_id: form.headId, amount_kobo: amountKobo, description: form.description || null, frequency: form.frequency,
      period_start: needsStart || form.periodEnd ? form.periodStart : null, period_end: form.periodEnd || null,
      issue_date: form.issueDate, due_date: form.dueDate, as_draft: form.asDraft,
      target: form.targetMode === "estate" ? { estate_id: form.estateId } : { house_ids: form.houseIds },
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Create bills" tip={getTooltip("billing.bills")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2" onClick={submit} disabled={createBatch.isPending}>{createBatch.isPending ? "Creating…" : form.asDraft ? "Save as drafts" : "Create & send"}</Button></>}>
      <div className="space-y-4">
        <FormField id="bill-head" label="Charge type" tip={getTooltip("billing.paymentHeads")} error={show("headId")}>
          <select id="bill-head" value={form.headId} onChange={(e) => pickHead(e.target.value)} className={inputClass}>
            <option value="">Choose…</option>
            {heads.data?.filter((h) => h.status === "active").map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
          </select>
        </FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="bill-amount" label="Amount per house" error={show("amount")}>
            <MoneyInput id="bill-amount" value={form.amount} onChange={(e) => set({ amount: e.target.value })} placeholder="50,000" invalid={Boolean(show("amount"))} />
          </FormField>
          <FormField id="bill-frequency" label="Billing duration" tip={getTooltip("billing.frequency")}>
            <select id="bill-frequency" value={form.frequency} onChange={(e) => set({ frequency: e.target.value as Frequency })} className={inputClass}>
              {FREQUENCIES.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
            </select>
          </FormField>
        </div>
        {form.frequency !== "one_time" && (
          <div className="grid grid-cols-2 gap-3">
            <FormField id="bill-period" label={needsEnd ? "Period starts" : "Any day in the period"} tip={getTooltip("billing.period")} error={show("periodStart")}>
              <input id="bill-period" type="date" value={form.periodStart} onChange={(e) => set({ periodStart: e.target.value })} className={inputClass} />
            </FormField>
            {needsEnd && (
              <FormField id="bill-period-end" label="Period ends" error={show("periodEnd")}>
                <input id="bill-period-end" type="date" value={form.periodEnd} onChange={(e) => set({ periodEnd: e.target.value })} className={inputClass} />
              </FormField>
            )}
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField id="bill-issue" label="Issue date">
            <input id="bill-issue" type="date" value={form.issueDate} onChange={(e) => set({ issueDate: e.target.value })} className={inputClass} />
          </FormField>
          <FormField id="bill-due" label="Due date" tip={getTooltip("billing.dueDate")} error={show("dueDate")}>
            <input id="bill-due" type="date" value={form.dueDate} onChange={(e) => set({ dueDate: e.target.value })} className={inputClass} />
          </FormField>
        </div>
        <FormField id="bill-description" label="Note on the bill (optional)">
          <input id="bill-description" value={form.description} onChange={(e) => set({ description: e.target.value })} className={inputClass} placeholder="e.g. November service charge" />
        </FormField>

        <fieldset className="space-y-3 rounded-lg border border-border p-4">
          <legend className="flex items-center gap-1 px-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Who to bill <InfoTip text={getTooltip("billing.target")} /></legend>
          <div className="flex gap-4 text-sm">
            {(["estate", "houses"] as const).map((mode) => (
              <label key={mode} className="flex items-center gap-2">
                <input type="radio" checked={form.targetMode === mode} onChange={() => set({ targetMode: mode, houseIds: [] })} className="accent-gold" />
                {mode === "estate" ? "Every house in an estate" : "Specific houses"}
              </label>
            ))}
          </div>
          <select aria-label="Estate" value={form.estateId} onChange={(e) => set({ estateId: e.target.value, houseIds: [] })} className={inputClass}>
            <option value="">Choose an estate…</option>
            {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name} ({e.house_count} houses)</option>)}
          </select>
          {form.targetMode === "houses" && form.estateId && (
            <ul className="max-h-52 space-y-1 overflow-y-auto">
              {houses.data?.items.filter((h) => h.status !== "inactive").map((h) => (
                <li key={h.id}>
                  <label className="flex items-center gap-2 rounded px-2 py-1.5 text-sm hover:bg-surface-muted">
                    <input type="checkbox" className="accent-gold" checked={form.houseIds.includes(h.id)}
                      onChange={(e) => set({ houseIds: e.target.checked ? [...form.houseIds, h.id] : form.houseIds.filter((x) => x !== h.id) })} />
                    House {h.identifier}{h.block ? ` · ${h.block}` : ""}
                  </label>
                </li>
              ))}
            </ul>
          )}
          {show("target") && <p role="alert" className="text-xs text-danger">{show("target")}</p>}
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.asDraft} onChange={(e) => set({ asDraft: e.target.checked })} className="size-4 accent-gold" />
          Save as drafts so I can check before sending <InfoTip text={getTooltip("billing.draft")} />
        </label>
      </div>
    </Sheet>
  );
}
