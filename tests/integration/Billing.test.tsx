import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import AdminPaymentPage from "@/app/(admin)/admin/payments/[reference]/page";
import ResidentBillsPage from "@/app/(resident)/resident/bills/page";
import PaymentCallbackPage from "@/app/(resident)/resident/payments/callback/page";
import { BillBatchSheet } from "@/features/billing/components/BillBatchSheet";
import { API, server } from "../mocks/server";
import { bill, paymentDetail, summary } from "../mocks/billingData";
import { estate, page } from "../mocks/estateData";
import { navigation } from "../setup";
import { ADMIN_PERMS, FakeAuthService, makeToken, RESIDENT_PERMS } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const resident = () => new FakeAuthService(makeToken({ sub: "r1", app_permissions: RESIDENT_PERMS }));
const assign = vi.fn();

beforeEach(() => {
  Object.defineProperty(window, "location", { configurable: true, value: { ...window.location, assign } });
});
afterEach(() => assign.mockReset());

describe("Resident bills", () => {
  it("selecting bills shows the total, then the pay sheet shows the fee and sends the browser to Paystack", async () => {
    let paidItems: unknown = null;
    server.use(
      http.get(`${API}/resident/billing/summary`, () => HttpResponse.json(summary())),
      http.post(`${API}/resident/payments/quote`, () => HttpResponse.json({ amount_kobo: 6_000_000, fee_kobo: 101_523, total_kobo: 6_101_523, fees_passed_to_payer: true })),
      http.post(`${API}/resident/payments`, async ({ request }) => {
        paidItems = ((await request.json()) as { items: unknown }).items;
        return HttpResponse.json({ reference: "CTD-1", authorization_url: "https://checkout.paystack.com/abc", amount_kobo: 6_000_000, fee_kobo: 101_523, total_kobo: 6_101_523, fees_passed_to_payer: true }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ResidentBillsPage />, { auth: resident() });

    expect(await screen.findByText("Service Charge is due in 5 days")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /select all/i }));
    expect(screen.getByText("2 selected")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /pay now/i }));

    const sheet = await screen.findByRole("dialog");
    expect(await within(sheet).findByText(/card processing fee/i)).toBeInTheDocument();
    await user.click(within(sheet).getByRole("button", { name: /pay ₦61,015\.23/i }));
    await vi.waitFor(() => expect(assign).toHaveBeenCalledWith("https://checkout.paystack.com/abc"));
    expect(paidItems).toEqual([{ bill_id: "b1" }, { bill_id: "b2" }]);
  });

  it("allows a part-payment on a single bill and rejects paying more than owed", async () => {
    server.use(
      http.get(`${API}/resident/billing/summary`, () => HttpResponse.json(summary({ bills: [bill()] }))),
      http.post(`${API}/resident/payments/quote`, async ({ request }) => {
        const items = ((await request.json()) as { items: { amount_kobo?: number }[] }).items;
        const amount = items[0].amount_kobo ?? 5_000_000;
        return HttpResponse.json({ amount_kobo: amount, fee_kobo: 0, total_kobo: amount, fees_passed_to_payer: false });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ResidentBillsPage />, { auth: resident() });
    await user.click(await screen.findByRole("checkbox", { name: /service charge/i }));
    await user.click(screen.getByRole("button", { name: /pay now/i }));
    const sheet = await screen.findByRole("dialog");
    const amount = within(sheet).getByRole("textbox");
    await user.clear(amount);
    await user.type(amount, "60000");
    expect(within(sheet).getByRole("alert")).toHaveTextContent(/more than you owe/i);
    await user.clear(amount);
    await user.type(amount, "20000");
    expect(await within(sheet).findByRole("button", { name: /pay ₦20,000\.00/i })).toBeEnabled();
  });
});

describe("Payment callback", () => {
  it("confirms with the server before showing success", async () => {
    navigation.search = "reference=CTD-1&trxref=CTD-1";
    server.use(http.post(`${API}/resident/payments/CTD-1/verify`, () => HttpResponse.json({ ...paymentDetail(), reference: "CTD-1" })));
    renderWithProviders(<PaymentCallbackPage />, { auth: resident() });
    expect(await screen.findByText(/payment received/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /view receipt/i })).toHaveAttribute("href", "/resident/payments/CTD-1/receipt");
  });

  it("explains a failed payment plainly", async () => {
    navigation.search = "reference=CTD-2";
    server.use(http.post(`${API}/resident/payments/CTD-2/verify`, () => HttpResponse.json({ ...paymentDetail(), status: "failed", failure_reason: "Insufficient funds" })));
    renderWithProviders(<PaymentCallbackPage />, { auth: resident() });
    expect(await screen.findByText(/didn't go through/i)).toBeInTheDocument();
    expect(screen.getByText(/insufficient funds/i)).toBeInTheDocument();
  });
});

describe("Admin billing", () => {
  it("bill creation validates in plain words and sends the right payload", async () => {
    let body: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/payment-heads`, () => HttpResponse.json([{ id: "ph1", name: "Service Charge", description: null, status: "active", default_amount_kobo: 5_000_000, default_frequency: "monthly" }])),
      http.get(`${API}/admin/estates`, () => HttpResponse.json(page([estate()]))),
      http.post(`${API}/admin/bills/batch`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ created: 31, skipped_duplicates: 1, skipped_inactive: 0, bill_ids: [] }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<BillBatchSheet open onOpenChange={() => {}} />, { auth: new FakeAuthService(makeToken({ app_permissions: ADMIN_PERMS })) });
    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("button", { name: /create & send/i }));
    expect(within(sheet).getByText("Choose what you are billing for")).toBeInTheDocument();

    await user.selectOptions(await within(sheet).findByLabelText("Charge type", { selector: "select" }), "ph1");
    expect(within(sheet).getByLabelText("Amount per house")).toHaveValue("50000");
    await user.selectOptions(within(sheet).getByRole("combobox", { name: "Estate" }), "e1");
    await user.click(within(sheet).getByRole("button", { name: /create & send/i }));
    expect(await screen.findByText(/31 bills created · 1 skipped/i)).toBeInTheDocument();
    expect(body).toMatchObject({ payment_head_id: "ph1", amount_kobo: 5_000_000, frequency: "monthly", target: { estate_id: "e1" }, as_draft: false });
  });

  it.each([
    ["administrator", true],
    ["accountant", false],
  ])("refund button for %s: %s", async (role, visible) => {
    server.use(http.get(`${API}/admin/payments/CTD-20261108-PAID01`, () => HttpResponse.json(paymentDetail())));
    const auth = new FakeAuthService(makeToken({ app_permissions: [...ADMIN_PERMS, "payments.view", "payments.refund"], app_roles: [role] }));
    const params = Promise.resolve({ reference: "CTD-20261108-PAID01" }); // stable across renders, as Next.js provides it
    await act(async () => {
      renderWithProviders(<Suspense><AdminPaymentPage params={params} /></Suspense>, { auth });
    });
    expect(await screen.findByText("Applied to")).toBeInTheDocument();
    expect(Boolean(screen.queryByRole("button", { name: /^refund$/i }))).toBe(visible);
  });
});
