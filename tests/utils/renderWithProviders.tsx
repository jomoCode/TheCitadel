import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { TooltipProvider } from "@/components/ui/Tooltip";
import type { AuthService } from "@/features/auth/services/AuthService";
import { AuthProvider } from "@/providers/AuthProvider";
import { ToastProvider } from "@/providers/ToastProvider";
import { FakeAuthService } from "./fakeAuth";

type Options = RenderOptions & { auth?: AuthService };

/** Renders with the same providers as the app: fresh no-retry query client, fake auth, toasts, tooltips. */
export function renderWithProviders(ui: React.ReactElement, { auth = new FakeAuthService(), ...options }: Options = {}) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
  return render(
    <QueryClientProvider client={client}>
      <AuthProvider service={auth}>
        <TooltipProvider>
          <ToastProvider>{ui}</ToastProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>,
    options,
  );
}

export function setViewport(kind: "desktop" | "mobile") {
  (globalThis as { __desktop?: boolean }).__desktop = kind === "desktop";
}
