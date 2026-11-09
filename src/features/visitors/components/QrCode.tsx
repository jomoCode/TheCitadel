"use client";

import QRCode from "qrcode";
import { useEffect, useRef } from "react";

/** Draws a QR code locally (nothing is sent to a third party). Always dark-on-white so scanners read it in any theme. */
export function QrCode({ value, size = 200, label }: { value: string; size?: number; label: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (canvas.current) {
      QRCode.toCanvas(canvas.current, value, { width: size, margin: 1, errorCorrectionLevel: "M", color: { dark: "#140e0c", light: "#ffffff" } })
        .catch(() => undefined);
    }
  }, [value, size]);
  return <canvas ref={canvas} role="img" aria-label={label} width={size} height={size} className="rounded-lg bg-white p-2" />;
}
