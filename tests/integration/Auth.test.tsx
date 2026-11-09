import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { RequireAccess } from "@/components/auth/RequireAccess";
import { LoginForm } from "@/features/auth/components/LoginForm";
import { SetPasswordForm } from "@/features/auth/components/SetPasswordForm";
import { canUseAdmin } from "@/features/auth/permissions";
import { navigation } from "../setup";
import { ADMIN_PERMS, FakeAuthService, makeToken, RESIDENT_PERMS } from "../utils/fakeAuth";
import { renderWithProviders } from "../utils/renderWithProviders";

const accounts = {
  "admin@example.com": { password: "correct-horse", token: makeToken({ app_permissions: ADMIN_PERMS }) },
  "ada@example.com": { password: "resident-pass", token: makeToken({ app_permissions: RESIDENT_PERMS }) },
};

describe("LoginForm", () => {
  it("shows a friendly message for a wrong password", async () => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />, { auth: new FakeAuthService(null, accounts) });
    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/^password/i), "nope");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    expect(await screen.findByRole("alert")).toHaveTextContent(/don't match/i);
    expect(navigation.router.replace).not.toHaveBeenCalled();
  });

  it.each([
    ["admin@example.com", "correct-horse", "/admin"],
    ["ada@example.com", "resident-pass", "/resident"],
  ])("sends %s to the right area", async (email, password, destination) => {
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />, { auth: new FakeAuthService(null, accounts) });
    await user.type(screen.getByLabelText(/email/i), email);
    await user.type(screen.getByLabelText(/^password/i), password);
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByRole("button", { name: /sign in/i });
    expect(navigation.router.replace).toHaveBeenCalledWith(destination);
  });

  it("returns to the page the person originally asked for", async () => {
    navigation.search = "next=%2Fadmin%2Fhouses";
    const user = userEvent.setup();
    renderWithProviders(<LoginForm />, { auth: new FakeAuthService(null, accounts) });
    await user.type(screen.getByLabelText(/email/i), "admin@example.com");
    await user.type(screen.getByLabelText(/^password/i), "correct-horse");
    await user.click(screen.getByRole("button", { name: /sign in/i }));
    await screen.findByRole("button", { name: /sign in/i });
    expect(navigation.router.replace).toHaveBeenCalledWith("/admin/houses");
  });
});

describe("RequireAccess", () => {
  it("redirects signed-out visitors to the login page", async () => {
    navigation.pathname = "/admin/estates";
    renderWithProviders(<RequireAccess allow={canUseAdmin}><p>secret</p></RequireAccess>);
    await vi.waitFor(() => expect(navigation.router.replace).toHaveBeenCalledWith("/login?next=%2Fadmin%2Festates"));
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("explains when a signed-in person lacks access", async () => {
    renderWithProviders(<RequireAccess allow={canUseAdmin}><p>secret</p></RequireAccess>, {
      auth: new FakeAuthService(makeToken({ app_permissions: RESIDENT_PERMS })),
    });
    expect(await screen.findByText(/don't have access/i)).toBeInTheDocument();
    expect(screen.queryByText("secret")).not.toBeInTheDocument();
  });

  it("shows the area to permitted users", async () => {
    renderWithProviders(<RequireAccess allow={canUseAdmin}><p>secret</p></RequireAccess>, {
      auth: new FakeAuthService(makeToken({ app_permissions: ADMIN_PERMS })),
    });
    expect(await screen.findByText("secret")).toBeInTheDocument();
  });
});

describe("SetPasswordForm", () => {
  it("validates length and matching, then saves", async () => {
    const user = userEvent.setup();
    const auth = new FakeAuthService(makeToken({ app_permissions: RESIDENT_PERMS }));
    let done = false;
    renderWithProviders(<SetPasswordForm onDone={() => { done = true; }} />, { auth });
    await screen.findByLabelText(/new password/i, { selector: "input" });
    await user.type(screen.getByLabelText(/new password/i, { selector: "input" }), "short");
    await user.type(screen.getByLabelText(/confirm/i), "different");
    await user.click(screen.getByRole("button", { name: /save password/i }));
    expect(await screen.findByText(/at least 10 characters/i)).toBeInTheDocument();
    expect(screen.getByText(/don't match/i)).toBeInTheDocument();

    await user.clear(screen.getByLabelText(/new password/i, { selector: "input" }));
    await user.clear(screen.getByLabelText(/confirm/i));
    await user.type(screen.getByLabelText(/new password/i, { selector: "input" }), "a long pass phrase");
    await user.type(screen.getByLabelText(/confirm/i), "a long pass phrase");
    await user.click(screen.getByRole("button", { name: /save password/i }));
    await vi.waitFor(() => expect(done).toBe(true));
    expect(auth.passwordSet).toBe("a long pass phrase");
  });
});
