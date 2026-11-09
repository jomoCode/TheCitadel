"use client";

import { Loader2, ShieldOff } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { buttonVariants } from "@/components/ui/Button";
import type { SessionUser } from "@/features/auth/permissions";
import { useAuth } from "@/providers/AuthProvider";

type RequireAccessProps = {
  /** Decide whether this user may see the area. */
  allow: (user: SessionUser) => boolean;
  children: React.ReactNode;
};

/**
 * Client-side gate for signed-in areas. It only controls what is shown —
 * every API call is still checked by the server.
 */
export function RequireAccess({ allow, children }: RequireAccessProps) {
  const { status, user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (status === "signedOut") router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [status, router, pathname]);

  if (status !== "signedIn" || !user) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center" role="status" aria-label="Loading">
        <Loader2 className="size-6 animate-spin text-gold" aria-hidden />
      </div>
    );
  }

  if (!allow(user)) {
    return (
      <div className="flex min-h-[100svh] flex-col items-center justify-center px-6 text-center">
        <ShieldOff className="size-10 text-gold" aria-hidden />
        <h1 className="mt-4 font-display text-3xl">You don&apos;t have access to this area</h1>
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">
          If you think this is a mistake, ask an administrator to check the role on your account.
        </p>
        <Link href="/" className={buttonVariants({ variant: "outline", className: "mt-6" })}>Back to the website</Link>
      </div>
    );
  }

  return <>{children}</>;
}
