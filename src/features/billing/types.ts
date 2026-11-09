/** Mirrors backend app/contracts/billing.py and payment.py. Money is integer kobo. */

export type Frequency = "one_time" | "weekly" | "monthly" | "quarterly" | "annually" | "custom";
export type BillStatus = "draft" | "issued" | "partially_paid" | "paid" | "overdue" | "cancelled" | "written_off";
export type PaymentStatus =
  | "initiated" | "pending" | "successful" | "failed" | "abandoned" | "expired" | "reversed" | "refunded" | "partially_refunded";

export type PaymentHead = {
  id: string;
  name: string;
  description: string | null;
  status: "active" | "inactive";
  default_amount_kobo: number | null;
  default_frequency: Frequency | null;
};

export type Bill = {
  id: string;
  reference: string;
  house_id: string;
  house_identifier: string | null;
  estate_id: string;
  estate_name: string | null;
  payment_head_id: string;
  payment_head_name: string | null;
  description: string | null;
  amount_kobo: number;
  adjustments_kobo: number;
  amount_paid_kobo: number;
  balance_kobo: number;
  frequency: Frequency;
  period_start: string | null;
  period_end: string | null;
  issue_date: string;
  due_date: string;
  status: BillStatus;
  created_at: string;
};

export type Adjustment = { id: string; kind: "credit" | "debit" | "write_off" | "cancellation"; amount_kobo: number; balance_before_kobo: number; reason: string; created_at: string };
export type BillDetail = { bill: Bill; adjustments: Adjustment[]; payments: { payment_reference: string; channel: string; amount_kobo: number; kind: string; created_at: string }[] };

export type BillTarget = { estate_id?: string; house_ids?: string[] };
export type BillBatchInput = {
  payment_head_id: string;
  amount_kobo: number;
  description?: string | null;
  frequency: Frequency;
  period_start?: string | null;
  period_end?: string | null;
  issue_date?: string | null;
  due_date: string;
  target: BillTarget;
  as_draft: boolean;
};
export type BillBatchResult = { created: number; skipped_duplicates: number; skipped_inactive: number; bill_ids: string[] };

export type Schedule = {
  id: string;
  name: string;
  payment_head_id: string;
  payment_head_name: string | null;
  amount_kobo: number;
  frequency: "weekly" | "monthly" | "quarterly" | "annually";
  estate_id: string | null;
  estate_name: string | null;
  house_ids: string[] | null;
  due_days: number;
  auto_issue: boolean;
  next_run_date: string;
  status: "active" | "paused";
  last_run_at: string | null;
};

export type BillingSettings = {
  partial_payments_enabled: boolean;
  pass_fees_to_payer: boolean;
  fee_percent_bp: number;
  fee_flat_kobo: number;
  fee_flat_waiver_below_kobo: number;
  fee_cap_kobo: number;
  reminder_days: number[];
  receipt_company_name: string;
  receipt_company_address: string;
  receipt_footer: string;
};

export type Payment = {
  id: string;
  reference: string;
  resident_id: string | null;
  resident_name: string | null;
  channel: "paystack" | "bank_transfer" | "cash" | "pos" | "other";
  status: PaymentStatus;
  amount_kobo: number;
  fee_kobo: number;
  total_kobo: number;
  unallocated_kobo: number;
  refunded_kobo: number;
  currency: string;
  failure_reason: string | null;
  external_reference: string | null;
  paid_at: string | null;
  created_at: string;
};

export type Allocation = { bill_id: string; bill_reference: string | null; payment_head_name: string | null; amount_kobo: number; kind: string; created_at: string };
export type PaymentDetail = Payment & {
  gateway_reference: string | null;
  evidence_note: string | null;
  items: Allocation[];
  allocations: Allocation[];
  events: { event: string; from_status: string | null; to_status: string | null; data: Record<string, unknown>; created_at: string }[];
  refunds: { id: string; amount_kobo: number; reason: string; status: string; created_at: string; processed_at: string | null }[];
};

export type PayItem = { bill_id: string; amount_kobo?: number };
export type PaymentQuote = { amount_kobo: number; fee_kobo: number; total_kobo: number; fees_passed_to_payer: boolean };
export type PaymentInitiated = PaymentQuote & { reference: string; authorization_url: string };

export type Receipt = {
  reference: string;
  paid_at: string | null;
  payer_name: string | null;
  payer_email: string | null;
  channel: string;
  lines: Allocation[];
  amount_kobo: number;
  fee_kobo: number;
  total_kobo: number;
  refunded_kobo: number;
  status: PaymentStatus;
  company_name: string;
  company_address: string;
  footer: string;
};

export type FinanceRow = { id: string; name: string; billed_kobo: number; collected_kobo: number; outstanding_kobo: number };
export type FinanceSummary = {
  date_from: string;
  date_to: string;
  bills_count: number;
  billed_kobo: number;
  collected_kobo: number;
  outstanding_kobo: number;
  open_bills_count: number;
  overdue_kobo: number;
  overdue_count: number;
  failed_attempts: number;
  refunded_kobo: number;
  by_head: FinanceRow[];
  by_estate: FinanceRow[];
};

export type BillAlert = { level: "overdue" | "due_soon" | "due_tomorrow"; bill_id: string; title: string; message: string; balance_kobo: number; due_date: string };
export type ResidentBillingSummary = {
  outstanding_kobo: number;
  overdue_kobo: number;
  open_bills: number;
  partial_payments_enabled: boolean;
  alerts: BillAlert[];
  bills: Bill[];
};
