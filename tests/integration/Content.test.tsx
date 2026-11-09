import { act, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { Suspense } from "react";
import { describe, expect, it, vi } from "vitest";
import InsightsPage from "@/app/(admin)/admin/insights/page";
import { ContactSettingsForm } from "@/features/content/components/ContactSettingsForm";
import { PostEditor } from "@/features/content/components/PostEditor";
import { TestimonialManager } from "@/features/content/components/TestimonialManager";
import type { Insights, Post } from "@/features/content/types";
import { API, server } from "../mocks/server";
import { FakeAuthService, makeToken } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const editor = () => new FakeAuthService(makeToken({ sub: "w1", app_permissions: ["cms.manage", "analytics.view"] }));

const post = (over: Partial<Post> = {}): Post => ({
  id: "p1", slug: "why-asokoro", title: "Why Asokoro", excerpt: "", body: [], featured_image_url: null, featured_image_alt: null, author_name: "The Citadel team",
  author_role: null, category: null, tags: [], status: "draft", published_at: null, reading_minutes: 1, seo_title: null, seo_description: null,
  updated_at: "2026-11-08T10:00:00Z", is_live: false, ...over,
});

describe("Journal editor", () => {
  it("builds an article from blocks, saves it, then publishes", { timeout: 20_000 }, async () => {
    let saved: Record<string, unknown> = {};
    let published: unknown = "not called";
    server.use(
      http.get(`${API}/admin/posts/categories`, () => HttpResponse.json([{ id: "c1", slug: "buying-guides", name: "Buying Guides" }])),
      http.patch(`${API}/admin/posts/p1`, async ({ request }) => { saved = (await request.json()) as Record<string, unknown>; return HttpResponse.json(post()); }),
      http.post(`${API}/admin/posts/p1/publish`, async ({ request }) => {
        published = ((await request.json()) as { publish_at: unknown }).publish_at;
        return HttpResponse.json(post({ status: "published", is_live: true, published_at: "2026-11-08T11:00:00Z" }));
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<PostEditor post={post({ featured_image_url: "https://x.supabase.co/c.jpg" })} />, { auth: editor() });

    await user.type(screen.getByLabelText("Summary", { selector: "textarea" }), "The case for Abuja’s calmest address.");
    const add = screen.getByRole("group", { name: "Add a block" });
    await user.click(within(add).getByRole("button", { name: /heading/i }));
    await user.click(within(add).getByRole("button", { name: /paragraph/i }));
    await user.type(screen.getByLabelText("Heading text"), "Security first");
    await user.type(screen.getByLabelText("Paragraph text"), "Embassies line the streets.");
    await user.click(screen.getByRole("button", { name: "Move block 2 up" }));
    await user.click(within(add).getByRole("button", { name: /list/i })); // left empty → dropped on save
    await user.selectOptions(await screen.findByLabelText("Category"), "c1");
    await user.type(screen.getByLabelText("Tags", { selector: "input" }), "Abuja, Living");

    await user.click(screen.getByRole("button", { name: "Publish now" }));
    await vi.waitFor(() => expect(published).toBeNull());
    expect(saved).toMatchObject({
      excerpt: "The case for Abuja’s calmest address.", category_id: "c1", tags: ["Abuja", "Living"],
      body: [{ kind: "paragraph", text: "Embassies line the streets." }, { kind: "heading", text: "Security first" }],
    });
    expect(screen.getByText("Google preview")).toBeInTheDocument();
  });
});

describe("Site content", () => {
  it("validates and saves contact details", async () => {
    let body: { contact?: Record<string, string> } = {};
    const contact = { phone: "+234 (0) 201 555 0188", mobile: "+234 (0) 908 555 0144", email: "enquiries@quoec.com", address: "15 Mary Slessor Street, Asokoro", hours: "", mapQuery: "" };
    server.use(
      http.get(`${API}/admin/site/settings`, () => HttpResponse.json({ contact, socials: [], updated_at: null })),
      http.put(`${API}/admin/site/settings`, async ({ request }) => { body = (await request.json()) as typeof body; return HttpResponse.json({ ...body, updated_at: "2026-11-08T12:00:00Z" }); }),
    );
    const user = userEvent.setup();
    renderWithProviders(<ContactSettingsForm />, { auth: editor() });
    const phone = await screen.findByLabelText("Main phone");
    await user.clear(phone);
    await user.type(phone, "ring us");
    await user.click(screen.getByRole("button", { name: /save contact details/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/digits/);

    await user.clear(phone);
    await user.type(phone, "+234 803 123 4567");
    await user.click(screen.getByRole("button", { name: /save contact details/i }));
    await vi.waitFor(() => expect(body.contact?.phone).toBe("+234 803 123 4567"));
  });

  it("only adds a testimonial once the client's consent is ticked, and it starts hidden", async () => {
    let created: Record<string, unknown> | null = null;
    server.use(
      http.get(`${API}/admin/site/testimonials`, () => HttpResponse.json([])),
      http.post(`${API}/admin/site/testimonials`, async ({ request }) => {
        created = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "t1", name: "Amaka O.", location: null, purchase: null, quote: "x", rating: 5, image_url: null, is_published: false, sort_order: 0 }, { status: 201 });
      }),
    );
    const user = userEvent.setup();
    renderWithProviders(<TestimonialManager />, { auth: editor() });
    await user.click(await screen.findByRole("button", { name: /add testimonial/i }));
    const sheet = await screen.findByRole("dialog");
    await user.type(within(sheet).getByLabelText(/client's name/i), "Amaka O.");
    await user.type(within(sheet).getByLabelText("Their words"), "A calm and beautiful home for our family.");
    const add = within(sheet).getByRole("button", { name: "Add testimonial" });
    expect(add).toBeDisabled();
    await user.click(within(sheet).getByRole("checkbox", { name: /agreed to their name and words/i }));
    await user.click(add);
    await vi.waitFor(() => expect(created).toMatchObject({ name: "Amaka O.", consent_confirmed: true, rating: 5 }));
  });
});

describe("Insights", () => {
  it("shows the headline numbers, day-by-day charts with a table view, and enquiry sources", async () => {
    const data: Insights = {
      days: 30, page_views: 900, visitors: 300, property_views: 120, enquiries: 6, enquiry_rate: 2, previous_enquiries: 4,
      daily: [{ day: "2026-11-07", page_views: 40, visitors: 12, enquiries: 1 }, { day: "2026-11-08", page_views: 50, visitors: 20, enquiries: 0 }],
      top_pages: [{ label: "/", value: 500, href: "/" }], top_properties: [{ label: "the-citadel-asokoro", value: 120, href: "/properties/the-citadel-asokoro" }],
      enquiries_by_source: [{ label: "Google ad", value: 4, href: null }, { label: "Direct visit", value: 2, href: null }],
      enquiries_by_type: [{ label: "Viewing request", value: 6, href: null }], enquiries_by_property: [],
    };
    server.use(http.get(`${API}/admin/insights`, () => HttpResponse.json(data)));
    const user = userEvent.setup();
    await act(async () => { renderWithProviders(<Suspense><InsightsPage /></Suspense>, { auth: editor() }); });
    expect(await screen.findByText("300")).toBeInTheDocument();
    expect(screen.getByText("2%")).toBeInTheDocument();
    expect(screen.getByText(/4 the period before/)).toBeInTheDocument();
    expect(screen.getByText("Google ad")).toBeInTheDocument();
    expect(screen.getByText("No listing enquiries in this period.")).toBeInTheDocument();

    await user.hover(screen.getByRole("button", { name: "8 Nov: 20" }));
    expect(screen.getByText("8 Nov: 20")).toBeInTheDocument();
    expect(screen.getAllByText("Show as a table")).toHaveLength(2);
  });
});
