"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { useEstates } from "@/features/estate-core/hooks/useEstates";
import { getTooltip } from "@/lib/tooltips/registry";
import { parseNairaToKobo } from "@/lib/utils/money";
import { usePaymentHeads, useSetupActions } from "../hooks/useBillingAdmin";

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function ScheduleSheet(props: Props) {
  return <ScheduleBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Set up a charge that bills an estate automatically, e.g. service charge on the 1st of each month. */
function ScheduleBody({ open, onOpenChange }: Props) {
  const close = () => onOpenChange(false);
  const heads = usePaymentHeads();
  const estates = useEstates({ page_size: 100, status: "active" });
  const { createSchedule } = useSetupActions(close);
  const nextFirst = (() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth() + 1, 1, 12).toISOString().slice(0, 10); })();
  const [f, setF] = useState({ name: "", headId: "", amount: "", frequency: "monthly", estateId: "", dueDays: "14", firstRun: nextFirst, autoIssue: true });
  const set = (patch: Partial<typeof f>) => setF((x) => ({ ...x, ...patch }));
  const kobo = parseNairaToKobo(f.amount);
  const valid = f.name.trim().length >= 2 && f.headId && kobo && f.estateId && f.firstRun && Number(f.dueDays) >= 0;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New recurring charge" tip={getTooltip("billing.schedules")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2" disabled={!valid || createSchedule.isPending} onClick={() => createSchedule.mutate({
          name: f.name.trim(), payment_head_id: f.headId, amount_kobo: kobo, frequency: f.frequency, target: { estate_id: f.estateId },
          due_days: Number(f.dueDays), auto_issue: f.autoIssue, first_run_date: f.firstRun,
        })}>Save</Button></>}>
      <div className="space-y-4">
        <FormField id="sch-name" label="Name"><input id="sch-name" value={f.name} onChange={(e) => set({ name: e.target.value })} className={inputClass} placeholder="Monthly service charge" /></FormField>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="sch-head" label="Charge type">
            <select id="sch-head" value={f.headId} onChange={(e) => set({ headId: e.target.value })} className={inputClass}>
              <option value="">Choose…</option>
              {heads.data?.filter((h) => h.status === "active").map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
            </select>
          </FormField>
          <FormField id="sch-amount" label="Amount per house"><MoneyInput id="sch-amount" value={f.amount} onChange={(e) => set({ amount: e.target.value })} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="sch-frequency" label="How often">
            <select id="sch-frequency" value={f.frequency} onChange={(e) => set({ frequency: e.target.value })} className={inputClass}>
              <option value="monthly">Monthly</option><option value="quarterly">Quarterly</option><option value="annually">Yearly</option><option value="weekly">Weekly</option>
            </select>
          </FormField>
          <FormField id="sch-first" label="First bill date"><input id="sch-first" type="date" value={f.firstRun} onChange={(e) => set({ firstRun: e.target.value })} className={inputClass} /></FormField>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <FormField id="sch-estate" label="Estate">
            <select id="sch-estate" value={f.estateId} onChange={(e) => set({ estateId: e.target.value })} className={inputClass}>
              <option value="">Choose…</option>
              {estates.data?.items.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
          </FormField>
          <FormField id="sch-due" label="Days to pay"><input id="sch-due" type="number" min={0} max={365} inputMode="numeric" value={f.dueDays} onChange={(e) => set({ dueDays: e.target.value })} className={inputClass} /></FormField>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" className="size-4 accent-gold" checked={f.autoIssue} onChange={(e) => set({ autoIssue: e.target.checked })} />
          Send bills to residents automatically <InfoTip text={getTooltip("billing.autoIssue")} />
        </label>
      </div>
    </Sheet>
  );
}
