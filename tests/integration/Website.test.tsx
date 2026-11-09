import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import EnquiryPage from "@/app/(admin)/admin/enquiries/[id]/page";
import ListingPage from "@/app/(admin)/admin/properties/[id]/page";
import { NewListingSheet } from "@/features/website/components/NewListingSheet";
import type { EnquiryDetail, Listing } from "@/features/website/types";
import { API, server } from "../mocks/server";
import { navigation } from "../setup";
import { FakeAuthService, makeToken } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const editor = () => new FakeAuthService(makeToken({ sub: "w1", app_permissions: ["cms.manage"] }));
const sales = (perms = ["leads.view", "leads.manage"]) => new FakeAuthService(makeToken({ sub: "s1", app_permissions: perms }));

const listing = (over: Partial<Listing> = {}): Listing => ({
  id: "p1", slug: "palm-crest", name: "Palm Crest", property_type: "Detached Duplexes", neighbourhood: "Ajah", city: "Lagos", address: "Ajah, Lagos",
  price_from_kobo: 25_000_000_000, bedrooms_min: 4, bedrooms_max: 5, status: "selling", summary: "", description: [], features: [], featured: false,
  is_published: false, seo_title: null, seo_description: null, photos: [], enquiry_count: 0, updated_at: "2026-11-08T10:00:00Z", ...over,
});
const photo = (id: string, position: number) => ({ id, url: `https://x.supabase.co/${id}.jpg`, alt: "Palm Crest", position });

const enquiry = (over: Partial<EnquiryDetail> = {}): EnquiryDetail => ({
  id: "e1", reference: "ENQ-20261108-ABCD", enquiry_type: "viewing", name: "Bola Ade", email: "bola@example.com", phone: "0803 123 4567",
  property_id: "p1", property_name: "Palm Crest", property_slug: "palm-crest", message: "Can I view the 5-bed on Saturday?", source_page: "/properties/palm-crest",
  source: "Google ad · ajah", attribution: {}, handled: false, handled_at: null, handled_by_name: null, created_at: "2026-11-08T09:00:00Z",
  notes: [], other_enquiries: [], ...over,
});

async function openPage(ui: React.ReactElement, auth: FakeAuthService) {
  await act(async () => { renderWithProviders(<Suspense>{ui}</Suspense>, { auth }); });
}

