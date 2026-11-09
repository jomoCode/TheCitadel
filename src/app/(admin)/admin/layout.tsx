"use client";

import { AdminShell } from "@/components/admin/AdminShell";
import { RequireAccess } from "@/components/auth/RequireAccess";
import { canUseAdmin } from "@/features/auth/permissions";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RequireAccess allow={canUseAdmin}>
      <AdminShell>{children}</AdminShell>
    </RequireAccess>
  );
}
