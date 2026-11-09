"use client";

import { LogOut } from "lucide-react";
import { useState } from "react";
import { ErrorState, SkeletonRows } from "@/components/shared/app/States";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { SetPasswordForm } from "@/features/auth/components/SetPasswordForm";
import { useResidentHome, useUpdateOwnPhone } from "@/features/resident/hooks/useResidentHome";
import { getTooltip } from "@/lib/tooltips/registry";
import { useAuth } from "@/providers/AuthProvider";
import { useToast } from "@/providers/ToastProvider";

const PHONE = /^\+?[0-9 ()-]{7,20}$/;

export default function ResidentProfilePage() {
  const home = useResidentHome();
  const { signOut } = useAuth();
  const toast = useToast();
  // null = not edited yet → show the saved number
  const [draft, setPhone] = useState<string | null>(null);
  const save = useUpdateOwnPhone(() => setPhone(null));

  if (home.error) return <ErrorState error={home.error} onRetry={home.refetch} />;
  if (!home.data) return <SkeletonRows rows={3} />;
  const phone = draft ?? home.data.phone ?? "";
  const valid = PHONE.test(phone.trim());

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <header>
        <h1 className="font-display text-3xl">Profile</h1>
        <p className="mt-1 text-sm text-muted-foreground">{home.data.full_name} · {home.data.email}</p>
        <p className="mt-1 text-xs text-muted-foreground">To change your name or email, please contact the estate office.</p>
      </header>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Phone number</h2>
        <FormField id="own-phone" label="Phone" tip={getTooltip("resident.phone")} error={phone && !valid ? "Enter a valid phone number" : undefined}>
          <input id="own-phone" type="tel" inputMode="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClass} />
        </FormField>
        <Button className="w-full sm:w-auto" disabled={!valid || phone === (home.data.phone ?? "") || save.isPending} onClick={() => save.mutate(phone.trim())}>Save phone</Button>
      </section>

      <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
        <h2 className="font-display text-xl">Change password</h2>
        <SetPasswordForm submitLabel="Update password" onDone={() => toast.success("Password updated")} />
      </section>

      <Button variant="outline" size="lg" className="w-full" onClick={signOut}><LogOut className="size-4" /> Sign out</Button>
    </div>
  );
}
