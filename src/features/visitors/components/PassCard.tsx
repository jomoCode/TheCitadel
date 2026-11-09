"use client";

import { Check, Copy, Share2, Users } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { InfoTip } from "@/components/ui/InfoTip";
import { getTooltip } from "@/lib/tooltips/registry";
import { cn } from "@/lib/utils/cn";
import type { Invitation } from "../types";
import { QrCode } from "./QrCode";

export function windowText(from: string, until: string): string {
  const a = new Date(from), b = new Date(until);
  const sameDay = a.toDateString() === b.toDateString();
  const day = (d: Date) => d.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
  const time = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return sameDay ? `${day(a)}, ${time(a)} – ${time(b)}` : `${day(a)} ${time(a)} – ${day(b)} ${time(b)}`;
}

export function passLink(code: string): string {
  return `${typeof window === "undefined" ? "" : window.location.origin}/pass/${code}`;
}

/** The resident's view of a pass: big code, QR, and one-tap sharing to the guest (WhatsApp, SMS…). */
export function PassCard({ invite, onRevoke, expanded = false }: { invite: Invitation; onRevoke?: () => void; expanded?: boolean }) {
  const [open, setOpen] = useState(expanded);
  const [copied, setCopied] = useState(false);
  const live = invite.status === "active";
  const code = invite.pass_code ?? "";
  const message = `Hi ${invite.visitor_name.split(" ")[0]}, here's your pass for ${invite.estate_name} (House ${invite.house_identifier}). Show this code at the gate: ${code}\n${passLink(code)}`;

  const share = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: "Your visitor pass", text: message }); return; } catch { /* cancelled */ }
    }
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, "_blank", "noopener");
  };
  const copy = async () => {
    await navigator.clipboard.writeText(message);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <article className={cn("rounded-2xl border p-4", live ? "border-border bg-surface" : "border-border/60 bg-surface-muted/50 opacity-80")}>
      <button type="button" onClick={() => setOpen((o) => !o)} className="flex w-full items-start justify-between gap-3 text-left" aria-expanded={open}>
        <div className="min-w-0">
          <p className="font-medium">{invite.visitor_name}</p>
          <p className="text-xs text-muted-foreground">{windowText(invite.valid_from, invite.valid_until)}</p>
          {invite.headcount > 1 && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Users className="size-3" /> {invite.headcount} people</p>}
        </div>
        <span className={cn("shrink-0 rounded-full px-2.5 py-0.5 text-xs", live ? "bg-success/15 text-success" : "bg-surface-muted text-muted-foreground")}>
          {live ? (invite.multi_entry ? "Active · multi-entry" : "Active") : invite.status[0].toUpperCase() + invite.status.slice(1)}
        </span>
      </button>
      {open && live && code && (
        <div className="mt-4 flex flex-col items-center gap-4 border-t border-border pt-4">
          <QrCode value={code} label={`QR code for pass ${code}`} />
          <p className="font-mono text-3xl tracking-[0.2em]" aria-label={`Pass code ${code.split("").join(" ")}`}>{code}</p>
          <p className="flex items-center gap-1 text-center text-xs text-muted-foreground">Send this to your guest <InfoTip text={getTooltip("visitors.pass")} /></p>
          <div className="flex w-full gap-2">
            <Button className="flex-1" onClick={share}><Share2 className="size-4" /> Share</Button>
            <Button variant="outline" className="flex-1" onClick={copy}>{copied ? <><Check className="size-4" /> Copied</> : <><Copy className="size-4" /> Copy</>}</Button>
          </div>
          {onRevoke && <button type="button" onClick={onRevoke} className="text-xs text-danger underline-offset-4 hover:underline">Cancel this pass</button>}
        </div>
      )}
    </article>
  );
}
