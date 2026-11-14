import { Reveal } from "@/components/marketing/primitives/Reveal";

/** Path of the teaser video, served from /public. */
export const URBANE_VIDEO_SRC = "/videos/the-urbane-wuye.mp4";

/** Full-bleed teaser for the next development: The Urbane in Wuye (coming soon). */
export function ComingSoonUrbane() {
  return (
    <section
      aria-labelledby="coming-soon-urbane"
      className="relative isolate overflow-hidden bg-[#140e0c] text-[#f4ede3]"
    >
      <video
        className="absolute inset-0 -z-10 size-full object-cover"
        src={URBANE_VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        aria-hidden
      />
      <div
        className="absolute inset-0 -z-10 bg-gradient-to-t from-[#140e0c]/90 via-[#140e0c]/40 to-[#140e0c]/20"
        aria-hidden
      />
      <div className="container-lux flex min-h-[70vh] items-end py-20 md:min-h-[80vh] md:py-28">
        <Reveal>
          <p className="text-eyebrow text-[#d4af5a]">Coming soon</p>
          <h2
            id="coming-soon-urbane"
            className="mt-5 font-display text-3xl uppercase leading-tight md:text-5xl"
          >
            Coming soon — The Urbane in Wuye
          </h2>
        </Reveal>
      </div>
    </section>
  );
}
