"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { enquiriesApi, listingsApi } from "../api/WebsiteApi";
import type { HandledFilter, ListingInput } from "../types";

const LISTINGS = [["listings"]] as const;
const ENQUIRIES = [["enquiries"], ["notifications"]] as const;

// ── Listings ──────────────────────────────────────────────────────────────
export const useListings = (q: PageQuery & { published?: boolean }) =>
  useQuery({ queryKey: ["listings", "list", q], queryFn: () => listingsApi.list(q), placeholderData: keepPreviousData });
export const useListing = (id: string) => useQuery({ queryKey: ["listings", "detail", id], queryFn: () => listingsApi.get(id) });

export function useListingActions(id?: string) {
  return {
    create: useMutationWithToast({ mutationFn: (body: ListingInput) => listingsApi.create(body), success: (l) => `${l.name} created — add photos next`, invalidate: LISTINGS }),
    update: useMutationWithToast({
      mutationFn: (body: ListingInput) => listingsApi.update(id!, body),
      success: (l, body) => ("is_published" in body ? (l.is_published ? "Listing is live on the website" : "Listing hidden from the website") : "Listing saved"),
      invalidate: LISTINGS,
    }),
    addPhoto: useMutationWithToast({ mutationFn: (file: File) => listingsApi.addPhoto(id!, file), success: "Photo added", invalidate: LISTINGS }),
    removePhoto: useMutationWithToast({ mutationFn: (photoId: string) => listingsApi.removePhoto(id!, photoId), success: "Photo removed", invalidate: LISTINGS }),
    reorder: useMutationWithToast({ mutationFn: (ids: string[]) => listingsApi.reorderPhotos(id!, ids), success: "Photo order saved", invalidate: LISTINGS }),
  };
}

// ── Enquiries ─────────────────────────────────────────────────────────────
export const useEnquiries = (q: PageQuery & { handled?: HandledFilter; enquiry_type?: string; property_id?: string }) =>
  useQuery({ queryKey: ["enquiries", "list", q], queryFn: () => enquiriesApi.list(q), placeholderData: keepPreviousData, refetchInterval: 60_000 });
export const useEnquiryCounts = () => useQuery({ queryKey: ["enquiries", "counts"], queryFn: enquiriesApi.counts, refetchInterval: 60_000 });
export const useEnquiry = (id: string) => useQuery({ queryKey: ["enquiries", "detail", id], queryFn: () => enquiriesApi.get(id) });

export function useEnquiryActions(id: string) {
  return {
    setHandled: useMutationWithToast({
      mutationFn: (handled: boolean) => enquiriesApi.setHandled(id, handled),
      success: (e) => (e.handled ? "Marked as handled" : "Moved back to “To handle”"), invalidate: ENQUIRIES,
    }),
    addNote: useMutationWithToast({ mutationFn: (body: string) => enquiriesApi.addNote(id, body), success: "Note saved", invalidate: ENQUIRIES }),
  };
}
