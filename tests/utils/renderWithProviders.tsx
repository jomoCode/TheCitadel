import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/Tooltip";

/** Renders with the same providers as the site: fresh no-retry query client and tooltips. */
export function renderWithProviders(ui: React.ReactElement, options: RenderOptions = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <TooltipProvider>{ui}</TooltipProvider>
    </QueryClientProvider>,
    options,
  );
}

export function setViewport(kind: "desktop" | "mobile") {
  (globalThis as { __desktop?: boolean }).__desktop = kind === "desktop";
}
