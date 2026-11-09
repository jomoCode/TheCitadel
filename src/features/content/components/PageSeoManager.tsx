"use client";

import { ChevronRight } from "lucide-react";
import { useState } from "react";
import { SkeletonRows } from "@/components/shared/app/States";
import { Button } from "@/components/ui/Button";
import { Sheet } from "@/components/ui/Sheet";
import { getTooltip } from "@/lib/tooltips/registry";
import { usePageNames, usePageSeo, useSiteActions } from "../hooks/useContent";
import type { PageSeo } from "../types";
import { SeoFields } from "./SeoFields";

function PageSheet({ page, name, onClose }: { page: PageSeo; name: string; onClose: () => void }) {
  const { savePage } = useSiteActions();
  const [f, setF] = useState({ title: page.title ?? "", description: page.description ?? "" });
  return (
    <Sheet open onOpenChange={(o) => !o && onClose()} title={`${name} page`} description={getTooltip("seo.overview")}
      footer={<Button className="w-full" disabled={savePage.isPending}
        onClick={() => savePage.mutate({ path: page.path, title: f.title.trim() || null, description: f.description.trim() || null }, { onSuccess: onClose })}>Save</Button>}>
      <SeoFields idPrefix="page" path={page.path} title={f.title} description={f.description} fallbackTitle={`${name} | The Citadel`}
        fallbackDescription="The website's built-in description" onChange={(p) => setF({ ...f, ...p })} />
    </Sheet>
  );
}

/** Search-engine text for each main page. Listings and journal articles have their own SEO boxes on their edit screens. */
export function PageSeoManager() {
  const pages = usePageSeo();
  const names = usePageNames();
  const [editing, setEditing] = useState<PageSeo | null>(null);
  if (!pages.data) return <SkeletonRows rows={5} />;
  const name = (p: PageSeo) => names.data?.[p.path] ?? p.path;
  return (
    <div className="max-w-3xl space-y-4">
      <p className="text-sm text-muted-foreground">{getTooltip("seo.overview")} Listings and journal articles have their own boxes on their edit screens.</p>
      <ul className="divide-y divide-border rounded-lg border border-border bg-surface">
        {pages.data.map((p) => (
          <li key={p.path}>
            <button type="button" onClick={() => setEditing(p)} className="flex w-full items-center gap-3 p-4 text-left hover:bg-surface-muted">
              <span className="min-w-0 flex-1">
                <span className="font-medium">{name(p)}</span> <span className="text-xs text-muted-foreground">{p.path}</span>
                <span className="block truncate text-sm text-muted-foreground">{p.title || p.description ? p.title || p.description : "Using the built-in text"}</span>
              </span>
              <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
            </button>
          </li>
        ))}
      </ul>
      {editing && <PageSheet key={editing.path} page={editing} name={name(editing)} onClose={() => setEditing(null)} />}
    </div>
  );
}
