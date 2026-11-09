"use client";

import { Lock } from "lucide-react";
import { useState } from "react";
import { MoneyInput } from "@/components/shared/form/MoneyInput";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { Sheet } from "@/components/ui/Sheet";
import { ApiError } from "@/lib/api/ApiClient";
import { getTooltip } from "@/lib/tooltips/registry";
import { formatKobo, koboToInput, parseNairaToKobo } from "@/lib/utils/money";
import { usePaymentQuote, useStartPayment } from "../hooks/useResidentBilling";
import type { Bill, PayItem } from "../types";

type Props = { open: boolean; onOpenChange: (open: boolean) => void; bills: Bill[]; partialAllowed: boolean };

export function PaySheet(props: Props) {
  return <PayBody key={props.open ? props.bills.map((b) => b.id).join() : "closed"} {...props} />;
}

/** Shows exactly what will be charged (bills + card fee) before handing over to Paystack's secure page. */
function PayBody({ open, onOpenChange, bills, partialAllowed }: Props) {
  const single = bills.length === 1 ? bills[0] : null;
  const [partial, setPartial] = useState(single ? koboToInput(single.balance_kobo) : "");
  const partialKobo = single && partialAllowed ? parseNairaToKobo(partial) : null;
  const partialError = single && partialAllowed && (!partialKobo ? "Enter an amount" : partialKobo > single.balance_kobo ? "That's more than you owe" : null);
  const items: PayItem[] = bills.map((b) => (single && partialKobo && partialKobo < b.balance_kobo ? { bill_id: b.id, amount_kobo: partialKobo } : { bill_id: b.id }));
  const quote = usePaymentQuote(partialError ? [] : items);
  const start = useStartPayment();
  const error = (start.error ?? quote.error) instanceof ApiError ? (start.error ?? quote.error)?.message : start.error ? "We couldn't start the payment. Please try again." : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="Review payment"
      footer={<Button size="lg" className="w-full" disabled={!quote.data || Boolean(partialError) || start.isPending || start.isSuccess} onClick={() => start.mutate(items)}>
        <Lock className="size-4" /> {start.isPending || start.isSuccess ? "Opening secure checkout…" : quote.data ? `Pay ${formatKobo(quote.data.total_kobo)}` : "Calculating…"}
      </Button>}>
      <div className="space-y-5">
        <ul className="divide-y divide-border rounded-lg border border-border">
          {bills.map((b) => (
            <li key={b.id} className="flex justify-between gap-3 p-3 text-sm">
              <span>{b.payment_head_name}<span className="block text-xs text-muted-foreground">House {b.house_identifier}</span></span>
              <span className="tabular-nums">{formatKobo(b.balance_kobo)}</span>
            </li>
          ))}
        </ul>
        {single && partialAllowed && (
          <label className="block">
            <span className="flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">Amount to pay now <InfoTip text={getTooltip("resident.bills.partial")} /></span>
            <div className="mt-1.5"><MoneyInput value={partial} onChange={(e) => setPartial(e.target.value)} invalid={Boolean(partialError)} /></div>
            {partialError && <span role="alert" className="mt-1 block text-xs text-danger">{partialError}</span>}
          </label>
        )}
        {quote.data && (
          <dl className="space-y-1.5 rounded-lg bg-surface-muted p-4 text-sm">
            <div className="flex justify-between"><dt>Bills</dt><dd className="tabular-nums">{formatKobo(quote.data.amount_kobo)}</dd></div>
            {quote.data.fee_kobo > 0 && (
              <div className="flex justify-between text-muted-foreground"><dt className="flex items-center gap-1">Card processing fee <InfoTip text={getTooltip("resident.bills.fee")} /></dt><dd className="tabular-nums">{formatKobo(quote.data.fee_kobo)}</dd></div>
            )}
            <div className="flex justify-between border-t border-border pt-2 font-semibold"><dt>Total</dt><dd className="tabular-nums">{formatKobo(quote.data.total_kobo)}</dd></div>
          </dl>
        )}
        {error && <p role="alert" className="rounded-brand bg-danger/10 p-3 text-sm text-danger">{error}</p>}
        <p className="flex items-center gap-1.5 text-xs text-muted-foreground"><Lock className="size-3" /> You&apos;ll pay on Paystack&apos;s secure page. We never see your card details.</p>
      </div>
    </Sheet>
  );
}
