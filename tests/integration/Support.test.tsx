import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import AdminTicketPage from "@/app/(admin)/admin/support/[id]/page";
import { NewTicketSheet } from "@/features/support/components/NewTicketSheet";
import { NoticeSheet } from "@/features/support/components/NoticeSheet";
import { NotificationBell } from "@/features/support/components/NotificationBell";
import type { TicketDetail } from "@/features/support/types";
import { API, server } from "../mocks/server";
import { estate, page } from "../mocks/estateData";
import { navigation } from "../setup";
import { ADMIN_PERMS, FakeAuthService, makeToken, RESIDENT_PERMS } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const resident = () => new FakeAuthService(makeToken({ sub: "r1", app_permissions: RESIDENT_PERMS }));
const staff = () => new FakeAuthService(makeToken({ sub: "s1", app_permissions: [...ADMIN_PERMS, "tickets.view", "tickets.manage", "notices.manage"] }));
const PNG = new File([new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])], "sink.png", { type: "image/png" });

const ticket = (over: Partial<TicketDetail> = {}): TicketDetail => ({
  id: "t1", reference: "TKT-20261108-ABCDEF", subject: "Leaking sink", description: "Water under the sink.", status: "open", priority: "normal",
  category_id: "c1", category_name: "Plumbing", house_id: "h1", house_identifier: "A1", estate_id: "e1", estate_name: "Citadel Gardens",
  resident_id: "r1", resident_name: "Ada Obi", last_activity_at: "2026-11-08T10:00:00Z", resolved_at: null, created_at: "2026-11-08T09:00:00Z",
  attachments: [],
  events: [
    { id: "e1", kind: "created", body: "Water under the sink.", from_status: null, to_status: "open", is_internal: false, actor_name: "Ada Obi", actor_is_staff: false, created_at: "2026-11-08T09:00:00Z" },
    { id: "e2", kind: "internal_note", body: "Call Musa the plumber", from_status: null, to_status: null, is_internal: true, actor_name: "Ngozi", actor_is_staff: true, created_at: "2026-11-08T09:30:00Z" },
  ],
  ...over,
});

