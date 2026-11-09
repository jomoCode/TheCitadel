"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { usePropertyFilters } from "@/features/marketing/context/PropertyFiltersContext";
import { FilterFields, SearchField } from "./FilterFields";

/** Phone pattern: search field + a "Filters" button that opens a bottom sheet. */
export function MobileFilterSheet() {
  const { activeCount, results, reset } = usePropertyFilters();

  return (
    <div className="flex gap-2">
      <SearchField className="flex-1" />
      <Dialog.Root>
        <Dialog.Trigger className="relative inline-flex h-12 items-center gap-2 rounded-brand border border-border bg-surface px-4 text-sm">
          <SlidersHorizontal className="size-4" aria-hidden /> Filters
          {activeCount > 0 && (
            <span className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-gold text-[0.65rem] text-[#140e0c]">{activeCount}</span>
          )}
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" />
          <Dialog.Content className="safe-bottom fixed inset-x-0 bottom-0 z-50 max-h-[85svh] overflow-y-auto rounded-t-2xl bg-background px-5 pt-3 focus:outline-none">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-border" aria-hidden />
            <Dialog.Title className="font-display text-2xl">Filter homes</Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">Narrow the list to what suits you.</Dialog.Description>
            <div className="mt-6">
              <FilterFields layout="stack" />
            </div>
            <div className="sticky bottom-0 -mx-5 mt-8 flex gap-3 border-t border-border bg-background px-5 py-4">
              <Button variant="outline" className="flex-1" onClick={reset}>Clear</Button>
              <Dialog.Close asChild>
                <Button className="flex-2">Show {results.length} {results.length === 1 ? "home" : "homes"}</Button>
              </Dialog.Close>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
