import type { Session } from "@supabase/supabase-js";
import { AuthError, AuthService } from "@/features/auth/services/AuthService";

const b64 = (value: object) => btoa(JSON.stringify(value)).replace(/=+$/, "").replace(/\+/g, "-").replace(/\//g, "_");

/** Unsigned test token carrying permission claims (the UI only decodes; the server verifies). */
export function makeToken(claims: { sub?: string; email?: string; app_permissions?: string[]; app_roles?: string[] }): string {
  return `${b64({ alg: "none", typ: "JWT" })}.${b64({ sub: "user-1", email: "user@example.com", ...claims })}.sig`;
}

const session = (token: string) => ({ access_token: token }) as unknown as Session;

/** In-memory AuthService: no network, deterministic. */
export class FakeAuthService extends AuthService {
  current: Session | null;
  listeners: ((s: Session | null) => void)[] = [];
  passwordSet: string | null = null;

  constructor(
    token: string | null = null,
    private readonly accounts: Record<string, { password: string; token: string }> = {},
  ) {
    super(() => {
      throw new Error("FakeAuthService has no Supabase client");
    });
    this.current = token ? session(token) : null;
  }

  async getSession() {
    return this.current;
  }

  onChange(callback: (s: Session | null) => void) {
    this.listeners.push(callback);
    return () => undefined;
  }

  async signIn(email: string, password: string) {
    const account = this.accounts[email];
    if (!account || account.password !== password) throw new AuthError("That email and password don't match. Please try again.");
    this.current = session(account.token);
    return this.current;
  }

  async signOut() {
    this.current = null;
  }

  async sendResetEmail() {}

  async setPassword(password: string) {
    this.passwordSet = password;
  }

  async refresh() {
    return this.current;
  }
}

export const ADMIN_PERMS = ["estates.view", "estates.manage", "houses.view", "houses.manage", "residents.view", "residents.manage", "roles.manage", "audit.view"];
export const RESIDENT_PERMS = ["self.bills", "self.pay", "self.tickets", "self.visitors"];
