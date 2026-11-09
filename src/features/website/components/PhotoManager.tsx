"use client";

import { ArrowLeft, ArrowRight, ImagePlus, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import { useListingActions } from "../hooks/useWebsite";
import type { Listing, ListingPhoto } from "../types";

const ACCEPT = "image/jpeg,image/png,image/webp";
const MAX_BYTES = 10 * 1024 * 1024;

/** Upload, order and remove a listing's photos. The first photo is the cover. */
export function PhotoManager({ listing }: { listing: Listing }) {
  const actions = useListingActions(listing.id);
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState<{ done: number; total: number } | null>(null);
  const [skipped, setSkipped] = useState<string[]>([]);
  const [removing, setRemoving] = useState<ListingPhoto | null>(null);
  const photos = listing.photos;
  const lastLivePhoto = listing.is_published && photos.length === 1;

  async function upload(files: FileList | null) {
    const list = Array.from(files ?? []);
    const ok = list.filter((f) => ACCEPT.includes(f.type) && f.size <= MAX_BYTES);
    setSkipped(list.filter((f) => !ok.includes(f)).map((f) => f.name));
    setUploading({ done: 0, total: ok.length });
    for (const [i, file] of ok.entries()) {
      try {
        await actions.addPhoto.mutateAsync(file);
      } catch {
        /* the toast already explained it; carry on with the rest */
      }
      setUploading({ done: i + 1, total: ok.length });
    }
    setUploading(null);
    if (input.current) input.current.value = "";
  }

  function move(index: number, by: -1 | 1) {
    const ids = photos.map((p) => p.id);
    [ids[index], ids[index + by]] = [ids[index + by], ids[index]];
    actions.reorder.mutate(ids);
  }

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="flex items-center gap-1 font-display text-2xl">Photos <InfoTip text={getTooltip("website.photos")} /></h2>
        <Button size="sm" variant="outline" disabled={Boolean(uploading)} onClick={() => input.current?.click()}>
          <ImagePlus className="size-4" /> {uploading ? `Uploading ${uploading.done}/${uploading.total}…` : "Add photos"}
        </Button>
        <input ref={input} type="file" accept={ACCEPT} multiple hidden aria-label="Upload photos" onChange={(e) => upload(e.target.files)} />
      </div>
      {skipped.length > 0 && <p role="alert" className="text-sm text-danger">Skipped {skipped.join(", ")} — only JPG, PNG or WebP up to 10 MB.</p>}
      {photos.length === 0 ? (
        <button type="button" onClick={() => input.current?.click()}
          className="flex aspect-[16/7] w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-gold">
          <ImagePlus className="size-8" /> Add the first photo — it becomes the cover
        </button>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {photos.map((photo, i) => (
            <li key={photo.id} className={cn("group relative overflow-hidden rounded-lg border bg-surface", i === 0 ? "border-gold" : "border-border")}>
              <div className="relative aspect-[4/3]">
                <Image src={photo.url} alt={photo.alt} fill sizes="(min-width: 1024px) 20vw, 50vw" className="object-cover" />
              </div>
              {i === 0 && <span className="absolute left-2 top-2 rounded-full bg-gold px-2 py-0.5 text-[0.65rem] font-medium text-[#140e0c]">Cover</span>}
              <div className="flex items-center justify-between p-1.5">
                <div className="flex">
                  <button type="button" aria-label={`Move photo ${i + 1} earlier`} disabled={i === 0 || actions.reorder.isPending} onClick={() => move(i, -1)}
                    className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowLeft className="size-4" /></button>
                  <button type="button" aria-label={`Move photo ${i + 1} later`} disabled={i === photos.length - 1 || actions.reorder.isPending} onClick={() => move(i, 1)}
                    className="rounded p-2 text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowRight className="size-4" /></button>
                </div>
                <button type="button" aria-label={`Remove photo ${i + 1}`} disabled={lastLivePhoto} title={lastLivePhoto ? "A live listing needs at least one photo" : undefined}
                  onClick={() => setRemoving(photo)} className="rounded p-2 text-muted-foreground hover:text-danger disabled:opacity-30"><Trash2 className="size-4" /></button>
              </div>
            </li>
          ))}
        </ul>
      )}
      <ConfirmDialog open={Boolean(removing)} onOpenChange={(o) => !o && setRemoving(null)} tone="danger" pending={actions.removePhoto.isPending}
        title="Remove this photo?" body="It will disappear from the website within about a minute." confirmLabel="Remove photo"
        onConfirm={() => removing && actions.removePhoto.mutate(removing.id, { onSuccess: () => setRemoving(null) })} />
    </section>
  );
}
