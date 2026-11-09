"use client";

import { FileText, ImageIcon, Lock, Paperclip } from "lucide-react";
import { useRef, useState } from "react";
import { ApiError } from "@/lib/api/ApiClient";
import { cn } from "@/lib/utils/cn";
import { useToast } from "@/providers/ToastProvider";
import type { Attachment } from "../types";

const ACCEPT = "image/jpeg,image/png,image/webp,image/heic,application/pdf";
const MAX = 10 * 1024 * 1024;

/** Opens a file through a short-lived private link fetched on demand (files are never public). */
export function AttachmentList({ items, open }: { items: Attachment[]; open: (id: string) => Promise<{ url: string }> }) {
  const toast = useToast();
  if (items.length === 0) return null;
  const view = async (id: string) => {
    try {
      window.open((await open(id)).url, "_blank", "noopener,noreferrer");
    } catch (e) {
      toast.error(e instanceof ApiError ? e.message : "Couldn't open that file");
    }
  };
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((a) => (
        <li key={a.id}>
          <button type="button" onClick={() => view(a.id)}
            className={cn("flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs hover:border-gold", a.is_internal ? "border-warning/50 bg-warning/10" : "border-border bg-surface")}>
            {a.content_type.startsWith("image/") ? <ImageIcon className="size-3.5" /> : <FileText className="size-3.5" />}
            <span className="max-w-40 truncate">{a.filename}</span>
            {a.is_internal && <Lock className="size-3" aria-label="Staff only" />}
          </button>
        </li>
      ))}
    </ul>
  );
}

/** Photo/PDF picker. On phones `accept=image/*` offers the camera directly. Files are checked before upload. */
export function FilePicker({ onPick, label = "Add photo or PDF", disabled }: { onPick: (file: File) => void; label?: string; disabled?: boolean }) {
  const input = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  return (
    <div>
      <input ref={input} type="file" accept={ACCEPT} className="sr-only" aria-label={label} disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          e.target.value = "";
          if (!file) return;
          if (file.size > MAX) return setError("That file is over 10 MB. Please choose a smaller one.");
          setError(null);
          onPick(file);
        }} />
      <button type="button" disabled={disabled} onClick={() => input.current?.click()}
        className="flex items-center gap-2 rounded-full border border-dashed border-border px-4 py-2 text-sm text-muted-foreground hover:border-gold hover:text-foreground disabled:opacity-50">
        <Paperclip className="size-4" /> {label}
      </button>
      {error && <p role="alert" className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
