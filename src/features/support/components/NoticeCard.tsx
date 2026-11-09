import { AlertOctagon, Info, Megaphone } from "lucide-react";
import { cn } from "@/lib/utils/cn";
import type { Notice } from "../types";
import { AttachmentList } from "./Attachments";

const SEVERITY = {
  urgent: { icon: AlertOctagon, label: "Urgent", tone: "border-danger/40 bg-danger/5", badge: "bg-danger text-white" },
  important: { icon: Megaphone, label: "Important", tone: "border-gold/40 bg-gold-soft", badge: "bg-gold text-[#140e0c]" },
  informational: { icon: Info, label: "For your information", tone: "border-border bg-surface", badge: "bg-surface-muted text-muted-foreground" },
};

export function NoticeCard({ notice, openAttachment, compact }: { notice: Notice; openAttachment: (id: string) => Promise<{ url: string }>; compact?: boolean }) {
  const s = SEVERITY[notice.severity];
  return (
    <article id={notice.id} className={cn("scroll-mt-20 rounded-2xl border p-5", s.tone)}>
      <div className="flex items-start gap-3">
        <s.icon className="mt-0.5 size-5 shrink-0 text-gold" aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className={cn("rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase tracking-wider", s.badge)}>{s.label}</span>
            <span className="text-xs text-muted-foreground">
              {notice.scope === "general" ? "All residents" : notice.scope === "estate" ? notice.estate_name : `House ${notice.house_identifier}`}
              {notice.publish_at && ` · ${new Date(notice.publish_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}`}
            </span>
          </div>
          <h3 className="mt-2 font-display text-xl">{notice.title}</h3>
          <p className={cn("mt-1 whitespace-pre-wrap text-sm text-muted-foreground", compact && "line-clamp-3")}>{notice.body}</p>
          {!compact && <div className="mt-3"><AttachmentList items={notice.attachments} open={openAttachment} /></div>}
        </div>
      </div>
    </article>
  );
}
