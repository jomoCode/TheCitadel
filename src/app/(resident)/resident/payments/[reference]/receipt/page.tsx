"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { use } from "react";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { ReceiptView } from "@/features/billing/components/ReceiptView";
import { useResidentReceipt } from "@/features/billing/hooks/useResidentBilling";

export default function ResidentReceiptPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = use(params);
  const receipt = useResidentReceipt(reference);
  return (
    <div className="space-y-6">
      <Link href="/resident/bills" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground print:hidden"><ArrowLeft className="size-4" /> Bills</Link>
      {receipt.error && <ErrorState error={receipt.error} />}
      {!receipt.data && !receipt.error && <SkeletonRows rows={4} />}
      {receipt.data && <ReceiptView receipt={receipt.data} />}
    </div>
  );
}
