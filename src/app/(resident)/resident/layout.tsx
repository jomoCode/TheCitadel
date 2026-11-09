"use client";

import { RequireAccess } from "@/components/auth/RequireAccess";
import { ResidentShell } from "@/components/resident/ResidentShell";
import { canUseResident } from "@/features/auth/permissions";

export default function ResidentLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAccess allow={canUseResident}>
      <ResidentShell>{children}</ResidentShell>
    </RequireAccess>
  );
}
