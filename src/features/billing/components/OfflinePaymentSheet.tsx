"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { HousePicker } from "@/features/estate-core/components/HousePicker";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo, koboToInput, parseNairaToKobo } from "@/lib/utils/money";
import { useBills, useRecordOffline } from "../hooks/useBillingAdmin";

const CHANNELS = [
  { value: "bank_transfer", label: "Bank transfer" }, { value: "cash", label: "Cash" }, { value: "pos", label: "POS / card terminal" }, { value: "other", label: "Other" },
];

type Props = { open: boolean; onOpenChange: (open: boolean) => void };

export function OfflinePaymentSheet(props: Props) {
  return <OfflineBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Record money received outside the app and apply it to a house's open bills. */
function OfflineBody({ open, onOpenChange }: Props) {
  const close = () => onOpenChange(false);
  const record = useRecordOffline(close);
  const [houseId, setHouseId] = useState("");
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [channel, setChannel] = useState("bank_transfer");
  const [reference, setReference] = useState("");
  const [paidAt, setPaidAt] = useState(new Date().toISOString().slice(0, 10));
  const [note, setNote] = useState("");
  const bills = useBills({ status: "open", house_id: houseId, page_size: 100 }, Boolean(houseId));
  const houseBills = houseId ? (bills.data?.items ?? []).filter((b) => b.house_id === houseId) : [];

  const items = Object.entries(amounts).map(([bill_id, value]) => ({ bill_id, amount_kobo: parseNairaToKobo(value) })).filter((i) => i.amount_kobo);
  const overpaid = items.some((i) => (i.amount_kobo ?? 0) > (houseBills.find((b) => b.id === i.bill_id)?.balance_kobo ?? 0));
  const total = items.reduce((sum, i) => sum + (i.amount_kobo ?? 0), 0);
  const valid = items.length > 0 && !overpaid && reference.trim().length >= 2 && Boolean(paidAt);

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Record a payment" tip={getTooltip("payments.offline")}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2" disabled={!valid || record.isPending}
          onClick={() => record.mutate({ items, channel, external_reference: reference.trim(), paid_at: paidAt, note: note || null })}>
          {total ? `Record ${formatKobo(total)}` : "Record payment"}
        </Button></>}>
      <div className="space-y-4">
        <HousePicker value={houseId} onChange={(id) => { setHouseId(id); setAmounts({}); }} idPrefix="offline" />
        {houseId && (
          <fieldset className="space-y-2">
            <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Apply to bills</legend>
            {houseBills.length === 0 && <p className="text-sm text-muted-foreground">This house has no unpaid bills.</p>}
            {houseBills.map((b) => (
              <div key={b.id} className="flex items-center gap-3 rounded-lg border border-border p-3">
                <label className="flex flex-1 items-center gap-2 text-sm">
                  <input type="checkbox" className="accent-gold" checked={b.id in amounts}
                    onChange={(e) => setAmounts((a) => { const n = { ...a }; if (e.target.checked) n[b.id] = koboToInput(b.balance_kobo); else delete n[b.id]; return n; })} />
                  <span>{b.payment_head_name}<span className="block text-xs text-muted-foreground">Owed {formatKobo(b.balance_kobo)}</span></span>
                </label>
                {b.id in amounts && (
                  <div className="w-36"><MoneyInput aria-label={`Amount for ${b.payment_head_name}`} value={amounts[b.id]} onChange={(e) => setAmounts({ ...amounts, [b.id]: e.target.value })} /></div>
                )}
              </div>
            ))}
            {overpaid && <p role="alert" className="text-xs text-danger">An amount is more than what is owed on that bill.</p>}
          </fieldset>
        )}
        <div className="grid grid-cols-2 gap-3">
          <FormField id="offline-channel" label="How was it paid?">
            <select id="offline-channel" value={channel} onChange={(e) => setChannel(e.target.value)} className={inputClass}>
              {CHANNELS.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
            </select>
          </FormField>
          <FormField id="offline-date" label="Date received">
            <input id="offline-date" type="date" value={paidAt} onChange={(e) => setPaidAt(e.target.value)} className={inputClass} />
          </FormField>
        </div>
        <FormField id="offline-ref" label="Bank / receipt reference">
          <input id="offline-ref" value={reference} onChange={(e) => setReference(e.target.value)} className={inputClass} placeholder="e.g. GTB-0099887" />
        </FormField>
        <FormField id="offline-note" label="Note (optional)">
          <textarea id="offline-note" rows={2} value={note} onChange={(e) => setNote(e.target.value)} className={inputClass} />
        </FormField>
      </div>
    </Sheet>
  );
}
