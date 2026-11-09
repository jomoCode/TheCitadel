"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { SkeletonRows } from "@/components/shared/app/States";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { getTooltip } from "@/lib/tooltips/registry";
import { useSiteActions, useSiteSettingsAdmin } from "../hooks/useContent";
import type { Contact, SiteSettings, SocialLink } from "../types";

const PHONE = /^\+?[0-9 ()-]{7,24}$/;
const FIELDS: { key: keyof Contact; label: string; type?: string; hint?: string }[] = [
  { key: "phone", label: "Main phone", type: "tel", hint: "Shown in the footer and contact page" },
  { key: "mobile", label: "Mobile / WhatsApp", type: "tel", hint: "Used by the “Call” buttons on phones" },
  { key: "email", label: "Email", type: "email" },
  { key: "address", label: "Address" },
  { key: "hours", label: "Opening hours" },
  { key: "mapQuery", label: "Map search", hint: "What to search on Google Maps for the contact page map" },
];

/** Returns the first problem in plain words, or null when everything is fine. */
export function contactProblem(c: Contact, socials: SocialLink[]): string | null {
  if (!PHONE.test(c.phone) || !PHONE.test(c.mobile)) return "Phone numbers can only contain digits, spaces, brackets, dashes and a leading +.";
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(c.email)) return "Enter a valid email address.";
  if (c.address.trim().length < 5) return "Enter the full address.";
  if (socials.some((s) => !s.name.trim() || !/^https?:\/\/\S+$/.test(s.href))) return "Each social link needs a name and a full web address starting with https://";
  return null;
}

function Form({ initial }: { initial: SiteSettings }) {
  const { saveSettings } = useSiteActions();
  const [contact, setContact] = useState<Contact>(initial.contact);
  const [socials, setSocials] = useState<SocialLink[]>(initial.socials);
  const [error, setError] = useState<string | null>(null);
  const submit = () => {
    const problem = contactProblem(contact, socials);
    setError(problem);
    if (!problem) saveSettings.mutate({ contact, socials: socials.map((s) => ({ name: s.name.trim(), href: s.href.trim() })) });
  };
  return (
    <form className="max-w-2xl space-y-6" onSubmit={(e) => { e.preventDefault(); submit(); }}>
      <p className="text-sm text-muted-foreground">{getTooltip("site.contact")}</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {FIELDS.map((f) => (
          <FormField key={f.key} id={`c-${f.key}`} label={f.label} className={f.key === "address" || f.key === "mapQuery" ? "sm:col-span-2" : undefined}>
            <input id={`c-${f.key}`} type={f.type ?? "text"} value={contact[f.key]} onChange={(e) => setContact({ ...contact, [f.key]: e.target.value })} className={inputClass} />
            {f.hint && <span className="text-xs text-muted-foreground">{f.hint}</span>}
          </FormField>
        ))}
      </div>
      <fieldset className="space-y-3">
        <legend className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Social media</legend>
        {socials.map((s, i) => (
          <div key={i} className="flex gap-2">
            <input aria-label={`Social network ${i + 1}`} value={s.name} placeholder="Instagram" onChange={(e) => setSocials(socials.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))} className={`${inputClass} w-36`} />
            <input aria-label={`Link ${i + 1}`} value={s.href} placeholder="https://instagram.com/…" onChange={(e) => setSocials(socials.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)))} className={inputClass} />
            <button type="button" aria-label={`Remove ${s.name || "link"}`} onClick={() => setSocials(socials.filter((_, j) => j !== i))} className="rounded p-2 text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
          </div>
        ))}
        {socials.length < 10 && <Button type="button" size="sm" variant="outline" onClick={() => setSocials([...socials, { name: "", href: "https://" }])}><Plus className="size-4" /> Add a link</Button>}
      </fieldset>
      {error && <p role="alert" className="text-sm text-danger">{error}</p>}
      <Button type="submit" disabled={saveSettings.isPending}>{saveSettings.isPending ? "Saving…" : "Save contact details"}</Button>
    </form>
  );
}

export function ContactSettingsForm() {
  const settings = useSiteSettingsAdmin();
  if (!settings.data) return <SkeletonRows rows={4} />;
  return <Form key={settings.data.updated_at ?? "initial"} initial={settings.data} />;
}
