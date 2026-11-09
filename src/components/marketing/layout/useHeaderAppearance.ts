"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/** Pages that open with a full-bleed photograph, where the header floats transparently over the image. */
const OVERLAY_PREFIXES = ["/properties/", "/guides/"];
const OVERLAY_EXACT = new Set(["/", "/about"]);

export function isOverlayRoute(pathname: string): boolean {
  return OVERLAY_EXACT.has(pathname) || OVERLAY_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

/** Decides whether the header is transparent (over a hero) or solid (after scrolling / on plain pages). */
export function useHeaderAppearance(threshold = 48) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  const transparent = isOverlayRoute(pathname) && !scrolled;
  return { transparent, pathname };
}
