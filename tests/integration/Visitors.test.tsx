import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it, vi } from "vitest";
import GateCheckPage from "@/app/(security)/security/page";
import WalkinPage from "@/app/(security)/security/walkin/page";
import { GateOfficers } from "@/features/visitors/components/admin/GateOfficers";
import { VisitorSettingsCard } from "@/features/visitors/components/admin/VisitorSettingsCard";
import { GateRequestCard } from "@/features/visitors/components/GateRequestCard";
import { InviteSheet } from "@/features/visitors/components/InviteSheet";
import type { GateCheck, GateRequest, Invitation, Visit } from "@/features/visitors/types";
import { estate, page, resident as account } from "../mocks/estateData";
import { API, server } from "../mocks/server";
import { ADMIN_PERMS, FakeAuthService, makeToken, RESIDENT_PERMS } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const residentAuth = () => new FakeAuthService(makeToken({ sub: "r1", app_permissions: RESIDENT_PERMS }));
const officer = (perms: string[] = ["visitors.verify"]) => new FakeAuthService(makeToken({ sub: "g1", app_permissions: perms }));
const admin = () => new FakeAuthService(makeToken({ sub: "a1", app_permissions: [...ADMIN_PERMS, "visitors.view"] }));

const invitation = (over: Partial<Invitation> = {}): Invitation => ({
  id: "i1", reference: "VIS-1", pass_code: "ABCD-2345", house_id: "h1", house_identifier: "A1", estate_id: "e1", estate_name: "Citadel Gardens",
  visitor_name: "Tunde Bello", visitor_phone: null, purpose: null, headcount: 1, guest_names: [], valid_from: "2026-11-08T09:00:00Z",
  valid_until: "2026-11-08T21:00:00Z", multi_entry: false, entries_used: 0, requires_approval: false, instructions: null, status: "active", created_at: "2026-11-08T08:00:00Z", ...over,
});
const gateCheck = (over: Partial<GateCheck> = {}): GateCheck => ({
  result: "valid", message: "Pass is valid.", can_admit: true, invitation_id: "i1", approval_request_id: null, visitor_name: "Tunde Bello", headcount: 2,
  guest_names: ["Kemi"], house_identifier: "A1", host_name: "Ada Obi", purpose: "Dinner", instructions: null, valid_from: null, valid_until: null, entries_used: 0, multi_entry: false, ...over,
});
const request = (over: Partial<GateRequest> = {}): GateRequest => ({
  id: "w1", reference: "GATE-1", kind: "walkin", house_id: "h1", house_identifier: "A1", estate_id: "e1", visitor_name: "Musa", visitor_phone: null, purpose: "Delivery",
  headcount: 1, status: "pending", invitation_id: null, decision_note: null, decided_at: null, created_at: "2026-11-08T10:00:00Z", ...over,
});
const visit = (over: Partial<Visit> = {}): Visit => ({
  id: "v1", estate_id: "e1", estate_name: "Citadel Gardens", house_id: "h1", house_identifier: "A1", visitor_name: "Tunde Bello", headcount: 1, entry_method: "pass",
  override_reason: null, entered_at: "2026-11-08T10:00:00Z", exited_at: null, status: "inside", entry_officer_name: "Sani", ...over,
});

describe("Resident: invite a visitor", () => {
  it("creates a pass for the only home and hands it back", async () => {
    let body: Record<string, unknown> = {};
    server.use(http.post(`${API}/resident/visitors/invitations`, async ({ request: r }) => {
      body = (await r.json()) as Record<string, unknown>;
      return HttpResponse.json(invitation(), { status: 201 });
    }));
    const onCreated = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<InviteSheet open onOpenChange={() => {}} homes={[{ house_id: "h1", house_identifier: "A1", estate_name: "Citadel Gardens" }]} onCreated={onCreated} />, { auth: residentAuth() });
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByRole("button", { name: "Create pass" })).toBeDisabled();

    await user.type(within(sheet).getByLabelText("Visitor's name"), "Tunde Bello");
    await user.click(within(sheet).getByRole("button", { name: "More people" }));
    await user.click(within(sheet).getByRole("button", { name: "Create pass" }));

    await vi.waitFor(() => expect(onCreated).toHaveBeenCalledWith(expect.objectContaining({ pass_code: "ABCD-2345" })));
    expect(body).toMatchObject({ house_id: "h1", visitor_name: "Tunde Bello", headcount: 2, multi_entry: false });
    expect(new Date(body.valid_until as string) > new Date(body.valid_from as string)).toBe(true);
  });

  it("lets the resident answer a gate request", async () => {
    const onDecide = vi.fn();
    const user = userEvent.setup();
    renderWithProviders(<GateRequestCard request={request()} onDecide={onDecide} />, { auth: residentAuth() });
    expect(screen.getByText(/Musa/)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Let them in" }));
    expect(onDecide).toHaveBeenCalledWith(true);
  });
});

