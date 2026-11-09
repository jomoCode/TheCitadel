"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useForm } from "react-hook-form";
import { FormField, inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { useSiteSettings } from "@/features/marketing/context/SiteSettingsContext";
import { useSubmitEnquiry } from "@/features/marketing/hooks/useSubmitEnquiry";
import { ENQUIRY_TYPES, enquirySchema, type EnquiryInput } from "@/features/marketing/schemas/enquiry";
import type { EnquiryType } from "@/features/marketing/types";
import { getTooltip } from "@/lib/tooltips/registry";

type EnquiryFormProps = { defaultType?: EnquiryType; propertySlug?: string; propertyName?: string; compact?: boolean };

export function EnquiryForm({ defaultType = "general", propertySlug, propertyName, compact = false }: EnquiryFormProps) {
  const { contact } = useSiteSettings();
  const pathname = usePathname();
  const mutation = useSubmitEnquiry(pathname);
  const { register, handleSubmit, formState: { errors } } = useForm<EnquiryInput>({
    resolver: zodResolver(enquirySchema),
    defaultValues: {
      enquiryType: defaultType,
      propertySlug,
      message: propertyName ? `I'd like to know more about ${propertyName}.` : "",
    },
  });

  if (mutation.isSuccess) {
    return (
      <div className="py-10 text-center" role="status">
        <CheckCircle2 className="mx-auto size-10 text-gold" aria-hidden />
        <p className="mt-4 font-display text-2xl">Thank you</p>
        <p className="mt-2 text-sm text-muted-foreground">An adviser will contact you within one working day. Your reference is {mutation.data.reference}.</p>
      </div>
    );
  }

  const fieldProps = (name: keyof EnquiryInput) => ({ id: `enquiry-${name}`, "aria-invalid": Boolean(errors[name]), "aria-describedby": errors[name] ? `enquiry-${name}-error` : undefined });

  return (
    <form noValidate onSubmit={handleSubmit((values) => mutation.mutate(values))} className="space-y-4">
      <FormField id="enquiry-name" label="Full name" error={errors.name?.message}>
        <input {...register("name")} {...fieldProps("name")} autoComplete="name" className={inputClass} />
      </FormField>
      <div className={compact ? "space-y-4" : "grid gap-4 sm:grid-cols-2"}>
        <FormField id="enquiry-email" label="Email" error={errors.email?.message}>
          <input {...register("email")} {...fieldProps("email")} type="email" autoComplete="email" inputMode="email" className={inputClass} />
        </FormField>
        <FormField id="enquiry-phone" label="Phone" error={errors.phone?.message}>
          <input {...register("phone")} {...fieldProps("phone")} type="tel" autoComplete="tel" inputMode="tel" placeholder="+234" className={inputClass} />
        </FormField>
      </div>
      <FormField id="enquiry-enquiryType" label="How can we help?" tip={getTooltip("marketing.enquiryType")} error={errors.enquiryType?.message}>
        <select {...register("enquiryType")} {...fieldProps("enquiryType")} className={inputClass}>
          {ENQUIRY_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
      </FormField>
      <FormField id="enquiry-message" label="Message" error={errors.message?.message}>
        <textarea {...register("message")} {...fieldProps("message")} rows={compact ? 3 : 5} className={inputClass} />
      </FormField>
      <input type="hidden" {...register("propertySlug")} />

      <label className="flex items-start gap-3 text-xs leading-relaxed text-muted-foreground">
        <input type="checkbox" {...register("consent")} className="mt-0.5 size-4 accent-gold" />
        <span>
          I agree that Citadel may contact me about this enquiry and store my details as described in the{" "}
          <Link href="/legal/privacy" className="underline">privacy policy</Link>.
        </span>
      </label>
      {errors.consent && <p role="alert" className="text-xs text-danger">{errors.consent.message}</p>}

      {mutation.isError && (
        <p role="alert" className="rounded-brand border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          We could not send your message just now. Please try again, or call us on {contact.phone}.
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending…" : "Send enquiry"}
      </Button>
    </form>
  );
}
