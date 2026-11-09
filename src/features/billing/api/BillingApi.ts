import type { Page, PageQuery } from "@/features/estate-core/types";
import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type {
  Bill,
  BillBatchInput,
  BillBatchResult,
  BillDetail,
  BillingSettings,
  FinanceSummary,
  PayItem,
  Payment,
  PaymentDetail,
  PaymentHead,
  PaymentInitiated,
  PaymentQuote,
  Receipt,
  ResidentBillingSummary,
  Schedule,
} from "../types";

type BillQuery = PageQuery & { status?: string; estate_id?: string; house_id?: string; payment_head_id?: string };
type PaymentQuery = PageQuery & { status?: string; channel?: string; date_from?: string; date_to?: string };

/** Admin billing endpoints: charge types, bills, recurring charges and settings. */
export class BillingAdminApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  heads = () => this.api.get<PaymentHead[]>("/admin/payment-heads");
  createHead = (body: Partial<PaymentHead> & { name: string }) => this.api.post<PaymentHead>("/admin/payment-heads", body);
  updateHead = (id: string, body: Partial<PaymentHead>) => this.api.patch<PaymentHead>(`/admin/payment-heads/${id}`, body);

  bills = (q: BillQuery) => this.api.get<Page<Bill>>("/admin/bills", q);
  bill = (id: string) => this.api.get<BillDetail>(`/admin/bills/${id}`);
  createBills = (body: BillBatchInput) => this.api.post<BillBatchResult>("/admin/bills/batch", body);
  issueBills = (billIds: string[]) => this.api.post<{ issued: number }>("/admin/bills/issue", { bill_ids: billIds });
  adjustBill = (id: string, body: { kind: string; amount_kobo?: number; reason: string }) => this.api.post<Bill>(`/admin/bills/${id}/adjustments`, body);
  deleteDraft = (id: string) => this.api.delete<void>(`/admin/bills/${id}`);

  schedules = () => this.api.get<Schedule[]>("/admin/bill-schedules");
  createSchedule = (body: object) => this.api.post<Schedule>("/admin/bill-schedules", body);
  updateSchedule = (id: string, body: Partial<Schedule>) => this.api.patch<Schedule>(`/admin/bill-schedules/${id}`, body);
  runSchedules = () => this.api.post<{ schedules_run: number; bills_created: number; skipped_duplicates: number }>("/admin/bill-schedules/run");

  settings = () => this.api.get<BillingSettings>("/admin/billing-settings");
  updateSettings = (body: Partial<BillingSettings>) => this.api.patch<BillingSettings>("/admin/billing-settings", body);
}

/** Admin payments, refunds and reports. */
export class PaymentsAdminApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  payments = (q: PaymentQuery) => this.api.get<Page<Payment>>("/admin/payments", q);
  payment = (reference: string) => this.api.get<PaymentDetail>(`/admin/payments/${reference}`);
  recordOffline = (body: object) => this.api.post<Payment>("/admin/payments/offline", body);
  reverify = (reference: string) => this.api.post<Payment>(`/admin/payments/${reference}/verify`);
  refund = (reference: string, body: { amount_kobo?: number; reason: string }) => this.api.post<PaymentDetail>(`/admin/payments/${reference}/refunds`, body);
  receipt = (reference: string) => this.api.get<Receipt>(`/admin/payments/${reference}/receipt`);
  summary = (q: { date_from?: string; date_to?: string; estate_id?: string }) => this.api.get<FinanceSummary>("/admin/finance/summary", q);
}

/** Resident self-service billing. */
export class ResidentBillingApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  summary = () => this.api.get<ResidentBillingSummary>("/resident/billing/summary");
  bills = (q: BillQuery) => this.api.get<Page<Bill>>("/resident/bills", q);
  quote = (items: PayItem[]) => this.api.post<PaymentQuote>("/resident/payments/quote", { items });
  pay = (items: PayItem[]) => this.api.post<PaymentInitiated>("/resident/payments", { items });
  verify = (reference: string) => this.api.post<Payment>(`/resident/payments/${reference}/verify`);
  payments = (q: PageQuery) => this.api.get<Page<Payment>>("/resident/payments", q);
  receipt = (reference: string) => this.api.get<Receipt>(`/resident/payments/${reference}/receipt`);
}

export const billingAdminApi = new BillingAdminApi();
export const paymentsAdminApi = new PaymentsAdminApi();
export const residentBillingApi = new ResidentBillingApi();
