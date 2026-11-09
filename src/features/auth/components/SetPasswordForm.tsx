"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { getTooltip } from "@/lib/tooltips/registry";
import { useAuth } from "@/providers/AuthProvider";
import { homePathFor } from "../permissions";
import { AuthError } from "../services/AuthService";

export const passwordSchema = z
  .object({
    password: z.string().min(10, "Use at least 10 characters").max(72),
    confirm: z.string(),
  })
  .refine((v) => v.password === v.confirm, { message: "The two passwords don't match", path: ["confirm"] });
type Values = z.infer<typeof passwordSchema>;

/** Used by invitation links, password-reset links and the "change password" screen. */
export function SetPasswordForm({ submitLabel = "Save password", onDone }: { submitLabel?: string; onDone?: () => void }) {
  const { service, user, status, refresh } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<Values>({ resolver: zodResolver(passwordSchema) });

  if (status === "signedOut") {
    return <p role="alert" className="text-sm text-danger">This link has expired or was already used. Ask the estate office to send a new one, or use “Forgot password” on the sign-in page.</p>;
  }

  const onSubmit = async ({ password }: Values) => {
    setError(null);
    try {
      await service.setPassword(password);
      reset();
      if (onDone) return onDone();
      await refresh();
      router.replace(user ? homePathFor(user) : "/login");
    } catch (e) {
      setError(e instanceof AuthError ? e.message : "Couldn't save your password. Please try again.");
    }
  };

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <FormField id="new-password" label="New password" tip={getTooltip("resident.password")} error={errors.password?.message}>
        <input id="new-password" type="password" autoComplete="new-password" {...register("password")} className={inputClass} />
      </FormField>
      <FormField id="confirm-password" label="Confirm password" error={errors.confirm?.message}>
        <input id="confirm-password" type="password" autoComplete="new-password" {...register("confirm")} className={inputClass} />
      </FormField>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={isSubmitting || status === "loading"}>{isSubmitting ? "Saving…" : submitLabel}</Button>
    </form>
  );
}
