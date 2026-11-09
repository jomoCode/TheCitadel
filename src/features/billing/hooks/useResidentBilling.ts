"use client";

import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import type { PageQuery } from "@/features/estate-core/types";
import { residentBillingApi } from "../api/BillingApi";
import type { PayItem } from "../types";

export const rbk = {
  summary: ["resident-billing", "summary"] as const,
  payments: (q: object) => ["resident-billing", "payments", q] as const,
  receipt: (ref: string) => ["resident-billing", "receipt", ref] as const,
  quote: (items: PayItem[]) => ["resident-billing", "quote", items] as const,
};

export const useResidentBillingSummary = () => useQuery({ queryKey: rbk.summary, queryFn: residentBillingApi.summary });
export const useResidentPayments = (q: PageQuery) =>
  useQuery({ queryKey: rbk.payments(q), queryFn: () => residentBillingApi.payments(q), placeholderData: keepPreviousData });
export const useResidentReceipt = (reference: string) => useQuery({ queryKey: rbk.receipt(reference), queryFn: () => residentBillingApi.receipt(reference) });

/** Live fee + total for the current selection (re-quoted whenever the selection changes). */
export function usePaymentQuote(items: PayItem[]) {
  return useQuery({ queryKey: rbk.quote(items), queryFn: () => residentBillingApi.quote(items), enabled: items.length > 0, staleTime: 30_000 });
}

/** Starts checkout and sends the browser to Paystack. */
export function useStartPayment() {
  return useMutation({
    mutationFn: (items: PayItem[]) => residentBillingApi.pay(items),
    onSuccess: (started) => window.location.assign(started.authorization_url),
  });
}
