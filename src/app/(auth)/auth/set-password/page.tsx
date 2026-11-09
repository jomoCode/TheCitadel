import type { Metadata } from "next";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { SetPasswordForm } from "@/features/auth/components/SetPasswordForm";

export const metadata: Metadata = { title: "Choose your password", robots: { index: false } };

/** Landing page for invitation and password-reset email links. */
export default function SetPasswordPage() {
  return (
    <AuthLayout title="Choose your password" subtitle="You'll use this with your email address to sign in.">
      <SetPasswordForm submitLabel="Save and continue" />
    </AuthLayout>
  );
}
