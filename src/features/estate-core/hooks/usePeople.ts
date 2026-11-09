"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { adminApi, peopleApi } from "../api/EstateCoreApi";
import type { PageQuery, ResidentInput, StaffInput } from "../types";
import { qk } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

export function useResidents(params: PageQuery & { estate_id?: string }) {
  return useQuery({ queryKey: qk.residents(params), queryFn: () => peopleApi.listResidents(params), placeholderData: keepPreviousData });
}

export function useResident(id: string) {
  return useQuery({ queryKey: qk.resident(id), queryFn: () => peopleApi.getResident(id) });
}

export function useCreateResident(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: ResidentInput) => peopleApi.createResident(body),
    success: (a, vars) => (vars.temporary_password ? `${a.full_name} added` : `${a.full_name} added — invitation email sent`),
    onSuccess: onDone,
  });
}

/** Every action available on a resident's profile, sharing one cache-refresh + toast behaviour. */
export function useResidentActions(id: string, onDone?: () => void) {
  return {
    update: useMutationWithToast({
      mutationFn: (body: { full_name?: string; phone?: string | null }) => peopleApi.updateResident(id, body),
      success: "Details saved",
      onSuccess: onDone,
    }),
    assign: useMutationWithToast({
      mutationFn: (body: { house_id: string; is_primary: boolean; start_date?: string | null }) => peopleApi.assignHouse(id, body),
      success: (o) => `Assigned to ${o.house_identifier ?? "house"}`,
      onSuccess: onDone,
    }),
    move: useMutationWithToast({
      mutationFn: (body: { from_occupancy_id: string; to_house_id: string; reason: string }) => peopleApi.moveResident(id, body),
      success: (o) => `Moved to ${o.house_identifier ?? "new house"}`,
      onSuccess: onDone,
    }),
    end: useMutationWithToast({
      mutationFn: (body: { occupancyId: string; reason: string }) => peopleApi.endOccupancy(body.occupancyId, { reason: body.reason }),
      success: "Stay ended",
      onSuccess: onDone,
    }),
    setActive: useMutationWithToast({
      mutationFn: (body: { active: boolean; reason: string }) => peopleApi.setActive(id, body.active, body.reason),
      success: (a) => (a.status === "active" ? "Account reactivated" : "Account deactivated"),
      onSuccess: onDone,
    }),
    reset: useMutationWithToast({ mutationFn: () => peopleApi.sendPasswordReset(id), success: "Password reset email sent", invalidate: [] }),
  };
}

export function useStaff(params: PageQuery) {
  return useQuery({ queryKey: qk.staff(params), queryFn: () => peopleApi.listStaff(params), placeholderData: keepPreviousData });
}

export function useCreateStaff(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: StaffInput) => peopleApi.createStaff(body),
    success: (a) => `${a.full_name} added`,
    invalidate: [["staff"], ["roles"]],
    onSuccess: onDone,
  });
}

export function useSetRoles(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: { userId: string; roleIds: string[] }) => peopleApi.setRoles(body.userId, body.roleIds),
    success: "Roles updated",
    invalidate: [["staff"], ["roles"]],
    onSuccess: onDone,
  });
}

export function useRoles(enabled = true) {
  return useQuery({ queryKey: qk.roles, queryFn: adminApi.roles, enabled, staleTime: 5 * 60_000 });
}

export function usePermissionCatalog() {
  return useQuery({ queryKey: qk.permissions, queryFn: adminApi.permissions, staleTime: Infinity });
}

export function useRoleActions(onDone?: () => void) {
  return {
    create: useMutationWithToast({
      mutationFn: (body: { name: string; description?: string; permissions: string[] }) => adminApi.createRole(body),
      success: (r) => `Role "${r.name}" created`,
      invalidate: [["roles"]],
      onSuccess: onDone,
    }),
    update: useMutationWithToast({
      mutationFn: (body: { id: string; name?: string; description?: string; permissions?: string[] }) => adminApi.updateRole(body.id, body),
      success: (r) => `Role "${r.name}" saved`,
      invalidate: [["roles"]],
      onSuccess: onDone,
    }),
    remove: useMutationWithToast({ mutationFn: (id: string) => adminApi.deleteRole(id), success: "Role deleted", invalidate: [["roles"]], onSuccess: onDone }),
  };
}

export function useOverview() {
  return useQuery({ queryKey: qk.overview, queryFn: adminApi.overview });
}

export function useAuditLog(params: PageQuery & { entity_type?: string; entity_id?: string }, enabled = true) {
  return useQuery({ queryKey: qk.audit(params), queryFn: () => adminApi.audit(params), enabled, placeholderData: keepPreviousData });
}
