"use client";

import { ArrowDown, ArrowUp, Heading2, ImagePlus, List, Pilcrow, Quote, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { inputClass } from "@/components/shared/form/FormField";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import type { BlogBlock } from "@/features/marketing/types";
import { ApiError } from "@/lib/api/ApiClient";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";

type Kind = BlogBlock["kind"];
const ADD: { kind: Kind; label: string; icon: typeof Pilcrow }[] = [
  { kind: "paragraph", label: "Paragraph", icon: Pilcrow }, { kind: "heading", label: "Heading", icon: Heading2 },
  { kind: "list", label: "List", icon: List }, { kind: "quote", label: "Quote", icon: Quote }, { kind: "image", label: "Photo", icon: ImagePlus },
];
const LABEL: Record<Kind, string> = { paragraph: "Paragraph", heading: "Heading", list: "Bullet list", quote: "Quote", image: "Photo" };

export function emptyBlock(kind: Kind): BlogBlock {
  switch (kind) {
    case "list": return { kind, items: [""] };
    case "quote": return { kind, text: "" };
    case "image": return { kind, image: { src: "", alt: "" } };
    default: return { kind, text: "" };
  }
}

/** Removes empty blocks/items before saving, so half-finished blocks never reach the website. */
export function cleanBlocks(blocks: BlogBlock[]): BlogBlock[] {
  return blocks.flatMap((b): BlogBlock[] => {
    if (b.kind === "list") {
      const items = b.items.map((i) => i.trim()).filter(Boolean);
      return items.length ? [{ kind: "list", items }] : [];
    }
    if (b.kind === "image") return b.image.src ? [{ ...b, caption: b.caption?.trim() || undefined }] : [];
    if (b.kind === "quote") return b.text.trim() ? [{ kind: "quote", text: b.text.trim(), cite: b.cite?.trim() || undefined }] : [];
    return b.text.trim() ? [{ ...b, text: b.text.trim() }] : [];
  });
}

function PhotoBlock({ block, onChange, upload }: { block: Extract<BlogBlock, { kind: "image" }>; onChange: (b: BlogBlock) => void; upload: (f: File) => Promise<string> }) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  async function pick(file?: File) {
    if (!file) return;
    setBusy(true);
    setError(null);
    try {
      onChange({ ...block, image: { src: await upload(file), alt: block.image.alt } });
    } catch (e) {
      setError(e instanceof ApiError ? e.message : "Upload failed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="space-y-2">
      {block.image.src ? (
        <div className="relative aspect-[16/9] overflow-hidden rounded-md"><Image src={block.image.src} alt={block.image.alt} fill sizes="600px" className="object-cover" /></div>
      ) : (
        <button type="button" onClick={() => input.current?.click()} disabled={busy}
          className="flex aspect-[16/7] w-full items-center justify-center gap-2 rounded-md border-2 border-dashed border-border text-sm text-muted-foreground hover:border-gold">
          <ImagePlus className="size-5" /> {busy ? "Uploading…" : "Choose a photo"}
        </button>
      )}
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden aria-label="Upload article photo" onChange={(e) => pick(e.target.files?.[0])} />
      {error && <p role="alert" className="text-xs text-danger">{error}</p>}
      <input aria-label="Describe the photo" placeholder="Describe the photo (for screen readers and Google)" value={block.image.alt}
        onChange={(e) => onChange({ ...block, image: { ...block.image, alt: e.target.value } })} className={inputClass} />
      <input aria-label="Caption" placeholder="Caption (optional)" value={block.caption ?? ""} onChange={(e) => onChange({ ...block, caption: e.target.value })} className={inputClass} />
    </div>
  );
}

function BlockFields({ block, onChange, upload }: { block: BlogBlock; onChange: (b: BlogBlock) => void; upload: (f: File) => Promise<string> }) {
  switch (block.kind) {
    case "paragraph":
      return <textarea aria-label="Paragraph text" rows={4} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className={inputClass} />;
    case "heading":
      return <input aria-label="Heading text" value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className={cn(inputClass, "font-display text-lg")} />;
    case "list":
      return <textarea aria-label="List items, one per line" rows={4} value={block.items.join("\n")} placeholder="One point per line"
        onChange={(e) => onChange({ ...block, items: e.target.value.split("\n") })} className={inputClass} />;
    case "quote":
      return (
        <div className="space-y-2">
          <textarea aria-label="Quote text" rows={2} value={block.text} onChange={(e) => onChange({ ...block, text: e.target.value })} className={cn(inputClass, "italic")} />
          <input aria-label="Who said it" placeholder="Who said it (optional)" value={block.cite ?? ""} onChange={(e) => onChange({ ...block, cite: e.target.value })} className={inputClass} />
        </div>
      );
    case "image":
      return <PhotoBlock block={block} onChange={onChange} upload={upload} />;
  }
}

/** The article body as a list of simple blocks — easy on a phone, and the website renders each one in its own style. */
export function BlockEditor({ blocks, onChange, upload }: { blocks: BlogBlock[]; onChange: (blocks: BlogBlock[]) => void; upload: (f: File) => Promise<string> }) {
  const set = (i: number, b: BlogBlock) => onChange(blocks.map((x, j) => (j === i ? b : x)));
  const move = (i: number, by: -1 | 1) => { const next = [...blocks]; [next[i], next[i + by]] = [next[i + by], next[i]]; onChange(next); };
  return (
    <section className="space-y-3">
      <h2 className="flex items-center gap-1 font-display text-2xl">Article <InfoTip text={getTooltip("journal.blocks")} /></h2>
      {blocks.length === 0 && <p className="text-sm text-muted-foreground">Start with a paragraph, then add headings, lists, quotes or photos.</p>}
      <ol className="space-y-3">
        {blocks.map((block, i) => (
          <li key={i} className="rounded-lg border border-border bg-surface p-3">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{LABEL[block.kind]}</span>
              <span className="flex">
                <button type="button" aria-label={`Move block ${i + 1} up`} disabled={i === 0} onClick={() => move(i, -1)} className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="size-4" /></button>
                <button type="button" aria-label={`Move block ${i + 1} down`} disabled={i === blocks.length - 1} onClick={() => move(i, 1)} className="rounded p-1.5 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="size-4" /></button>
                <button type="button" aria-label={`Remove block ${i + 1}`} onClick={() => onChange(blocks.filter((_, j) => j !== i))} className="rounded p-1.5 text-muted-foreground hover:text-danger"><Trash2 className="size-4" /></button>
              </span>
            </div>
            <BlockFields block={block} onChange={(b) => set(i, b)} upload={upload} />
          </li>
        ))}
      </ol>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Add a block">
        {ADD.map((a) => (
          <Button key={a.kind} type="button" size="sm" variant="outline" onClick={() => onChange([...blocks, emptyBlock(a.kind)])}>
            <a.icon className="size-4" /> {a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}
