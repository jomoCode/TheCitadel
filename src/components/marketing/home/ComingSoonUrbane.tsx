import { Reveal } from "@/components/marketing/primitives/Reveal";

/** Path of the teaser video, served from /public. */
export const URBANE_VIDEO_SRC = "/videos/the-urbane-wuye.mp4";

/**
 * Teaser for the next development: The Urbane in Wuye (coming soon).
 * The video keeps its natural aspect ratio so no part of the frame is cropped.
 */
export function ComingSoonUrbane() {
  return (
    <section
      aria-labelledby="coming-soon-urbane"
      className="bg-[#140e0c] py-20 text-[#f4ede3] md:py-28"
    >
      <div className="container-lux">
        <Reveal>
          <p className="text-eyebrow text-[#d4af5a]">Coming soon</p>
          <h2
            id="coming-soon-urbane"
            className="mt-5 font-display text-3xl uppercase leading-tight md:text-5xl"
          >
            Coming soon — The Urbane in Wuye
          </h2>
        </Reveal>
        <video
          className="mx-auto mt-10 block h-auto max-h-[85vh] w-auto max-w-full rounded-brand md:mt-14"
          src={URBANE_VIDEO_SRC}
          autoPlay
          muted
          loop
          playsInline
          preload="metadata"
          aria-label="Teaser video for The Urbane in Wuye"
        />
      </div>
    </section>
  );
}
