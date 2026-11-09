"use client";

import { useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Clock, Loader2, XCircle } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { buttonVariants } from "@/components/ui/Button";
import { residentBillingApi } from "@/features/billing/api/BillingApi";
import type { Payment } from "@/features/billing/types";
import { formatKobo } from "@/lib/utils/money";

const MAX_ATTEMPTS = 6;
const DONE = new Set(["successful", "failed", "abandoned", "expired"]);

/**
 * Where Paystack sends people after checkout. The redirect proves nothing on its own,
 * so we ask our server to confirm with Paystack (retrying briefly while the bank finishes).
 */
function PaymentResult() {
  const params = useSearchParams();
  const reference = params.get("reference") ?? params.get("trxref") ?? "";
  const queryClient = useQueryClient();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!reference) return;
    let cancelled = false;
    (async () => {
      for (let attempt = 0; attempt < MAX_ATTEMPTS && !cancelled; attempt++) {
        try {
          const result = await residentBillingApi.verify(reference);
          if (cancelled) return;
          setPayment(result);
          if (DONE.has(result.status)) break;
        } catch {
          if (attempt === MAX_ATTEMPTS - 1 && !cancelled) setFailed(true);
        }
        await new Promise((r) => setTimeout(r, 2000));
      }
      queryClient.invalidateQueries({ queryKey: ["resident-billing"] });
    })();
    return () => { cancelled = true; };
  }, [reference, queryClient]);

  const status = payment?.status;
  const view = !reference || failed
    ? { icon: XCircle, tone: "text-danger", title: "We couldn't find that payment", body: "If money left your account, it will show in your payment history shortly." }
    : !payment || status === "initiated"
      ? { icon: Loader2, tone: "text-gold animate-spin", title: "Confirming your payment…", body: "This usually takes a few seconds. Please don't close this page." }
      : status === "successful"
        ? { icon: CheckCircle2, tone: "text-success", title: "Payment received — thank you!", body: `${formatKobo(payment.total_kobo)} paid. Your bills have been updated.` }
        : status === "pending"
          ? { icon: Clock, tone: "text-warning", title: "Your bank is still processing this", body: "We'll update your bills automatically as soon as it's confirmed." }
          : { icon: XCircle, tone: "text-danger", title: "The payment didn't go through", body: `${payment.failure_reason ?? "No money was taken."} You can try again from your bills.` };

  return (
    <div className="mx-auto flex min-h-[60svh] max-w-md flex-col items-center justify-center text-center">
      <view.icon className={`size-14 ${view.tone}`} aria-hidden />
      <h1 className="mt-5 font-display text-3xl" role="status">{view.title}</h1>
      <p className="mt-2 text-sm text-muted-foreground">{view.body}</p>
      <div className="mt-8 flex w-full flex-col gap-3 sm:flex-row sm:justify-center">
        {status === "successful" && <Link href={`/resident/payments/${reference}/receipt`} className={buttonVariants({ size: "lg" })}>View receipt</Link>}
        <Link href="/resident/bills" className={buttonVariants({ variant: "outline", size: "lg" })}>Back to bills</Link>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return <Suspense><PaymentResult /></Suspense>;
}
