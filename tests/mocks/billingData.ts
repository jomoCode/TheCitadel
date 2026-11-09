import type { Bill, PaymentDetail, ResidentBillingSummary } from "@/features/billing/types";

export const bill = (over: Partial<Bill> = {}): Bill => ({
  id: "b1", reference: "BIL-20261108-AAAAAA", house_id: "h1", house_identifier: "A1", estate_id: "e1", estate_name: "Citadel Gardens",
  payment_head_id: "ph1", payment_head_name: "Service Charge", description: null, amount_kobo: 5_000_000, adjustments_kobo: 0,
  amount_paid_kobo: 0, balance_kobo: 5_000_000, frequency: "monthly", period_start: "2026-11-01", period_end: "2026-11-30",
  issue_date: "2026-11-01", due_date: "2026-11-15", status: "issued", created_at: "2026-11-01T00:00:00Z", ...over,
});

export const summary = (over: Partial<ResidentBillingSummary> = {}): ResidentBillingSummary => ({
  outstanding_kobo: 6_000_000, overdue_kobo: 0, open_bills: 2, partial_payments_enabled: true,
  alerts: [{ level: "due_soon", bill_id: "b1", title: "Service Charge is due in 5 days", message: "Due on 15 Nov 2026.", balance_kobo: 5_000_000, due_date: "2026-11-15" }],
  bills: [bill(), bill({ id: "b2", reference: "BIL-2", payment_head_name: "Water", amount_kobo: 1_000_000, balance_kobo: 1_000_000 })],
  ...over,
});

export const paymentDetail = (over: Partial<PaymentDetail> = {}): PaymentDetail => ({
  id: "p1", reference: "CTD-20261108-PAID01", resident_id: "r1", resident_name: "Ada Obi", channel: "paystack", status: "successful",
  amount_kobo: 5_000_000, fee_kobo: 76_650, total_kobo: 5_076_650, unallocated_kobo: 0, refunded_kobo: 0, currency: "NGN",
  failure_reason: null, external_reference: null, paid_at: "2026-11-08T10:00:00Z", created_at: "2026-11-08T09:59:00Z",
  gateway_reference: "123", evidence_note: null, items: [], refunds: [],
  allocations: [{ bill_id: "b1", bill_reference: "BIL-1", payment_head_name: "Service Charge", amount_kobo: 5_000_000, kind: "payment", created_at: "2026-11-08T10:00:00Z" }],
  events: [{ event: "payment.succeeded", from_status: "initiated", to_status: "successful", data: {}, created_at: "2026-11-08T10:00:00Z" }],
  ...over,
});
