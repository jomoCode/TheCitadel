import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { PropertyCard } from "@/components/marketing/properties/PropertyCard";
import { citadel, citadelListing, isCitadelProperty } from "@/content/marketing/citadel";
import { properties } from "@/content/marketing/properties";
import { renderWithProviders } from "../utils/renderWithProviders";

describe("Citadel brochure download", () => {
  it("matches any listing called Citadel / The Citadel", () => {
    expect(isCitadelProperty({ name: "Citadel", slug: "x" })).toBe(true);
    expect(isCitadelProperty({ name: "The Citadel, Asokoro", slug: "x" })).toBe(true);
    expect(isCitadelProperty({ name: "Renamed", slug: citadelListing.slug })).toBe(true);
    expect(isCitadelProperty({ name: "Cedar Gardens", slug: "cedar-gardens-jabi" })).toBe(false);
  });

  it("shows a download link under The Citadel's card", () => {
    renderWithProviders(<PropertyCard property={citadelListing} />);
    const link = screen.getByRole("link", { name: /download the brochure/i });
    expect(link).toHaveAttribute("href", citadel.brochure.href);
    expect(link).toHaveAttribute("download", citadel.brochure.fileName);
  });

  it("does not show it under other listings", () => {
    renderWithProviders(<PropertyCard property={properties[0]} />);
    expect(screen.queryByRole("link", { name: /download the brochure/i })).not.toBeInTheDocument();
  });
});
