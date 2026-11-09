"use client";

import { Suspense } from "react";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { ContactSettingsForm } from "@/features/content/components/ContactSettingsForm";
import { FaqManager } from "@/features/content/components/FaqManager";
import { PageSeoManager } from "@/features/content/components/PageSeoManager";
import { TestimonialManager } from "@/features/content/components/TestimonialManager";
import { useListState } from "@/features/estate-core/hooks/useListState";
import { cn } from "@/lib/utils/cn";

const TABS = [
  { key: "contact", label: "Contact details", view: ContactSettingsForm },
  { key: "faqs", label: "FAQs", view: FaqManager },
  { key: "testimonials", label: "Testimonials", view: TestimonialManager },
  { key: "seo", label: "Search engines", view: PageSeoManager },
] as const;
const FILTER_KEYS = ["tab"] as const;

function SiteScreen() {
  const list = useListState(FILTER_KEYS);
  const tab = TABS.find((t) => t.key === list.filters.tab) ?? TABS[0];
  return (
    <div className="space-y-6">
      <PageHeader title="Site content" description="Contact details, FAQs, testimonials and what Google shows for each page. Changes appear on the website within about a minute." />
      <div role="tablist" className="-mx-4 flex gap-1 overflow-x-auto px-4 sm:mx-0 sm:inline-flex sm:rounded-full sm:border sm:border-border sm:p-1">
        {TABS.map((t) => (
          <button key={t.key} role="tab" type="button" aria-selected={tab.key === t.key} onClick={() => list.set({ tab: t.key === "contact" ? null : t.key })}
            className={cn("shrink-0 rounded-full px-5 py-1.5 text-sm", tab.key === t.key ? "bg-foreground text-background" : "text-muted-foreground")}>{t.label}</button>
        ))}
      </div>
      <tab.view />
    </div>
  );
}

export default function AdminSitePage() {
  return <Suspense><SiteScreen /></Suspense>;
}
