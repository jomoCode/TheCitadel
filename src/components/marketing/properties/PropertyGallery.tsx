"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import type { MarketingImage } from "@/features/marketing/types";

/** Image grid (desktop) / swipe strip (mobile) with a full-screen lightbox. */
export function PropertyGallery({ images }: { images: MarketingImage[] }) {
  const [index, setIndex] = useState<number | null>(null);
  const step = (delta: number) => setIndex((i) => (i === null ? i : (i + delta + images.length) % images.length));

  return (
    <>
      <ul className="-mx-5 flex snap-x snap-mandatory gap-3 overflow-x-auto px-5 [scrollbar-width:none] md:mx-0 md:grid md:grid-cols-3 md:px-0">
        {images.map((image, i) => (
          <li key={image.src} className="w-[80%] shrink-0 snap-center md:w-auto">
            <button type="button" onClick={() => setIndex(i)} className="relative block aspect-[4/3] w-full overflow-hidden rounded-brand" aria-label={`Open photo: ${image.alt}`}>
              <Image src={image.src} alt={image.alt} fill sizes="(min-width: 768px) 33vw, 80vw" className="object-cover transition-transform duration-700 hover:scale-105" />
            </button>
          </li>
        ))}
      </ul>

      <Dialog.Root open={index !== null} onOpenChange={(open) => !open && setIndex(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/95" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center focus:outline-none" onKeyDown={(e) => { if (e.key === "ArrowRight") step(1); if (e.key === "ArrowLeft") step(-1); }}>
            <Dialog.Title className="sr-only">Photo gallery</Dialog.Title>
            {index !== null && (
              <div className="relative h-[80svh] w-full max-w-6xl">
                <Image src={images[index].src} alt={images[index].alt} fill sizes="100vw" className="object-contain" />
              </div>
            )}
            <Dialog.Close aria-label="Close gallery" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X className="size-5" /></Dialog.Close>
            <button type="button" aria-label="Previous photo" onClick={() => step(-1)} className="absolute left-3 rounded-full bg-white/10 p-2 text-white"><ChevronLeft className="size-6" /></button>
            <button type="button" aria-label="Next photo" onClick={() => step(1)} className="absolute right-3 rounded-full bg-white/10 p-2 text-white"><ChevronRight className="size-6" /></button>
            {index !== null && <p className="absolute bottom-6 text-xs text-white/70">{index + 1} / {images.length}</p>}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
}
