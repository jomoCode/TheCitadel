"use client";

import { Check, Link2, Share2 } from "lucide-react";
import { useState } from "react";

type ShareButtonsProps = { title: string; url: string };

/** Uses the phone's native share sheet when available; otherwise offers social links + copy. */
export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);
  const encoded = encodeURIComponent(url);
  const text = encodeURIComponent(title);
  const links = [
    { name: "WhatsApp", href: `https://wa.me/?text=${text}%20${encoded}` },
    { name: "X", href: `https://x.com/intent/post?text=${text}&url=${encoded}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encoded}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encoded}` },
  ];

  const nativeShare = async () => {
    try {
      await navigator.share({ title, url });
    } catch {
      /* user cancelled */
    }
  };

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-eyebrow mr-2 text-muted-foreground">Share</span>
      <button type="button" onClick={nativeShare} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs md:hidden">
        <Share2 className="size-3.5" aria-hidden /> Share article
      </button>
      {links.map((l) => (
        <a key={l.name} href={l.href} target="_blank" rel="noreferrer" className="hidden rounded-full border border-border px-4 py-2 text-xs hover:border-gold hover:text-gold md:inline-block">
          {l.name}
        </a>
      ))}
      <button type="button" onClick={copy} aria-label="Copy link" className="inline-flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-xs hover:border-gold">
        {copied ? <Check className="size-3.5 text-success" aria-hidden /> : <Link2 className="size-3.5" aria-hidden />} {copied ? "Copied" : "Copy link"}
      </button>
    </div>
  );
}
