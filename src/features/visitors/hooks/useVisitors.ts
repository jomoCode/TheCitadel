"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { gateApi, residentVisitorsApi, visitorsAdminApi } from "../api/VisitorsApi";
import type { InvitationInput } from "../types";

const VISITORS = [["visitors"], ["gate"], ["notifications"]] as const;

// ── Resident ──────────────────────────────────────────────────────────────
export const useMyPasses = (q: PageQuery & { status?: string }) =>
  useQuery({ queryKey: ["visitors", "passes", q], queryFn: () => residentVisitorsApi.invitations(q), placeholderData: keepPreviousData });
export const useMyVisits = (q: PageQuery) => useQuery({ queryKey: ["visitors", "visits", q], queryFn: () => residentVisitorsApi.visits(q) });
/** Polled every 10 s too, so a visitor waiting at the gate is never left standing if realtime drops. */
export const useMyGateRequests = () =>
  useQuery({ queryKey: ["visitors", "gate-requests"], queryFn: residentVisitorsApi.gateRequests, refetchInterval: 10_000 });

export function useResidentVisitorActions(onInvited?: () => void) {
  return {
    invite: useMutationWithToast({ mutationFn: (body: InvitationInput) => residentVisitorsApi.invite(body), success: (p) => `Pass ready for ${p.visitor_name}`, invalidate: VISITORS, onSuccess: onInvited }),
    revoke: useMutationWithToast({ mutationFn: (id: string) => residentVisitorsApi.revoke(id), success: "Pass cancelled", invalidate: VISITORS }),
    decide: useMutationWithToast({
      mutationFn: (b: { id: string; approve: boolean }) => residentVisitorsApi.decide(b.id, b.approve),
      success: (r) => (r.status === "approved" ? `Security will let ${r.visitor_name} in` : `Security has been told not to let ${r.visitor_name} in`),
      invalidate: VISITORS,
    }),
  };
}

// ── Gate ──────────────────────────────────────────────────────────────────
export const useGateHouses = () => useQuery({ queryKey: ["gate", "houses"], queryFn: gateApi.houses, staleTime: 10 * 60_000 });
export const useInsideNow = () => useQuery({ queryKey: ["gate", "inside"], queryFn: gateApi.inside, refetchInterval: 30_000 });
export const useRecentVisits = () => useQuery({ queryKey: ["gate", "recent"], queryFn: () => gateApi.recent({ page_size: 50 }) });
/** While a gate request is pending, re-check every 3 s for the resident's answer. */
export const useWalkinStatus = (id: string | null) =>
  useQuery({ queryKey: ["gate", "walkin", id], queryFn: () => gateApi.walkin(id!), enabled: Boolean(id),
    refetchInterval: (q) => (q.state.data?.status === "pending" ? 3_000 : false) });

export function useGateActions() {
  return {
    admit: useMutationWithToast({ mutationFn: (invitationId: string) => gateApi.admit(invitationId), success: (v) => `${v.visitor_name} checked in`, invalidate: VISITORS }),
    registerWalkin: useMutationWithToast({ mutationFn: gateApi.registerWalkin, success: (r) => (r.status === "pending" ? "Request sent to the household" : "Approved — you can let them in"), invalidate: VISITORS }),
    admitWalkin: useMutationWithToast({ mutationFn: (id: string) => gateApi.admitWalkin(id), success: (v) => `${v.visitor_name} checked in`, invalidate: VISITORS }),
    override: useMutationWithToast({ mutationFn: (b: { id: string; reason: string }) => gateApi.override(b.id, b.reason), success: "Let in — override recorded", invalidate: VISITORS }),
    exit: useMutationWithToast({ mutationFn: (visitId: string) => gateApi.exit(visitId), success: (v) => `${v.visitor_name} checked out`, invalidate: VISITORS }),
  };
}

// ── Admin ─────────────────────────────────────────────────────────────────
export const useVisitorDashboard = (estateId?: string) =>
  useQuery({ queryKey: ["visitors", "dashboard", estateId], queryFn: () => visitorsAdminApi.dashboard(estateId), refetchInterval: 60_000 });
export const useAdminVisits = (q: PageQuery & { estate_id?: string; status?: string; method?: string; house_id?: string }) =>
  useQuery({ queryKey: ["visitors", "admin-visits", q], queryFn: () => visitorsAdminApi.visits(q), placeholderData: keepPreviousData });
export const useAdminPasses = (q: PageQuery & { estate_id?: string; status?: string }) =>
  useQuery({ queryKey: ["visitors", "admin-passes", q], queryFn: () => visitorsAdminApi.invitations(q), placeholderData: keepPreviousData });
export const useAdminGateRequests = (q: { estate_id?: string; status?: string }) =>
  useQuery({ queryKey: ["visitors", "admin-gate-requests", q], queryFn: () => visitorsAdminApi.gateRequests(q), refetchInterval: 30_000 });
export const useEstateVisitorSettings = (estateId: string) =>
  useQuery({ queryKey: ["visitors", "settings", estateId], queryFn: () => visitorsAdminApi.settings(estateId) });
export const useSecurityAssignments = () => useQuery({ queryKey: ["visitors", "assignments"], queryFn: visitorsAdminApi.assignments });

export function useVisitorAdminActions() {
  return {
    updateSettings: useMutationWithToast({
      mutationFn: (b: { estateId: string; invite_requires_approval?: boolean; walkin_requires_approval?: boolean }) =>
        visitorsAdminApi.updateSettings(b.estateId, { invite_requires_approval: b.invite_requires_approval, walkin_requires_approval: b.walkin_requires_approval }),
      success: "Visitor rules saved", invalidate: VISITORS,
    }),
    assign: useMutationWithToast({ mutationFn: (b: { userId: string; estateId: string }) => visitorsAdminApi.assign(b.userId, b.estateId), success: "Gate officer assigned", invalidate: VISITORS }),
    revoke: useMutationWithToast({ mutationFn: (b: { id: string; reason: string }) => visitorsAdminApi.revoke(b.id, b.reason), success: "Pass cancelled", invalidate: VISITORS }),
  };
}
