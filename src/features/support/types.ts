/** Mirrors backend app/contracts/support.py. */

export type TicketStatus = "open" | "acknowledged" | "in_progress" | "awaiting_resident" | "resolved" | "closed";
export type Priority = "low" | "normal" | "high" | "urgent";
export type NoticeScope = "general" | "estate" | "house";
export type Severity = "informational" | "important" | "urgent";

export type Category = { id: string; name: string; description: string | null; status: "active" | "inactive" };
export type Attachment = { id: string; filename: string; content_type: string; size_bytes: number; is_internal: boolean; url: string | null; created_at: string };

export type TicketEvent = {
  id: string;
  kind: "created" | "response" | "internal_note" | "status_changed" | "attachment";
  body: string | null;
  from_status: TicketStatus | null;
  to_status: TicketStatus | null;
  is_internal: boolean;
  actor_name: string | null;
  actor_is_staff: boolean;
  created_at: string;
};

export type Ticket = {
  id: string;
  reference: string;
  subject: string;
  description: string;
  status: TicketStatus;
  priority: Priority;
  category_id: string;
  category_name: string | null;
  house_id: string;
  house_identifier: string | null;
  estate_id: string;
  estate_name: string | null;
  resident_id: string;
  resident_name: string | null;
  last_activity_at: string;
  resolved_at: string | null;
  created_at: string;
};
export type TicketDetail = Ticket & { events: TicketEvent[]; attachments: Attachment[] };

export type Notice = {
  id: string;
  title: string;
  body: string;
  scope: NoticeScope;
  estate_id: string | null;
  estate_name: string | null;
  house_id: string | null;
  house_identifier: string | null;
  severity: Severity;
  status: "draft" | "published" | "archived";
  publish_at: string | null;
  expires_at: string | null;
  created_at: string;
  attachments: Attachment[];
};
export type NoticeInput = {
  title: string;
  body: string;
  scope: NoticeScope;
  estate_id?: string | null;
  house_id?: string | null;
  severity: Severity;
  publish_at?: string | null;
  expires_at?: string | null;
  publish_now: boolean;
};

export type AppNotification = { id: string; kind: string; title: string; body: string | null; link: string | null; read_at: string | null; created_at: string };

export const TICKET_STATUS_WORDS: Record<TicketStatus, string> = {
  open: "Open",
  acknowledged: "Seen by the team",
  in_progress: "Being worked on",
  awaiting_resident: "Waiting for your reply",
  resolved: "Resolved",
  closed: "Closed",
};
