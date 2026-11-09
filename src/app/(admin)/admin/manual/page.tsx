"use client";

import { Lightbulb } from "lucide-react";
import { useMemo, useState } from "react";
import { SearchInput } from "@/components/shared/app/ListControls";
import { PageHeader } from "@/components/shared/app/PageHeader";
import { EmptyState } from "@/components/shared/app/States";
import { manualSections } from "@/content/manual/sections";

export default function ManualPage() {
  const [q, setQ] = useState("");
  const sections = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return manualSections;
    return manualSections.filter((s) => [s.title, s.summary, ...(s.steps ?? []), ...(s.tips ?? [])].some((t) => t.toLowerCase().includes(term)));
  }, [q]);

  return (
    <div className="space-y-6">
      <PageHeader title="User manual" description="Step-by-step guides for everything in the administration area." />
      <SearchInput value={q} onChange={setQ} placeholder="Search the manual, e.g. “move resident”" className="sm:w-96" />
      <div className="grid gap-8 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Manual contents" className="hidden lg:block">
          <ul className="sticky top-10 space-y-1 text-sm">
            {sections.map((s) => <li key={s.id}><a href={`#${s.id}`} className="block rounded px-2 py-1.5 text-muted-foreground hover:bg-surface-muted hover:text-foreground">{s.title}</a></li>)}
          </ul>
        </nav>
        <div className="space-y-5">
          {sections.length === 0 && <EmptyState title="Nothing found" body="Try a different word." />}
          {sections.map((s) => (
            <article key={s.id} id={s.id} className="scroll-mt-20 rounded-lg border border-border bg-surface p-5 md:p-7">
              <h2 className="font-display text-2xl">{s.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.summary}</p>
              {s.steps && (
                <ol className="mt-4 space-y-2">
                  {s.steps.map((step, i) => (
                    <li key={step} className="flex gap-3 text-sm"><span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-gold-soft text-xs text-gold">{i + 1}</span>{step}</li>
                  ))}
                </ol>
              )}
              {s.tips?.map((tip) => <p key={tip} className="mt-4 flex gap-2 rounded-brand bg-surface-muted p-3 text-sm"><Lightbulb className="mt-0.5 size-4 shrink-0 text-gold" />{tip}</p>)}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
