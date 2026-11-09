"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { formatKobo, parseNairaToKobo } from "@/lib/utils/money";
import { useBillActions } from "../hooks/useBillingAdmin";
import type { Bill } from "../types";

type Kind = "credit" | "debit" | "write_off" | "cancellation";
const KINDS: { value: Kind; label: string; tip: string; needsAmount: boolean }[] = [
  { value: "credit", label: "Reduce (credit)", tip: "billing.credit", needsAmount: true },
  { value: "debit", label: "Increase (debit)", tip: "billing.debit", needsAmount: true },
  { value: "write_off", label: "Write off", tip: "billing.writeOff", needsAmount: false },
  { value: "cancellation", label: "Cancel bill", tip: "billing.cancel", needsAmount: false },
];

type Props = { open: boolean; onOpenChange: (open: boolean) => void; bill: Bill };

export function AdjustBillSheet(props: Props) {
  return <AdjustBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Corrections are added alongside the bill with a reason; the original amount is never edited. */
function AdjustBody({ open, onOpenChange, bill }: Props) {
  const close = () => onOpenChange(false);
  const { adjust } = useBillActions(close);
  const [kind, setKind] = useState<Kind>("credit");
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");
  const option = KINDS.find((k) => k.value === kind)!;
  const kobo = parseNairaToKobo(amount);
  const amountError = option.needsAmount && (!kobo ? "Enter an amount" : kind === "credit" && kobo > bill.balance_kobo ? "A credit can't be more than what is owed" : null);
  const cancelBlocked = kind === "cancellation" && bill.amount_paid_kobo > 0;
  const valid = !amountError && !cancelBlocked && reason.trim().length >= 3;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Correct this bill" tip={getTooltip("billing.adjust")}
      description={`Currently owed: ${formatKobo(bill.balance_kobo)}`}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2" disabled={!valid || adjust.isPending}
          onClick={() => adjust.mutate({ id: bill.id, kind, amount_kobo: option.needsAmount ? kobo ?? undefined : undefined, reason: reason.trim() })}>
          Save correction
        </Button></>}>
      <div className="space-y-4">
        <div role="radiogroup" aria-label="Type of correction" className="grid grid-cols-2 gap-2">
          {KINDS.map((k) => (
            <button key={k.value} type="button" role="radio" aria-checked={kind === k.value} onClick={() => setKind(k.value)}
              className={cn("rounded-lg border p-3 text-left text-sm", kind === k.value ? "border-gold bg-gold-soft" : "border-border")}>
              <span className="font-medium">{k.label}</span>
              <span className="mt-1 block text-xs text-muted-foreground">{getTooltip(k.tip)}</span>
            </button>
          ))}
        </div>
        {option.needsAmount && (
          <FormField id="adjust-amount" label="Amount" error={amount ? amountError || undefined : undefined}>
            <MoneyInput id="adjust-amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
          </FormField>
        )}
        {cancelBlocked && <p role="alert" className="rounded-brand bg-warning/10 p-3 text-sm text-warning">This bill already has payments, so it can&apos;t be cancelled. Use a credit or write-off instead.</p>}
        <FormField id="adjust-reason" label="Reason (saved in the history)">
          <textarea id="adjust-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} />
        </FormField>
      </div>
    </Sheet>
  );
}
