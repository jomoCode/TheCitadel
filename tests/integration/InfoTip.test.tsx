import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { renderWithProviders } from "../utils/renderWithProviders";

describe("InfoTip", () => {
  it("opens on tap (touch users) and shows the plain-language registry text", async () => {
    const user = userEvent.setup();
    renderWithProviders(<InfoTip tip="marketing.paymentPlan" label="About payment plans" />);

    await user.click(screen.getByRole("button", { name: /about payment plans/i }));

    expect(await screen.findByText(getTooltip("marketing.paymentPlan"))).toBeInTheDocument();
  });

  it("renders nothing when there is no content", () => {
    renderWithProviders(<InfoTip />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