describe("Listings", () => {
  it("creates a hidden listing from the essentials and opens it", async () => {
    let body: Record<string, unknown> = {};
    server.use(http.post(`${API}/admin/properties`, async ({ request }) => {
      body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json(listing(), { status: 201 });
    }));
    const user = userEvent.setup();
    renderWithProviders(<NewListingSheet open onOpenChange={() => {}} />, { auth: editor() });
    const sheet = await screen.findByRole("dialog");
    await user.type(within(sheet).getByLabelText("Name"), "Palm Crest");
    await user.click(within(sheet).getByRole("button", { name: "Create listing" }));
    expect(await within(sheet).findByRole("alert")).toHaveTextContent(/home type and full location/);

    await user.type(within(sheet).getByLabelText("Home type", { selector: "input" }), "Detached Duplexes");
    await user.type(within(sheet).getByLabelText("Neighbourhood"), "Ajah");
    await user.type(within(sheet).getByLabelText("City"), "Abuja");
    await user.type(within(sheet).getByLabelText("Address"), "Katampe, Abuja");
    await user.type(within(sheet).getByLabelText("Price from", { selector: "input" }), "250,000,000");
    await user.click(within(sheet).getByRole("button", { name: "Create listing" }));

    await vi.waitFor(() => expect(navigation.router.push).toHaveBeenCalledWith("/admin/properties/p1"));
    expect(body).toMatchObject({ name: "Palm Crest", price_from_kobo: 25_000_000_000, city: "Abuja" });
    expect(body).not.toHaveProperty("is_published");
  });

  it("won't go live without photos, then uploads, reorders and publishes", async () => {
    let current = listing({ summary: "Villas with gardens." });
    let order: string[] = [];
    let published: unknown = null;
    server.use(
      http.get(`${API}/admin/properties/p1`, () => HttpResponse.json(current)),
      http.post(`${API}/admin/properties/p1/photos`, () => {
        current = { ...current, photos: [...current.photos, photo(`ph${current.photos.length + 1}`, current.photos.length)] };
        return HttpResponse.json(current, { status: 201 });
      }),
      http.put(`${API}/admin/properties/p1/photos/order`, async ({ request }) => {
        order = ((await request.json()) as { photo_ids: string[] }).photo_ids;
        current = { ...current, photos: order.map((id, i) => photo(id, i)) };
        return HttpResponse.json(current);
      }),
      http.patch(`${API}/admin/properties/p1`, async ({ request }) => {
        const patch = (await request.json()) as Partial<Listing>;
        published = patch.is_published;
        current = { ...current, ...patch };
        return HttpResponse.json(current);
      }),
    );
    const user = userEvent.setup({ applyAccept: false }); // let the PDF through so we test our own check
    await openPage(<ListingPage params={Promise.resolve({ id: "p1" })} />, editor());

    const live = await screen.findByRole("switch", { name: "Live on the website" });
    expect(live).toBeDisabled();
    expect(screen.getByText(/add at least one photo/i)).toBeInTheDocument();

    const jpg = (name: string) => new File([new Uint8Array([0xff, 0xd8, 0xff])], name, { type: "image/jpeg" });
    await user.upload(screen.getByLabelText("Upload photos"), [jpg("a.jpg"), jpg("b.jpg"), new File(["x"], "plan.pdf", { type: "application/pdf" })]);
    expect(await screen.findByText(/Skipped plan.pdf/)).toBeInTheDocument();
    expect(await screen.findAllByRole("button", { name: /^Remove photo/ })).toHaveLength(2);
    expect(screen.getByText("Cover")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Move photo 2 earlier" }));
    await vi.waitFor(() => expect(order).toEqual(["ph2", "ph1"]));

    await vi.waitFor(() => expect(screen.getByRole("switch", { name: "Live on the website" })).toBeEnabled());
    await user.click(screen.getByRole("switch", { name: "Live on the website" }));
    await vi.waitFor(() => expect(published).toBe(true));
    expect(await screen.findByRole("link", { name: /view on website/i })).toHaveAttribute("href", "/properties/palm-crest");
  });
});

describe("Enquiries", () => {
  it("shows contact shortcuts, saves a note and ticks the enquiry off", async () => {
    let current = enquiry();
    server.use(
      http.get(`${API}/admin/enquiries/e1`, () => HttpResponse.json(current)),
      http.post(`${API}/admin/enquiries/e1/notes`, async ({ request }) => {
        const { body } = (await request.json()) as { body: string };
        current = { ...current, notes: [{ id: "n1", body, author_name: "Ngozi", created_at: "2026-11-08T10:00:00Z" }] };
        return HttpResponse.json(current);
      }),
      http.post(`${API}/admin/enquiries/e1/handled`, async ({ request }) => {
        const { handled } = (await request.json()) as { handled: boolean };
        current = { ...current, handled, handled_at: handled ? "2026-11-08T11:00:00Z" : null, handled_by_name: handled ? "Ngozi" : null };
        return HttpResponse.json(current);
      }),
    );
    const user = userEvent.setup();
    await openPage(<EnquiryPage params={Promise.resolve({ id: "e1" })} />, sales());

    expect(await screen.findByRole("heading", { name: "Bola Ade" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /whatsapp/i })).toHaveAttribute("href", "https://wa.me/2348031234567");
    expect(screen.getByRole("link", { name: /0803 123 4567/ })).toHaveAttribute("href", "tel:0803 123 4567");
    expect(screen.getByText("Google ad · ajah")).toBeInTheDocument();

    await user.type(screen.getByLabelText("New note"), "Viewing booked for Saturday");
    await user.click(screen.getByRole("button", { name: "Add note" }));
    expect(await screen.findByText("Viewing booked for Saturday")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /mark as handled/i }));
    expect(await screen.findByText(/Handled by Ngozi/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /move back/i })).toBeInTheDocument();
  });

  it("view-only staff can read but not tick off or add notes", async () => {
    server.use(http.get(`${API}/admin/enquiries/e1`, () => HttpResponse.json(enquiry())));
    await openPage(<EnquiryPage params={Promise.resolve({ id: "e1" })} />, sales(["leads.view"]));
    expect(await screen.findByRole("heading", { name: "Bola Ade" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /mark as handled/i })).not.toBeInTheDocument();
    expect(screen.queryByLabelText("New note")).not.toBeInTheDocument();
  });
});
