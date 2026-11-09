"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type Detector = { detect: (source: CanvasImageSource) => Promise<{ rawValue: string }[]> };
type DetectorCtor = new (options: { formats: string[] }) => Detector;

export function scannerSupported(): boolean {
  return typeof window !== "undefined" && "BarcodeDetector" in window && Boolean(navigator.mediaDevices?.getUserMedia);
}

/** Camera QR scanner using the phone's built-in barcode reader. Stops the camera as soon as a code is read or the sheet closes. */
export function ScanSheet({ open, onOpenChange, onCode }: { open: boolean; onOpenChange: (o: boolean) => void; onCode: (code: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let stream: MediaStream | null = null;
    let raf = 0;
    let stopped = false;
    (async () => {
      try {
        const Ctor = (window as unknown as { BarcodeDetector: DetectorCtor }).BarcodeDetector;
        const detector = new Ctor({ formats: ["qr_code"] });
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        if (!video.current || stopped) return;
        video.current.srcObject = stream;
        await video.current.play();
        const tick = async () => {
          if (stopped || !video.current) return;
          const found = await detector.detect(video.current).catch(() => []);
          if (found[0]?.rawValue) {
            onCode(found[0].rawValue);
            onOpenChange(false);
            return;
          }
          raf = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        setError("We couldn't use the camera. Allow camera access, or type the code instead.");
      }
    })();
    return () => {
      stopped = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, [open, onCode, onOpenChange]);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black" />
        <Dialog.Content className="fixed inset-0 z-50 flex flex-col items-center justify-center p-6 focus:outline-none">
          <Dialog.Title className="sr-only">Scan visitor pass</Dialog.Title>
          <Dialog.Close aria-label="Close scanner" className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white"><X className="size-6" /></Dialog.Close>
          <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl border-4 border-[#d4af5a]">
            <video ref={video} playsInline muted className="size-full object-cover" />
          </div>
          <p className="mt-6 text-center text-sm text-white/80">{error ?? "Point the camera at the visitor's QR code"}</p>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
