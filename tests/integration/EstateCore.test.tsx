import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { afterEach, describe, expect, it } from "vitest";
import EstatesPage from "@/app/(admin)/admin/estates/page";
import { HouseList } from "@/features/estate-core/components/HouseList";
import { ResidentHomesPanel } from "@/features/estate-core/components/ResidentHomesPanel";
import { RoleEditorSheet } from "@/features/estate-core/components/RoleEditorSheet";
import { API, server } from "../mocks/server";
import { estate, house, page, resident, role } from "../mocks/estateData";
import { navigation } from "../setup";
import { ADMIN_PERMS, FakeAuthService, makeToken } from "../utils/fakeAuth";
import { renderWithProviders, setViewport } from "../utils/renderWithProviders";

const admin = () => new FakeAuthService(makeToken({ app_permissions: ADMIN_PERMS }));
afterEach(() => setViewport("mobile"));

describe("Estates screen", () => {
  it("lists estates as cards on phones and creates a new estate from the sheet", async () => {
    navigation.pathname = "/admin/estates";
    navigation.search = "new=1";
    let created: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/estates`, () => HttpResponse.json(page([estate()]))),
      http.post(`${API}/admin/estates`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(estate({ id: "e2", name: "Palm Crest" }), { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<EstatesPage />, { auth: admin() });

    expect(await screen.findByText("Citadel Gardens")).toBeInTheDocument();
    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("button", { name: /create estate/i }));
    expect(await within(sheet).findByText(/give the estate a name/i)).toBeInTheDocument();

    await user.type(within(sheet).getByLabelText(/estate name/i, { selector: "input" }), "Palm Crest");
    await user.click(within(sheet).getByRole("button", { name: /create estate/i }));
    expect(await screen.findByText("Palm Crest created")).toBeInTheDocument();
    expect(created).toMatchObject({ name: "Palm Crest", location: null });
    expect(navigation.router.replace).toHaveBeenCalledWith("/admin/estates", { scroll: false });
  });

  it("hides the create button from people who can only view", async () => {
    server.use(http.get(`${API}/admin/estates`, () => HttpResponse.json(page([estate()]))));
    renderWithProviders(<EstatesPage />, { auth: new FakeAuthService(makeToken({ app_permissions: ["estates.view"] })) });
    expect(await screen.findByText("Citadel Gardens")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /new estate/i })).not.toBeInTheDocument();
  });
});

describe("HouseList", () => {
  it("shows a table on desktop with plain-language status and passes filters to the API", async () => {
    setViewport("desktop");
    let lastUrl = "";
    server.use(http.get(`${API}/admin/houses`, ({ request }) => {
      lastUrl = request.url;
      return HttpResponse.json(page([house()]));
    }));
    const changes: Record<string, unknown>[] = [];
    const user = userEvent.setup();
    renderWithProviders(<HouseList q="" page={1} status="occupied" onChange={(c) => changes.push(c)} />, { auth: admin() });

    expect(await screen.findByRole("table")).toBeInTheDocument();
    expect(new URL(lastUrl).searchParams.get("status")).toBe("occupied");
    await user.click(screen.getByRole("button", { name: "Available" }));
    expect(changes).toContainEqual({ status: "available" });
  });
});

describe("ResidentHomesPanel", () => {
  it("requires a reason to end a stay and sends it to the server", async () => {
    let body: Record<string, unknown> = {};
    server.use(http.post(`${API}/admin/occupancies/o1/end`, async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ ...resident().occupancies[0], status: "ended", end_date: "2026-11-08" });
    }));
    const user = userEvent.setup();
    renderWithProviders(<ResidentHomesPanel account={resident()} canManage />, { auth: admin() });

    await user.click(screen.getByRole("button", { name: /end stay/i }));
    const dialog = await screen.findByRole("dialog");
    const confirm = within(dialog).getByRole("button", { name: /^end stay$/i });
    expect(confirm).toBeDisabled();
    await user.type(within(dialog).getByRole("textbox"), "Relocated abroad");
    await user.click(confirm);
    expect(await screen.findByText("Stay ended")).toBeInTheDocument();
    expect(body).toEqual({ reason: "Relocated abroad" });
  });

  it("hides management buttons for view-only staff", () => {
    renderWithProviders(<ResidentHomesPanel account={resident()} canManage={false} />, { auth: admin() });
    expect(screen.queryByRole("button", { name: /end stay|move|assign/i })).not.toBeInTheDocument();
  });
});

describe("RoleEditorSheet", () => {
  it("groups permissions with plain descriptions and saves the selection", async () => {
    let body: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/permissions`, () => HttpResponse.json([
        { code: "bills.view", description: "See bills for all houses.", group: "Billing & payments" },
        { code: "payments.refund", description: "Refund or reverse a payment.", group: "Billing & payments" },
        { code: "audit.view", description: "See the history of important actions.", group: "System" },
      ])),
      http.patch(`${API}/admin/roles/role1`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(role({ permissions: ["bills.view", "audit.view"] }));
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<RoleEditorSheet open onOpenChange={() => {}} role={role()} />, { auth: admin() });

    expect(await screen.findByText("Billing & payments")).toBeInTheDocument();
    expect(screen.getByLabelText("See bills for all houses.")).toBeChecked();
    await user.click(screen.getByLabelText("See the history of important actions."));
    await user.click(screen.getByRole("button", { name: /save role/i }));
    expect(await screen.findByText('Role "Accountant" saved')).toBeInTheDocument();
    expect(body.permissions).toEqual(expect.arrayContaining(["bills.view", "audit.view"]));
  });

  it("locks the Administrator role's permissions", async () => {
    server.use(http.get(`${API}/admin/permissions`, () => HttpResponse.json([{ code: "bills.view", description: "See bills for all houses.", group: "Billing" }])));
    renderWithProviders(<RoleEditorSheet open onOpenChange={() => {}} role={role({ key: "administrator", name: "Administrator", is_system: true })} />, { auth: admin() });
    expect(await screen.findByLabelText("See bills for all houses.")).toBeDisabled();
  });
});
