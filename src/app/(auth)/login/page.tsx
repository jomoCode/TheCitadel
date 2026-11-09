import type { Metadata } from "next";
import { Suspense } from "react";
import { AuthLayout } from "@/components/auth/AuthLayout";
import { LoginForm } from "@/features/auth/components/LoginForm";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <AuthLayout title="Welcome back" subtitle="Sign in to manage your home, or your estates.">
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthLayout>
  );
}
