"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

/**
 * List screen state (search, page, filters, "new" sheet) kept in the URL,
 * so filters survive refresh/back and links like /admin/houses?status=occupied work.
 */
export function useListState<F extends string>(filterKeys: readonly F[] = []) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const set = useCallback(
    (changes: Record<string, string | number | null>) => {
      const next = new URLSearchParams(params.toString());
      for (const [key, value] of Object.entries(changes)) {
        if (value === null || value === "") next.delete(key);
        else next.set(key, String(value));
      }
      if (!("page" in changes)) next.delete("page");
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const filters = useMemo(
    () => Object.fromEntries(filterKeys.map((k) => [k, params.get(k) ?? ""])) as Record<F, string>,
    [filterKeys, params],
  );

  return {
    q: params.get("q") ?? "",
    page: Number(params.get("page") ?? 1) || 1,
    filters,
    creating: params.get("new") === "1",
    set,
  };
}
