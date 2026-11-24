"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { track } from "./track";
import type { TrackInput } from "./types";

type TrackedLinkProps = ComponentProps<typeof Link> & { tracking: TrackInput };

/**
 * A Next.js <Link> that records an analytics event when clicked. Lets server components track CTAs
 * without becoming client components themselves.
 */
export function TrackedLink({ tracking, onClick, ...props }: TrackedLinkProps) {
  return (
    <Link
      {...props}
      onClick={(event) => {
        track(tracking);
        onClick?.(event);
      }}
    />
  );
}

type TrackedAnchorProps = ComponentProps<"a"> & { tracking: TrackInput };

/** A plain <a> (external, mailto:, tel:, downloads) that records an analytics event when clicked. */
export function TrackedAnchor({ tracking, onClick, ...props }: TrackedAnchorProps) {
  return (
    <a
      {...props}
      onClick={(event) => {
        track(tracking);
        onClick?.(event);
      }}
    />
  );
}
