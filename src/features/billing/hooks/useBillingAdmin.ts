"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { formatKobo } from "@/lib/utils/money";
import { billingAdminApi, paymentsAdminApi } from "../api/BillingApi";
import type { BillBatchInput, BillingSettings, PaymentHead, Schedule } from "../types";

/** Money changes ripple everywhere, so every billing mutation refreshes all billing views. */
export const BILLING_PREFIXES = [["bills"], ["bill"], ["payments"], ["payment"], ["finance"], ["schedules"], ["payment-heads"], ["billing-settings"]] as const;

export const bk = {
  heads: ["payment-heads"] as const,
  bills: (q: object) => ["bills", q] as const,
  bill: (id: string) => ["bill", id] as const,
  schedules: ["schedules"] as const,
  settings: ["billing-settings"] as const,
  payments: (q: object) => ["payments", q] as const,
  payment: (ref: string) => ["payment", ref] as const,
  receipt: (ref: string) => ["payment", ref, "receipt"] as const,
  finance: (q: object) => ["finance", q] as const,
};

export const usePaymentHeads = () => useQuery({ queryKey: bk.heads, queryFn: billingAdminApi.heads, staleTime: 5 * 60_000 });
export const useBills = (q: PageQuery & { status?: string; estate_id?: string; house_id?: string; payment_head_id?: string }, enabled = true) =>
  useQuery({ queryKey: bk.bills(q), queryFn: () => billingAdminApi.bills(q), placeholderData: keepPreviousData, enabled });
export const useBill = (id: string) => useQuery({ queryKey: bk.bill(id), queryFn: () => billingAdminApi.bill(id) });
export const useSchedules = () => useQuery({ queryKey: bk.schedules, queryFn: billingAdminApi.schedules });
export const useBillingSettings = () => useQuery({ queryKey: bk.settings, queryFn: billingAdminApi.settings });
export const usePayments = (q: PageQuery & { status?: string; channel?: string }) =>
  useQuery({ queryKey: bk.payments(q), queryFn: () => paymentsAdminApi.payments(q), placeholderData: keepPreviousData });
export const usePayment = (reference: string) => useQuery({ queryKey: bk.payment(reference), queryFn: () => paymentsAdminApi.payment(reference) });
export const useAdminReceipt = (reference: string) => useQuery({ queryKey: bk.receipt(reference), queryFn: () => paymentsAdminApi.receipt(reference) });
export const useFinanceSummary = (q: { date_from?: string; date_to?: string; estate_id?: string }) =>
  useQuery({ queryKey: bk.finance(q), queryFn: () => paymentsAdminApi.summary(q), placeholderData: keepPreviousData });

export function useBillActions(onDone?: () => void) {
  return {
    createBatch: useMutationWithToast({
      mutationFn: (body: BillBatchInput) => billingAdminApi.createBills(body),
      success: (r) => (r.skipped_duplicates ? `${r.created} bills created · ${r.skipped_duplicates} skipped (already billed)` : `${r.created} bills created`),
      invalidate: BILLING_PREFIXES, onSuccess: onDone,
    }),
    issue: useMutationWithToast({
      mutationFn: (ids: string[]) => billingAdminApi.issueBills(ids),
      success: (r) => `${r.issued} bill${r.issued === 1 ? "" : "s"} sent to residents`, invalidate: BILLING_PREFIXES, onSuccess: onDone,
    }),
    adjust: useMutationWithToast({
      mutationFn: ({ id, ...body }: { id: string; kind: string; amount_kobo?: number; reason: string }) => billingAdminApi.adjustBill(id, body),
      success: (b) => `Saved — balance now ${formatKobo(b.balance_kobo)}`, invalidate: BILLING_PREFIXES, onSuccess: onDone,
    }),
    deleteDraft: useMutationWithToast({ mutationFn: (id: string) => billingAdminApi.deleteDraft(id), success: "Draft deleted", invalidate: BILLING_PREFIXES, onSuccess: onDone }),
  };
}

export function useSetupActions(onDone?: () => void) {
  return {
    createHead: useMutationWithToast({ mutationFn: (b: Partial<PaymentHead> & { name: string }) => billingAdminApi.createHead(b), success: (h) => `${h.name} added`, invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    updateHead: useMutationWithToast({ mutationFn: ({ id, ...b }: Partial<PaymentHead> & { id: string }) => billingAdminApi.updateHead(id, b), success: "Charge type saved", invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    createSchedule: useMutationWithToast({ mutationFn: (b: object) => billingAdminApi.createSchedule(b), success: (s) => `“${s.name}” scheduled`, invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    updateSchedule: useMutationWithToast({ mutationFn: ({ id, ...b }: Partial<Schedule> & { id: string }) => billingAdminApi.updateSchedule(id, b), success: "Recurring charge saved", invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    runSchedules: useMutationWithToast({ mutationFn: () => billingAdminApi.runSchedules(), success: (r) => `${r.bills_created} bills created from recurring charges`, invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    updateSettings: useMutationWithToast({ mutationFn: (b: Partial<BillingSettings>) => billingAdminApi.updateSettings(b), success: "Billing settings saved", invalidate: BILLING_PREFIXES, onSuccess: onDone }),
  };
}

export function usePaymentActions(reference: string, onDone?: () => void) {
  return {
    reverify: useMutationWithToast({ mutationFn: () => paymentsAdminApi.reverify(reference), success: (p) => `Checked with Paystack — ${p.status.replace("_", " ")}`, invalidate: BILLING_PREFIXES, onSuccess: onDone }),
    refund: useMutationWithToast({ mutationFn: (b: { amount_kobo?: number; reason: string }) => paymentsAdminApi.refund(reference, b), success: "Refund recorded", invalidate: BILLING_PREFIXES, onSuccess: onDone }),
  };
}

export function useRecordOffline(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: object) => paymentsAdminApi.recordOffline(body),
    success: (p) => `${formatKobo(p.amount_kobo)} recorded (${p.reference})`, invalidate: BILLING_PREFIXES, onSuccess: onDone,
  });
}
