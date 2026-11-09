"use client";

import { useRouter } from "next/navigation";
import { Sheet } from "@/components/ui/Sheet";
import { useListingActions } from "../hooks/useWebsite";
import { ListingForm } from "./ListingForm";

/** Step 1 of a new listing: the essentials. It starts hidden; photos and the write-up are added on the next screen. */
export function NewListingSheet({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const { create } = useListingActions();
  return (
    <Sheet open={open} onOpenChange={onOpenChange} title="New listing" description="Start with the basics. You'll add photos and a description next — it stays hidden until you make it live.">
      {open && (
        <ListingForm full={false} pending={create.isPending} submitLabel="Create listing"
          onSubmit={(input) => create.mutate(input, { onSuccess: (l) => { onOpenChange(false); router.push(`/admin/properties/${l.id}`); } })} />
      )}
    </Sheet>
  );
}
