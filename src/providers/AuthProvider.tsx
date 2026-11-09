"use client";

import { useQueryClient } from "@tanstack/react-query";
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { userFromAccessToken, type SessionUser } from "@/features/auth/permissions";
import { authService as defaultAuthService, type AuthService } from "@/features/auth/services/AuthService";
import { apiClient } from "@/lib/api/ApiClient";

type AuthStatus = "loading" | "signedIn" | "signedOut";

type AuthContextValue = {
  status: AuthStatus;
  user: SessionUser | null;
  /** Instant permission check from the token's embedded claims. */
  can: (permission: string) => boolean;
  signIn: (email: string, password: string) => Promise<SessionUser>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  service: AuthService;
};

const AuthContext = createContext<AuthContextValue | null>(null);

/** Holds the signed-in user for the whole app and feeds the access token to every API request. */
export function AuthProvider({ children, service = defaultAuthService }: { children: React.ReactNode; service?: AuthService }) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<SessionUser | null>(null);
  const tokenRef = useRef<string | null>(null);

  const apply = useCallback((accessToken: string | null) => {
    tokenRef.current = accessToken;
    const next = accessToken ? userFromAccessToken(accessToken) : null;
    setUser(next);
    setStatus(next ? "signedIn" : "signedOut");
    return next;
  }, []);

  useEffect(() => {
    apiClient.setTokenProvider(() => tokenRef.current);
    let active = true;
    service
      .getSession()
      .then((session) => active && apply(session?.access_token ?? null))
      .catch(() => active && apply(null));
    const unsubscribe = service.onChange((session) => apply(session?.access_token ?? null));
    return () => {
      active = false;
      unsubscribe();
    };
  }, [service, apply]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      can: (permission) => Boolean(user?.permissions.has(permission)),
      signIn: async (email, password) => {
        const session = await service.signIn(email, password);
        const next = apply(session.access_token);
        if (!next) throw new Error("AuthProvider.tsx/signIn(): received an unreadable access token");
        return next;
      },
      signOut: async () => {
        await service.signOut();
        apply(null);
        queryClient.clear();
      },
      refresh: async () => {
        const session = await service.refresh();
        apply(session?.access_token ?? null);
      },
      service,
    }),
    [status, user, service, apply, queryClient],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside <AuthProvider>");
  return context;
}

/** `const canIssue = usePermission("bills.issue")` */
export function usePermission(permission: string): boolean {
  return useAuth().can(permission);
}
