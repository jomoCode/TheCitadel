"use client";

import { useQuery } from "@tanstack/react-query";
import { adminApi } from "@/features/estate-core/api/EstateCoreApi";
import { qk } from "@/features/estate-core/hooks/queryKeys";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";

export function useResidentHome() {
  return useQuery({ queryKey: qk.residentHome, queryFn: adminApi.residentHome });
}

export function useUpdateOwnPhone(onDone?: () => void) {
  return useMutationWithToast({
    mutationFn: (phone: string) => adminApi.updateOwnPhone(phone),
    success: "Phone number saved",
    invalidate: [qk.residentHome],
    onSuccess: onDone,
  });
}
