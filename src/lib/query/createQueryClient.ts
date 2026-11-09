import { QueryClient } from "@tanstack/react-query";

/** Shared TanStack Query defaults: cache for a minute, retry transient failures twice. */
export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        gcTime: 5 * 60_000,
        retry: 2,
        refetchOnWindowFocus: false,
      },
      mutations: { retry: 0 },
    },
  });
}