describe("Gate: check a pass", () => {
  it("shows a green answer and checks the visitor in", async () => {
    let sent = "";
    let admitted = false;
    server.use(
      http.post(`${API}/security/check`, async ({ request: r }) => { sent = ((await r.json()) as { code: string }).code; return HttpResponse.json(gateCheck()); }),
      http.post(`${API}/security/invitations/i1/admit`, () => { admitted = true; return HttpResponse.json(visit(), { status: 201 }); }),
    );
    const user = userEvent.setup();
    renderWithProviders(<GateCheckPage />, { auth: officer() });
    const input = screen.getByPlaceholderText("ABCD-2345");
    expect(screen.getByRole("button", { name: /check$/i })).toBeDisabled();

    await user.type(input, "abcd2345");
    expect(input).toHaveValue("ABCD-2345");
    await user.click(screen.getByRole("button", { name: /check$/i }));

    expect(await screen.findByText("Let them in")).toBeInTheDocument();
    expect(screen.getByText("Tunde Bello")).toBeInTheDocument();
    expect(screen.getByText("House A1")).toBeInTheDocument();
    expect(sent).toBe("ABCD-2345");

    await user.click(screen.getByRole("button", { name: "Check them in" }));
    expect(await screen.findByText(/Checked in/)).toBeInTheDocument();
    expect(admitted).toBe(true);
  });

  it("shows a red answer with no way to admit for an expired pass", async () => {
    server.use(http.post(`${API}/security/check`, () => HttpResponse.json(gateCheck({ result: "expired", can_admit: false, message: "This pass has expired." }))));
    const user = userEvent.setup();
    renderWithProviders(<GateCheckPage />, { auth: officer() });
    await user.type(screen.getByPlaceholderText("ABCD-2345"), "ABCD2345{Enter}");
    expect(await screen.findByText("Do not let in")).toBeInTheDocument();
    expect(screen.getByText("This pass has expired.")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Check them in" })).not.toBeInTheDocument();
  });
});

describe("Gate: visitor without a pass", () => {
  const houses = http.get(`${API}/security/houses`, () => HttpResponse.json([{ id: "h1", identifier: "A1", block: null }, { id: "h2", identifier: "B4", block: null }]));

  it("asks the household, then allows an emergency override with a reason", async () => {
    let registered: Record<string, unknown> = {};
    let reason = "";
    server.use(
      houses,
      http.post(`${API}/security/walkins`, async ({ request: r }) => { registered = (await r.json()) as Record<string, unknown>; return HttpResponse.json(request(), { status: 201 }); }),
      http.get(`${API}/security/walkins/w1`, () => HttpResponse.json(request({ status: reason ? "overridden" : "pending" }))),
      http.post(`${API}/security/walkins/w1/override`, async ({ request: r }) => {
        reason = ((await r.json()) as { reason: string }).reason;
        return HttpResponse.json(visit({ entry_method: "override", override_reason: reason }), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<WalkinPage />, { auth: officer(["visitors.verify", "visitors.override"]) });

    await user.type(screen.getByLabelText("Visitor's name"), "Musa");
    await user.click(await screen.findByRole("button", { name: "B4" }));
    expect(screen.getByRole("button", { name: "B4" })).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: "Ask the household" }));

    expect(await screen.findByText(/Waiting for the household/)).toBeInTheDocument();
    expect(registered).toMatchObject({ house_id: "h2", visitor_name: "Musa", headcount: 1 });

    await user.click(screen.getByRole("button", { name: /Emergency override/ }));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByRole("textbox"), "Resident unreachable, medical delivery");
    await user.click(within(dialog).getByRole("button", { name: "Override and let in" }));
    await vi.waitFor(() => expect(reason).toBe("Resident unreachable, medical delivery"));
  });

  it("hides the override button from officers without that permission", async () => {
    server.use(houses,
      http.post(`${API}/security/walkins`, () => HttpResponse.json(request(), { status: 201 })),
      http.get(`${API}/security/walkins/w1`, () => HttpResponse.json(request())));
    const user = userEvent.setup();
    renderWithProviders(<WalkinPage />, { auth: officer() });
    await user.type(screen.getByLabelText("Visitor's name"), "Musa");
    await user.click(await screen.findByRole("button", { name: "A1" }));
    await user.click(screen.getByRole("button", { name: "Ask the household" }));
    expect(await screen.findByText(/Waiting for the household/)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Emergency override/ })).not.toBeInTheDocument();
  });
});

describe("Admin: visitor rules and gate officers", () => {
  it("saves an estate's visitor rule", async () => {
    let patch: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/estates/e1/visitor-settings`, () => HttpResponse.json({ id: "e1", name: "Citadel Gardens", invite_requires_approval: false, walkin_requires_approval: true })),
      http.patch(`${API}/admin/estates/e1/visitor-settings`, async ({ request: r }) => {
        patch = (await r.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "e1", name: "Citadel Gardens", invite_requires_approval: true, walkin_requires_approval: true });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<VisitorSettingsCard estateId="e1" />, { auth: admin() });
    const toggle = await screen.findByRole("switch", { name: /confirm when an invited guest arrives/i });
    expect(toggle).not.toBeChecked();
    await user.click(toggle);
    await vi.waitFor(() => expect(patch).toEqual({ invite_requires_approval: true }));
  });

  it("assigns a team member to one estate's gate", async () => {
    let put: { url: string; body: unknown } | null = null;
    server.use(
      http.get(`${API}/admin/security-assignments`, () => HttpResponse.json([])),
      http.get(`${API}/admin/staff`, () => HttpResponse.json(page([account({ id: "u9", full_name: "Sani Gate", roles: ["Security officer"] })]))),
      http.get(`${API}/admin/estates`, () => HttpResponse.json(page([estate()]))),
      http.put(`${API}/admin/security-assignments/:id`, async ({ request: r, params }) => {
        put = { url: String(params.id), body: await r.json() };
        return HttpResponse.json({ user_id: params.id, estate_id: estate().id });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<GateOfficers />, { auth: admin() });
    expect(await screen.findByText("No gate officers yet")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Team member"), await screen.findByRole("option", { name: /Sani Gate/ }));
    await user.selectOptions(screen.getByLabelText("Estate"), await screen.findByRole("option", { name: estate().name }));
    await user.click(screen.getByRole("button", { name: "Assign" }));
    await vi.waitFor(() => expect(put).toEqual({ url: "u9", body: { estate_id: estate().id } }));
  });
});