describe("Resident: report a problem", () => {
  it("sends the request, uploads the photo, then opens the conversation", async () => {
    let created: Record<string, unknown> = {};
    const uploads: string[] = [];
    server.use(
      http.get(`${API}/resident/maintenance-categories`, () => HttpResponse.json([{ id: "c1", name: "Plumbing", description: null, status: "active" }])),
      http.post(`${API}/resident/tickets`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(ticket(), { status: 201 });
      }),
      http.post(`${API}/resident/tickets/t1/attachments`, async ({ request }) => {
        uploads.push(((await request.formData()).get("file") as File).type || "file");
        return HttpResponse.json({ id: "a1", filename: "sink.png", content_type: "image/png", size_bytes: 8, is_internal: false, url: null, created_at: "2026-11-08T09:00:00Z" }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<NewTicketSheet open onOpenChange={() => {}} homes={[{ house_id: "h1", house_identifier: "A1", estate_name: "Citadel Gardens" }]} />, { auth: resident() });
    const sheet = await screen.findByRole("dialog");
    expect(within(sheet).getByRole("button", { name: /send request/i })).toBeDisabled();

    await user.click(await within(sheet).findByRole("button", { name: "Plumbing" }));
    await user.type(within(sheet).getByLabelText("Short title"), "Leaking sink");
    await user.type(within(sheet).getByLabelText("What's happening?"), "Water is pooling under the kitchen sink.");
    await user.upload(within(sheet).getByLabelText("Add a photo (optional)"), PNG);
    await user.click(within(sheet).getByRole("button", { name: /send request/i }));

    await vi.waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith("/resident/support/t1"));
    expect(created).toEqual({ category_id: "c1", subject: "Leaking sink", description: "Water is pooling under the kitchen sink.", house_id: "h1" });
    expect(uploads).toHaveLength(1); // jsdom drops multipart filenames; real browsers send them
  });
});

describe("Staff: handle a request", () => {
  it("shows internal notes clearly and sends an internal note with a status change", async () => {
    let body: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/tickets/t1`, () => HttpResponse.json(ticket())),
      http.post(`${API}/admin/tickets/t1/messages`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json(ticket({ status: "in_progress" }));
      }),
    );
    const user = userEvent.setup();
    const params = Promise.resolve({ id: "t1" });
    await act(async () => {
      renderWithProviders(<Suspense><AdminTicketPage params={params} /></Suspense>, { auth: staff() });
    });
    expect(await screen.findByText(/residents can't see this/i)).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: /internal note/i }));
    await user.type(screen.getByPlaceholderText(/only staff will see this/i), "Parts ordered");
    await user.selectOptions(screen.getByLabelText("Also change status to"), "in_progress");
    await user.click(screen.getByRole("button", { name: /save note/i }));
    expect(await screen.findByText("Internal note saved")).toBeInTheDocument();
    expect(body).toEqual({ body: "Parts ordered", internal: true, status: "in_progress" });
  });
});

describe("Notices", () => {
  it("requires a target estate for estate notices and publishes with the right payload", async () => {
    let body: Record<string, unknown> = {};
    server.use(
      http.get(`${API}/admin/estates`, () => HttpResponse.json(page([estate()]))),
      http.post(`${API}/admin/notices`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ ...body, id: "n1", status: "published", estate_name: "Citadel Gardens", house_identifier: null, created_at: "2026-11-08T00:00:00Z", attachments: [] }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<NoticeSheet open onOpenChange={() => {}} />, { auth: staff() });
    const sheet = await screen.findByRole("dialog");
    await user.type(within(sheet).getByLabelText("Title"), "Water shutdown");
    await user.type(within(sheet).getByLabelText("Message"), "No water on Tuesday 9am–1pm.");
    await user.click(within(sheet).getByRole("button", { name: "One estate" }));
    expect(within(sheet).getByRole("button", { name: /publish now/i })).toBeDisabled();
    await user.selectOptions(within(sheet).getByRole("combobox", { name: "Estate" }), "e1");
    await user.click(within(sheet).getByRole("button", { name: "Urgent" }));
    await user.click(within(sheet).getByRole("button", { name: /publish now/i }));
    expect(await screen.findByText(/“Water shutdown” published/)).toBeInTheDocument();
    expect(body).toMatchObject({ scope: "estate", estate_id: "e1", house_id: null, severity: "urgent", publish_now: true });
  });
});

describe("Notification bell", () => {
  it("shows the unread count, lists notifications and marks them read", async () => {
    let unread = 2;
    server.use(
      http.get(`${API}/notifications/unread-count`, () => HttpResponse.json({ unread })),
      http.get(`${API}/notifications`, () => HttpResponse.json(page([
        { id: "n1", kind: "bill.issued", title: "New bill", body: "₦50,000.00 due on 15 Nov.", link: "/resident/bills", read_at: null, created_at: new Date().toISOString() },
        { id: "n2", kind: "notice.published", title: "Water shutdown", body: null, link: "/resident/notices", read_at: null, created_at: new Date().toISOString() },
      ]))),
      http.post(`${API}/notifications/read`, () => { unread = 0; return HttpResponse.json({ unread: 0 }); }),
    );
    const user = userEvent.setup();
    renderWithProviders(<NotificationBell />, { auth: resident() });
    await user.click(await screen.findByRole("button", { name: "Notifications, 2 unread" }));
    expect(await screen.findByText("New bill")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /mark all read/i }));
    await vi.waitFor(() => expect(screen.queryByRole("button", { name: /mark all read/i })).not.toBeInTheDocument());
    await user.keyboard("{Escape}");
    expect(await screen.findByRole("button", { name: "Notifications" })).toBeInTheDocument();
  });
});
