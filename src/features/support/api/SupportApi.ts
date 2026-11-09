import type { Page, PageQuery } from "@/features/estate-core/types";
import { apiClient, type ApiClient } from "@/lib/api/ApiClient";
import type { AppNotification, Attachment, Category, Notice, NoticeInput, Ticket, TicketDetail } from "../types";

type TicketQuery = PageQuery & { status?: string; category_id?: string; estate_id?: string; priority?: string };

/** Resident: own requests, notices and file links. */
export class ResidentSupportApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  categories = () => this.api.get<Category[]>("/resident/maintenance-categories");
  tickets = (q: TicketQuery) => this.api.get<Page<Ticket>>("/resident/tickets", q);
  ticket = (id: string) => this.api.get<TicketDetail>(`/resident/tickets/${id}`);
  create = (body: { category_id: string; subject: string; description: string; house_id?: string }) => this.api.post<TicketDetail>("/resident/tickets", body);
  reply = (id: string, body: string) => this.api.post<TicketDetail>(`/resident/tickets/${id}/messages`, { body });
  confirm = (id: string) => this.api.post<TicketDetail>(`/resident/tickets/${id}/confirm`);
  reopen = (id: string) => this.api.post<TicketDetail>(`/resident/tickets/${id}/reopen`);
  upload = (id: string, file: File) => this.api.upload<Attachment>(`/resident/tickets/${id}/attachments`, file);
  attachmentLink = (id: string) => this.api.get<{ url: string; filename: string }>(`/resident/attachments/${id}`);
  notices = () => this.api.get<Notice[]>("/resident/notices");
}

/** Staff: support queue, categories and notices. */
export class AdminSupportApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  categories = () => this.api.get<Category[]>("/admin/maintenance-categories");
  createCategory = (body: { name: string; description?: string }) => this.api.post<Category>("/admin/maintenance-categories", body);
  updateCategory = (id: string, body: Partial<Category>) => this.api.patch<Category>(`/admin/maintenance-categories/${id}`, body);
  tickets = (q: TicketQuery) => this.api.get<Page<Ticket>>("/admin/tickets", q);
  ticket = (id: string) => this.api.get<TicketDetail>(`/admin/tickets/${id}`);
  message = (id: string, body: { body: string; internal: boolean; status?: string }) => this.api.post<TicketDetail>(`/admin/tickets/${id}/messages`, body);
  update = (id: string, body: { status?: string; priority?: string; category_id?: string; note?: string }) => this.api.patch<TicketDetail>(`/admin/tickets/${id}`, body);
  upload = (id: string, file: File, internal: boolean) => this.api.upload<Attachment>(`/admin/tickets/${id}/attachments`, file, { internal: String(internal) });
  attachmentLink = (id: string) => this.api.get<{ url: string; filename: string }>(`/admin/attachments/${id}`);

  notices = (q: PageQuery & { status?: string }) => this.api.get<Page<Notice>>("/admin/notices", q);
  createNotice = (body: NoticeInput) => this.api.post<Notice>("/admin/notices", body);
  publishNotice = (id: string) => this.api.post<Notice>(`/admin/notices/${id}/publish`);
  archiveNotice = (id: string) => this.api.post<Notice>(`/admin/notices/${id}/archive`);
  uploadNoticeFile = (id: string, file: File) => this.api.upload<Attachment>(`/admin/notices/${id}/attachments`, file);
}

/** Everyone signed in: the notification inbox. */
export class NotificationsApi {
  constructor(private readonly api: ApiClient = apiClient) {}

  list = (q: PageQuery & { unread_only?: boolean }) => this.api.get<Page<AppNotification>>("/notifications", q);
  unread = () => this.api.get<{ unread: number }>("/notifications/unread-count");
  markRead = (ids?: string[]) => this.api.post<{ unread: number }>("/notifications/read", { ids: ids ?? null });
}

export const residentSupportApi = new ResidentSupportApi();
export const adminSupportApi = new AdminSupportApi();
export const notificationsApi = new NotificationsApi();
