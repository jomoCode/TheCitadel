import type { Session, SupabaseClient } from "@supabase/supabase-js";
import { getSupabase } from "@/lib/supabase/client";

/** Friendly messages for the errors people actually hit when signing in. */
function friendly(message: string): string {
  const m = message.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Please try again.";
  if (m.includes("banned") || m.includes("user is banned")) return "This account has been deactivated. Please contact the estate office.";
  if (m.includes("email not confirmed")) return "Please accept the invitation in your email first.";
  if (m.includes("rate limit") || m.includes("too many")) return "Too many attempts. Please wait a minute and try again.";
  if (m.includes("password") && m.includes("characters")) return "Your password must be at least 10 characters.";
  return "Something went wrong. Please try again.";
}

export class AuthError extends Error {}

/** All sign-in related calls in one place. Tests swap in a fake implementation. */
export class AuthService {
  constructor(private readonly supabase: () => SupabaseClient = getSupabase) {}

  async getSession(): Promise<Session | null> {
    const { data } = await this.supabase().auth.getSession();
    return data.session;
  }

  onChange(callback: (session: Session | null) => void): () => void {
    const { data } = this.supabase().auth.onAuthStateChange((_event, session) => callback(session));
    return () => data.subscription.unsubscribe();
  }

  async signIn(email: string, password: string): Promise<Session> {
    const { data, error } = await this.supabase().auth.signInWithPassword({ email, password });
    if (error || !data.session) throw new AuthError(friendly(error?.message ?? ""));
    return data.session;
  }

  async signOut(): Promise<void> {
    await this.supabase().auth.signOut();
  }

  async sendResetEmail(email: string): Promise<void> {
    const { error } = await this.supabase().auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/set-password`,
    });
    if (error) throw new AuthError(friendly(error.message));
  }

  async setPassword(password: string): Promise<void> {
    const { error } = await this.supabase().auth.updateUser({ password });
    if (error) throw new AuthError(friendly(error.message));
  }

  /** Re-issue the token so new permissions (after a role change) show up immediately. */
  async refresh(): Promise<Session | null> {
    const { data } = await this.supabase().auth.refreshSession();
    return data.session;
  }
}

export const authService = new AuthService();
