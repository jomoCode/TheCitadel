"use client";

import { useState } from "react";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo, koboToInput, parseNairaToKobo } from "@/lib/utils/money";
import { usePaymentActions } from "../hooks/useBillingAdmin";
import type { PaymentDetail } from "../types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; payment: PaymentDetail };

export function RefundSheet(props: Props) {
  return <RefundBody key={props.open ? "open" : "closed"} {...props} />;
}

/** Administrators only. The refund is added as a new entry; the original payment is never changed. */
function RefundBody({ open, onOpenChange, payment }: Props) {
  const close = () => onOpenChange(false);
  const pending = payment.refunds.filter((r) => r.status === "pending").reduce((s, r) => s + r.amount_kobo, 0);
  const refundable = payment.amount_kobo - payment.refunded_kobo - pending;
  const { refund } = usePaymentActions(payment.reference, close);
  const [amount, setAmount] = useState(koboToInput(Math.max(refundable, 0)));
  const [reason, setReason] = useState("");
  const kobo = parseNairaToKobo(amount);
  const amountError = !kobo ? "Enter an amount" : kobo > refundable ? `You can refund up to ${formatKobo(refundable)}` : null;
  const valid = !amountError && reason.trim().length >= 5;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Refund payment" tip={getTooltip("payments.refund")}
      description={payment.channel === "paystack" ? "Paystack returns the money to the payer's card or account, usually within a few days." : "Hand the money back to the payer, then record it here."}
      footer={<><Button variant="outline" className="flex-1" onClick={close}>Cancel</Button>
        <Button className="flex-2 bg-danger text-white hover:opacity-90" disabled={!valid || refund.isPending}
          onClick={() => refund.mutate({ amount_kobo: kobo ?? undefined, reason: reason.trim() })}>
          {refund.isPending ? "Refunding…" : `Refund ${kobo ? formatKobo(kobo) : ""}`}
        </Button></>}>
      <div className="space-y-4">
        <FormField id="refund-amount" label={`Amount (up to ${formatKobo(refundable)})`} error={amount ? amountError ?? undefined : undefined}>
          <MoneyInput id="refund-amount" value={amount} onChange={(e) => setAmount(e.target.value)} />
        </FormField>
        <FormField id="refund-reason" label="Reason (saved in the history)">
          <textarea id="refund-reason" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} className={inputClass} placeholder="e.g. Paid twice by mistake" />
        </FormField>
        {payment.fee_kobo > 0 && <p className="text-xs text-muted-foreground">The {formatKobo(payment.fee_kobo)} card processing fee is kept by Paystack and isn&apos;t included in refunds.</p>}
      </div>
    </Sheet>
  );
}
