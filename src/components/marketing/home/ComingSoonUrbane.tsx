"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Path of the teaser video, served from /public. */
export const URBANE_VIDEO_SRC = "/videos/the-urbane-wuye.mp4";

/**
 * Teaser for the next development: The Urbane in Wuye (coming soon).
 * The frame starts as an inset, rounded card and expands to full width as it scrolls into view.
 * The frame keeps the video's own aspect ratio (944×528), so nothing is cropped.
 * Reduced-motion users are handled globally by <MotionConfig reducedMotion="user">.
 */
export function ComingSoonUrbane() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.82, 1]);
  const radius = useTransform(scrollYProgress, [0, 1], [28, 0]);
  const textY = useTransform(scrollYProgress, [0.4, 1], [40, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.4, 1], [0, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="coming-soon-urbane"
      className="overflow-hidden bg-[#140e0c] text-[#f4ede3]"
    >
      <motion.div
        style={{ scale, borderRadius: radius }}
        className="relative aspect-[944/528] w-full origin-center overflow-hidden will-change-transform"
      >
        <video
          className="absolute inset-0 size-full object-contain"
          src={URBANE_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Teaser video for The Urbane in Wuye"
        />
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent"
          aria-hidden
        />
        <motion.div
          style={{ y: textY, opacity: textOpacity }}
          className="absolute inset-x-0 bottom-0 px-4 pb-6 sm:px-8 md:px-14 md:pb-14"
        >
          <div className="flex items-center gap-3">
            <span className="h-px w-8 bg-[#d4af5a] md:w-12" aria-hidden />
            <p className="text-eyebrow text-[#d4af5a]">Coming soon</p>
          </div>
          <h2
            id="coming-soon-urbane"
            className="mt-3 font-display text-2xl uppercase leading-tight tracking-wide drop-shadow-lg sm:text-4xl md:mt-4 md:text-6xl"
          >
            The Urbane <span className="text-[#d4af5a]">in Wuye</span>
          </h2>
        </motion.div>
      </motion.div>
    </section>
  );
}
