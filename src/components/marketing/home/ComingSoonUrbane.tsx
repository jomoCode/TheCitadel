"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

/** Path of the feature video, served from /public. */
export const CITADEL_VIDEO_SRC = "/videos/the_citadel.mp4";

/**
 * Feature section for The Citadel in Asokoro, Abuja (now selling).
 * Mobile/tablet: bold heading stacked above the video. Desktop: heading on the left, framed video on the right.
 * The video keeps its own aspect ratio (1024×576), so nothing is cropped; the frame expands as it scrolls into view.
 * Behind it, the same video plays blurred under a dark overlay as an ambient backdrop.
 * Reduced-motion users are handled globally by <MotionConfig reducedMotion="user">.
 */
export function ComingSoonUrbane() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "center center"],
  });
  const scale = useTransform(scrollYProgress, [0, 1], [0.85, 1]);
  const textX = useTransform(scrollYProgress, [0.3, 1], [-32, 0]);
  const textOpacity = useTransform(scrollYProgress, [0.3, 1], [0, 1]);

  return (
    <section
      ref={ref}
      aria-labelledby="now-selling-citadel"
      className="relative isolate overflow-hidden bg-[#140e0c] py-12 text-[#f4ede3] md:py-16 lg:py-20"
    >
      {/* Ambient backdrop: the same video, blurred and darkened. */}
      <video
        className="absolute inset-0 -z-20 size-full scale-125 object-cover blur-2xl"
        src={CITADEL_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
        tabIndex={-1}
      />
      <div
        className="absolute inset-0 -z-10 bg-linear-to-r from-[#140e0c]/65 via-[#140e0c]/25 to-[#140e0c]/40"
        aria-hidden
      />
      <div className="container-lux grid items-center gap-10 lg:max-w-384 lg:grid-cols-[1fr_2fr] lg:gap-12">
        <motion.div style={{ x: textX, opacity: textOpacity }}>
          <div className="flex items-center gap-3 lg:gap-4">
            <span className="h-px w-10 bg-[#d4af5a] lg:w-16" aria-hidden />
            <p className="font-(family-name:--font-montserrat) text-xs uppercase tracking-[0.22em] text-[#d4af5a] lg:text-lg">
              Now selling
            </p>
          </div>
          <h2
            id="now-selling-citadel"
            className="mt-4 font-display text-4xl font-semibold uppercase leading-[1.05] tracking-wide sm:text-5xl lg:mt-6"
          >
            The Citadel
            <span className="block text-[#d4af5a]">in Asokoro, Abuja</span>
          </h2>
        </motion.div>

        <motion.div
          style={{ scale }}
          className="relative origin-center rounded-brand border border-[#d4af5a]/40 bg-[#1d1512] p-2 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)] will-change-transform md:p-3"
        >
          <video
            className="block aspect-video w-full rounded-[calc(var(--radius-brand,0.5rem)*0.6)] object-contain"
            src={CITADEL_VIDEO_SRC}
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-label="Video of The Citadel in Asokoro, Abuja"
          />
        </motion.div>
      </div>
    </section>
  );
}
