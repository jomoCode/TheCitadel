import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { http, HttpResponse } from "msw";
import { describe, expect, it } from "vitest";
import { EnquiryForm } from "@/components/marketing/forms/EnquiryForm";
import { API, server } from "../mocks/server";
import { renderWithProviders } from "../utils/renderWithProviders";

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText(/full name/i), "Ada Obi");
  await user.type(screen.getByLabelText(/^email/i), "ada@example.com");
  await user.type(screen.getByLabelText(/^phone/i), "+234 803 555 0101");
  await user.type(screen.getByLabelText(/^message/i), "Please call me about a viewing.");
  await user.click(screen.getByRole("checkbox"));
}

describe("EnquiryForm (form → hook → service → API)", () => {
  it("shows validation messages and does not submit when fields are invalid", async () => {
    const user = userEvent.setup();
    let called = false;
    server.use(http.post(`${API}/public/enquiries`, () => { called = true; return HttpResponse.json({}); }));
    renderWithProviders(<EnquiryForm />);

    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByText(/please tell us your name/i)).toBeInTheDocument();
    expect(screen.getByText(/please agree/i)).toBeInTheDocument();
    expect(called).toBe(false);
  });

  it("submits with source page, attribution and property, then shows the reference", async () => {
    const user = userEvent.setup();
    let body: Record<string, unknown> = {};
    server.use(
      http.post(`${API}/public/enquiries`, async ({ request }) => {
        body = (await request.json()) as Record<string, unknown>;
        return HttpResponse.json({ id: "enq_9", reference: "ENQ-2026-0099" }, { status: 201 });
      }),
    );
    renderWithProviders(<EnquiryForm defaultType="viewing" propertySlug="the-citadel-asokoro" propertyName="Citadel Gardens" />);

    await user.clear(screen.getByLabelText(/^message/i));
    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByText(/ENQ-2026-0099/)).toBeInTheDocument();
    expect(body).toMatchObject({
      name: "Ada Obi",
      enquiryType: "viewing",
      propertySlug: "the-citadel-asokoro",
      consent_given: true,
      source_page: "/contact",
    });
    expect(body).not.toHaveProperty("consent");
  });

  it("shows a friendly error with a phone fallback when the API fails", async () => {
    const user = userEvent.setup();
    server.use(http.post(`${API}/public/enquiries`, () => HttpResponse.json({ error: { message: "boom" } }, { status: 500 })));
    renderWithProviders(<EnquiryForm />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: /send enquiry/i }));

    expect(await screen.findByText(/could not send your message/i)).toBeInTheDocument();
  });
});
