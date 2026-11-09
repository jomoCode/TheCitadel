"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { adminSupportApi, residentSupportApi } from "../api/SupportApi";
import type { NoticeInput } from "../types";

const SUPPORT = [["tickets"], ["ticket"], ["notices"], ["categories"], ["notifications"]] as const;
export const sk = {
  categories: (who: string) => ["categories", who] as const,
  tickets: (who: string, q: object) => ["tickets", who, q] as const,
  ticket: (who: string, id: string) => ["ticket", who, id] as const,
  notices: (who: string, q: object = {}) => ["notices", who, q] as const,
};

// ── Resident ──────────────────────────────────────────────────────────────
export const useResidentCategories = () => useQuery({ queryKey: sk.categories("resident"), queryFn: residentSupportApi.categories, staleTime: 10 * 60_000 });
export const useMyTickets = (q: PageQuery & { status?: string }) =>
  useQuery({ queryKey: sk.tickets("resident", q), queryFn: () => residentSupportApi.tickets(q), placeholderData: keepPreviousData });
export const useMyTicket = (id: string) => useQuery({ queryKey: sk.ticket("resident", id), queryFn: () => residentSupportApi.ticket(id) });
export const useMyNotices = () => useQuery({ queryKey: sk.notices("resident"), queryFn: residentSupportApi.notices });

export function useResidentTicketActions(id: string) {
  return {
    reply: useMutationWithToast({ mutationFn: (body: string) => residentSupportApi.reply(id, body), success: "Message sent", invalidate: SUPPORT }),
    confirm: useMutationWithToast({ mutationFn: () => residentSupportApi.confirm(id), success: "Thanks — request closed", invalidate: SUPPORT }),
    reopen: useMutationWithToast({ mutationFn: () => residentSupportApi.reopen(id), success: "We've reopened your request", invalidate: SUPPORT }),
    upload: useMutationWithToast({ mutationFn: (file: File) => residentSupportApi.upload(id, file), success: "Photo added", invalidate: SUPPORT }),
  };
}

// ── Staff ─────────────────────────────────────────────────────────────────
export const useAdminCategories = () => useQuery({ queryKey: sk.categories("admin"), queryFn: adminSupportApi.categories });
export const useAdminTickets = (q: PageQuery & { status?: string; category_id?: string }) =>
  useQuery({ queryKey: sk.tickets("admin", q), queryFn: () => adminSupportApi.tickets(q), placeholderData: keepPreviousData });
export const useAdminTicket = (id: string) => useQuery({ queryKey: sk.ticket("admin", id), queryFn: () => adminSupportApi.ticket(id) });
export const useAdminNotices = (q: PageQuery & { status?: string }) =>
  useQuery({ queryKey: sk.notices("admin", q), queryFn: () => adminSupportApi.notices(q), placeholderData: keepPreviousData });

export function useStaffTicketActions(id: string) {
  return {
    message: useMutationWithToast({
      mutationFn: (b: { body: string; internal: boolean; status?: string }) => adminSupportApi.message(id, b),
      success: (_d, v) => (v.internal ? "Internal note saved" : "Reply sent to the resident"), invalidate: SUPPORT,
    }),
    update: useMutationWithToast({ mutationFn: (b: { status?: string; priority?: string; note?: string }) => adminSupportApi.update(id, b), success: "Request updated", invalidate: SUPPORT }),
    upload: useMutationWithToast({ mutationFn: (b: { file: File; internal: boolean }) => adminSupportApi.upload(id, b.file, b.internal), success: "File added", invalidate: SUPPORT }),
  };
}

export function useCategoryActions() {
  return {
    create: useMutationWithToast({ mutationFn: (name: string) => adminSupportApi.createCategory({ name }), success: (c) => `${c.name} added`, invalidate: SUPPORT }),
    toggle: useMutationWithToast({
      mutationFn: (c: { id: string; status: "active" | "inactive" }) => adminSupportApi.updateCategory(c.id, { status: c.status }),
      success: "Category saved", invalidate: SUPPORT,
    }),
  };
}

export function useNoticeActions(onDone?: () => void) {
  return {
    create: useMutationWithToast({
      mutationFn: async ({ input, files }: { input: NoticeInput; files: File[] }) => {
        const notice = await adminSupportApi.createNotice(input);
        for (const file of files) await adminSupportApi.uploadNoticeFile(notice.id, file);
        return notice;
      },
      success: (n) => (n.status === "published" ? `“${n.title}” published` : `“${n.title}” saved as a draft`), invalidate: SUPPORT, onSuccess: onDone,
    }),
    publish: useMutationWithToast({ mutationFn: (id: string) => adminSupportApi.publishNotice(id), success: "Notice published", invalidate: SUPPORT }),
    archive: useMutationWithToast({ mutationFn: (id: string) => adminSupportApi.archiveNotice(id), success: "Notice archived", invalidate: SUPPORT }),
  };
}
