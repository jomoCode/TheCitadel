"use client";

import { useMutation, useQueryClient, type UseMutationOptions } from "@tanstack/react-query";
import { ApiError } from "@/lib/api/ApiClient";
import { useToast } from "@/providers/ToastProvider";
import { ESTATE_CORE_PREFIXES } from "./queryKeys";

type Options<TData, TVars> = {
  mutationFn: (vars: TVars) => Promise<TData>;
  success: string | ((data: TData, vars: TVars) => string);
  onSuccess?: (data: TData, vars: TVars) => void;
  /** Cache prefixes to refresh; defaults to everything in the estate core. */
  invalidate?: readonly (readonly unknown[])[];
} & Omit<UseMutationOptions<TData, unknown, TVars>, "mutationFn" | "onSuccess" | "onError">;

/** Every change in the admin area behaves the same: refresh related lists, show a toast, surface friendly errors. */
export function useMutationWithToast<TData, TVars>({ mutationFn, success, onSuccess, invalidate = ESTATE_CORE_PREFIXES, ...rest }: Options<TData, TVars>) {
  const queryClient = useQueryClient();
  const toast = useToast();
  return useMutation<TData, unknown, TVars>({
    ...rest,
    mutationFn,
    onSuccess: async (data, vars) => {
      await Promise.all(invalidate.map((queryKey) => queryClient.invalidateQueries({ queryKey })));
      toast.success(typeof success === "function" ? success(data, vars) : success);
      onSuccess?.(data, vars);
    },
    onError: (error) => {
      const apiError = error instanceof ApiError ? error : null;
      toast.error(apiError?.message ?? "Something went wrong.", apiError?.correlationId ? `Reference: ${apiError.correlationId}` : undefined);
    },
  });
}
