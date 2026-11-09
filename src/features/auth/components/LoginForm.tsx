"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/providers/AuthProvider";
import { homePathFor } from "../permissions";
import { AuthError } from "../services/AuthService";

const schema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Please enter your password"),
});
type Values = z.infer<typeof schema>;

export function LoginForm() {
  const { signIn, service } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(params.get("no-access") ? "Your account doesn't have access to any area yet. Please contact the estate office." : null);
  const [notice, setNotice] = useState<string | null>(null);
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setError(null);
    try {
      const user = await signIn(values.email, values.password);
      const next = params.get("next");
      router.replace(next && next.startsWith("/") ? next : homePathFor(user));
    } catch (e) {
      setError(e instanceof AuthError ? e.message : "Something went wrong. Please try again.");
    }
  };

  const forgot = async () => {
    const email = getValues("email");
    if (!email) return setError("Enter your email above first, then tap “Forgot password”.");
    try {
      await service.sendResetEmail(email);
      setNotice("If that email has an account, a reset link is on its way.");
      setError(null);
    } catch (e) {
      setError(e instanceof AuthError ? e.message : "Couldn't send the email. Please try again.");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField id="login-email" label="Email" error={errors.email?.message}>
        <input id="login-email" type="email" autoComplete="email" inputMode="email" {...register("email")} className={inputClass} />
      </FormField>
      <FormField id="login-password" label="Password" error={errors.password?.message}>
        <div className="relative">
          <input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" {...register("password")} className={`${inputClass} pr-12`} />
          <button type="button" onClick={() => setShowPassword((s) => !s)} aria-label={showPassword ? "Hide password" : "Show password"} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
          </button>
        </div>
      </FormField>
      {error && <p role="alert" className="rounded-brand border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p>}
      {notice && <p role="status" className="rounded-brand border border-success/40 bg-success/10 p-3 text-sm text-success">{notice}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>{isSubmitting ? "Signing in…" : "Sign in"}</Button>
      <button type="button" onClick={forgot} className="w-full text-center text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
        Forgot password?
      </button>
    </form>
  );
}
