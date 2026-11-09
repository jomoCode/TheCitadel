"use client";

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils/cn";

type Slide = { src: string; alt: string };

const HOLD_MS = 6000;
/** Slow, decelerating curve — the "luxury" feel comes from unhurried easing, not speed. */
const EASE = [0.76, 0, 0.24, 1] as const;

/**
 * Gallery-style slideshow: each image wipes in from the right like a curtain while settling from a slight zoom,
 * holds, then drifts left and fades as the next arrives. Gold progress lines double as controls.
 * Pauses on hover/focus, while off-screen and when the tab is hidden. Reduced motion: plain crossfade.
 */
export function CitadelSlideshow({ slides, sizes, className }: { slides: readonly Slide[]; sizes: string; className?: string }) {
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const inView = useInView(root, { amount: 0.3 });
  const reduce = useReducedMotion();
  const paused = hovered || tabHidden || !inView;

  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), [slides.length]);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.hidden);
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  // Restarts on every slide change, so a manual pick gets a full hold before moving on.
  useEffect(() => {
    if (paused || slides.length < 2) return;
    const t = setTimeout(() => go(index + 1), HOLD_MS);
    return () => clearTimeout(t);
  }, [index, paused, go, slides.length]);

  const slide = slides[index];

  return (
    <div
      ref={root}
      className={cn("group relative overflow-hidden bg-black", className)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onBlur={() => setHovered(false)}
      aria-roledescription="carousel"
      aria-label="The Citadel in pictures"
    >
      <AnimatePresence initial={false}>
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={reduce ? { opacity: 0 } : { clipPath: "inset(0 0 0 100%)", zIndex: 2 }}
          animate={reduce ? { opacity: 1 } : { clipPath: "inset(0 0 0 0%)", zIndex: 2 }}
          exit={reduce ? { opacity: 0 } : { x: "-8%", opacity: 0.35, zIndex: 1 }}
          transition={{ duration: reduce ? 0.8 : 1.6, ease: EASE }}
          aria-roledescription="slide"
          aria-label={`${index + 1} of ${slides.length}`}
        >
          <motion.div
            className="absolute inset-0"
            initial={reduce ? false : { scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: (HOLD_MS + 1600) / 1000, ease: [0.22, 1, 0.36, 1] }}
          >
            <Image src={slide.src} alt={slide.alt} fill sizes={sizes} className="object-cover" priority={index === 0} />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* Soft vignette so the controls read on bright renders. */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-24 bg-linear-to-t from-black/55 to-transparent" />

      <div className="absolute inset-x-4 bottom-4 z-20 flex items-end justify-between gap-4 md:inset-x-6 md:bottom-5">
        <ol className="flex flex-1 gap-1.5" aria-label="Choose a picture">
          {slides.map((s, i) => (
            <li key={s.src} className="flex-1">
              <button
                type="button"
                onClick={() => go(i)}
                aria-label={`Show picture ${i + 1}: ${s.alt}`}
                aria-current={i === index}
                className="block w-full py-2"
              >
                <span className="relative block h-px w-full overflow-hidden bg-white/35">
                  {i < index && <span className="absolute inset-0 bg-[#d4af5a]" />}
                  {i === index && (
                    <span
                      key={`${index}-${paused}`}
                      className="absolute inset-y-0 left-0 bg-[#d4af5a]"
                      // Paused: the timer restarts on resume, so the line resets to match. Reduced motion: shown full.
                      style={{
                        width: reduce ? "100%" : undefined,
                        animation: paused || reduce ? undefined : `slideshow-progress ${HOLD_MS}ms linear forwards`,
                      }}
                    />
                  )}
                </span>
              </button>
            </li>
          ))}
        </ol>
        <p className="shrink-0 font-display text-sm tabular-nums text-white/90" aria-hidden>
          <span className="text-[#e8cf8f]">{String(index + 1).padStart(2, "0")}</span>
          <span className="mx-1.5 text-white/50">/</span>
          {String(slides.length).padStart(2, "0")}
        </p>
      </div>
    </div>
  );
}
