"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { registryApi } from "../api/EstateCoreApi";
import type { EstateInput, HouseInput, HouseUpdate, PageQuery } from "../types";
import { qk } from "./queryKeys";
import { useMutationWithToast } from "./useMutationWithToast";

export function useEstates(params: PageQuery & { status?: string }) {
  return useQuery({ queryKey: qk.estates(params), queryFn: () => registryApi.listEstates(params), placeholderData: keepPreviousData });
}

export function useEstateSummary(id: string) {
  return useQuery({ queryKey: qk.estateSummary(id), queryFn: () => registryApi.estateSummary(id) });
}

export function useCreateEstate(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: EstateInput) => registryApi.createEstate(body),
    success: (estate) => `${estate.name} created`,
    onSuccess: onDone,
  });
}

export function useUpdateEstate(id: string, onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: Partial<EstateInput> & { status?: string }) => registryApi.updateEstate(id, body),
    success: "Estate updated",
    onSuccess: onDone,
  });
}

export function useHouses(params: PageQuery & { estate_id?: string; status?: string }, enabled = true) {
  return useQuery({ queryKey: qk.houses(params), queryFn: () => registryApi.listHouses(params), placeholderData: keepPreviousData, enabled });
}

export function useHouse(id: string) {
  return useQuery({ queryKey: qk.house(id), queryFn: () => registryApi.getHouse(id) });
}

export function useHouseOccupancies(id: string) {
  return useQuery({ queryKey: qk.houseOccupancies(id), queryFn: () => registryApi.houseOccupancies(id) });
}

export function useCreateHouse(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (body: HouseInput) => registryApi.createHouse(body),
    success: (house) => `House ${house.identifier} added`,
    onSuccess: onDone,
  });
}

export function useUpdateHouse(id: string, onDone?: () => void) {
  return useMutationWithToast({ mutationFn: (body: HouseUpdate) => registryApi.updateHouse(id, body), success: "House updated", onSuccess: onDone });
}

export function useHouseLifecycle(id: string, onDone?: () => void) {
  return {
    deactivate: useMutationWithToast({ mutationFn: (reason: string) => registryApi.deactivateHouse(id, reason), success: "House deactivated", onSuccess: onDone }),
    reactivate: useMutationWithToast({ mutationFn: () => registryApi.reactivateHouse(id), success: "House reactivated", onSuccess: onDone }),
    remove: useMutationWithToast({ mutationFn: () => registryApi.deleteHouse(id), success: "House deleted", onSuccess: onDone }),
  };
}
