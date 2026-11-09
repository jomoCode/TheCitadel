"use client";

import { RequireAccess } from "@/components/auth/RequireAccess";
import { SecurityShell } from "@/components/security/SecurityShell";
import { canUseGate } from "@/features/auth/permissions";

export default function SecurityLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAccess allow={canUseGate}>
      <SecurityShell>{children}</SecurityShell>
    </RequireAccess>
  );
}
