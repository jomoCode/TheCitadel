"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { useSetupActions } from "../hooks/useBillingAdmin";
import type { BillingSettings } from "../types";

function Toggle({ label, tip, checked, onChange }: { label: string; tip: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-lg border border-border p-4">
      <span className="flex items-center gap-1 text-sm font-medium">{label} <InfoTip text={tip} /></span>
      <input type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} className="size-5 accent-gold" />
    </label>
  );
}

/** Billing rules, reminders and receipt details. Saved together; every change goes to the activity log. */
export function BillingSettingsForm({ settings, canEdit }: { settings: BillingSettings; canEdit: boolean }) {
  const { updateSettings } = useSetupActions();
  const [draft, setDraft] = useState(settings);
  const set = (patch: Partial<BillingSettings>) => setDraft((d) => ({ ...d, ...patch }));
  const dirty = JSON.stringify(draft) !== JSON.stringify(settings);

  return (
    <fieldset disabled={!canEdit} className="max-w-2xl space-y-4">
      <Toggle label="Allow part-payments" tip={getTooltip("billing.partial")} checked={draft.partial_payments_enabled} onChange={(v) => set({ partial_payments_enabled: v })} />
      <Toggle label="Residents pay the card fee" tip={getTooltip("billing.fees")} checked={draft.pass_fees_to_payer} onChange={(v) => set({ pass_fees_to_payer: v })} />
      <FormField id="reminders" label="Remind residents this many days before the due date" tip={getTooltip("billing.reminders")}>
        <input id="reminders" value={draft.reminder_days.join(", ")} className={inputClass}
          onChange={(e) => set({ reminder_days: e.target.value.split(",").map((x) => Number(x.trim())).filter((n) => Number.isInteger(n) && n > 0) })} />
      </FormField>
      <h3 className="pt-2 font-display text-xl">Receipt details</h3>
      <FormField id="receipt-name" label="Company name"><input id="receipt-name" value={draft.receipt_company_name} onChange={(e) => set({ receipt_company_name: e.target.value })} className={inputClass} /></FormField>
      <FormField id="receipt-address" label="Address"><input id="receipt-address" value={draft.receipt_company_address} onChange={(e) => set({ receipt_company_address: e.target.value })} className={inputClass} /></FormField>
      <FormField id="receipt-footer" label="Message at the bottom"><input id="receipt-footer" value={draft.receipt_footer} onChange={(e) => set({ receipt_footer: e.target.value })} className={inputClass} /></FormField>
      {canEdit && (
        <Button disabled={!dirty || updateSettings.isPending} onClick={() => updateSettings.mutate({
          partial_payments_enabled: draft.partial_payments_enabled, pass_fees_to_payer: draft.pass_fees_to_payer, reminder_days: draft.reminder_days,
          receipt_company_name: draft.receipt_company_name, receipt_company_address: draft.receipt_company_address, receipt_footer: draft.receipt_footer,
        })}>Save settings</Button>
      )}
    </fieldset>
  );
}
