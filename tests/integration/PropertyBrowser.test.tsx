import { screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { PropertyBrowser } from "@/components/marketing/properties/PropertyBrowser";
import { properties } from "@/content/marketing/properties";
import { renderWithProviders, setViewport } from "../utils/renderWithProviders";

const cardTitles = () => screen.getAllByRole("article").map((a) => within(a).getByRole("heading").textContent);

describe("PropertyBrowser (context + filters + grid)", () => {
  afterEach(() => setViewport("mobile"));

  it("desktop: inline filter chips narrow the results", async () => {
    setViewport("desktop");
    const user = userEvent.setup();
    renderWithProviders(<PropertyBrowser properties={properties} />);

    expect(screen.getAllByRole("article")).toHaveLength(properties.length);
    await user.click(screen.getByRole("button", { name: "Off-plan" }));

    const offPlan = properties.filter((p) => p.status === "offPlan").map((p) => p.name);
    expect(offPlan.length).toBeGreaterThan(1);
    expect(cardTitles()).toEqual(offPlan);
    expect(screen.getByText(`${offPlan.length} developments`)).toBeInTheDocument();
  });

  it("mobile: filters live in a bottom sheet with a live result count", async () => {
    setViewport("mobile");
    const user = userEvent.setup();
    renderWithProviders(<PropertyBrowser properties={properties} />);

    expect(screen.queryByRole("button", { name: "Off-plan" })).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /filters/i }));
    const sheet = await screen.findByRole("dialog");
    await user.click(within(sheet).getByRole("button", { name: "Sold out" }));

    expect(within(sheet).getByRole("button", { name: /show 1 home$/i })).toBeInTheDocument();
  });

  it("shows an empty state and resets filters", async () => {
    setViewport("desktop");
    const user = userEvent.setup();
    renderWithProviders(<PropertyBrowser properties={properties} />);

    await user.type(screen.getByRole("searchbox"), "zzzz");
    expect(screen.getByText(/no homes match/i)).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /clear filters/i }));
    expect(screen.getAllByRole("article")).toHaveLength(properties.length);
  });
});
