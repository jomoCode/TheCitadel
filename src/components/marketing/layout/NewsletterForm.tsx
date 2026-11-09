"use client";

import { ArrowRight } from "lucide-react";
import { useState } from "react";
import { InfoTip } from "@/components/ui/InfoTip";

/** Newsletter sign-up (stored as a lead with type "newsletter" once the backend is connected). */
export function NewsletterForm() {
  const [done, setDone] = useState(false);

  if (done) return <p className="mt-4 text-sm text-gold">Thank you — you are on the list.</p>;

  return (
    <form
      className="mt-4"
      onSubmit={(event) => {
        event.preventDefault();
        setDone(true);
      }}
    >
      <label htmlFor="newsletter-email" className="sr-only">Email address</label>
      <div className="flex border-b border-white/30 focus-within:border-gold">
        <input
          id="newsletter-email"
          type="email"
          required
          placeholder="Your email"
          className="min-w-0 flex-1 bg-transparent py-3 text-sm text-white placeholder:text-[#a8998a] focus:outline-none"
        />
        <button type="submit" aria-label="Subscribe" className="px-2 text-gold transition-transform hover:translate-x-1">
          <ArrowRight className="size-4" aria-hidden />
        </button>
      </div>
      <p className="mt-2 flex items-center gap-1 text-xs text-[#a8998a]">
        No spam, ever. <InfoTip tip="marketing.newsletter" className="text-[#a8998a]" />
      </p>
    </form>
  );
}
