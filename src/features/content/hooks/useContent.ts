"use client";

import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useMutationWithToast } from "@/features/estate-core/hooks/useMutationWithToast";
import type { PageQuery } from "@/features/estate-core/types";
import { insightsApi, journalApi, siteContentApi } from "../api/ContentApi";
import type { FaqInput, PostInput, PostStatus, SiteSettings, TestimonialInput } from "../types";

const POSTS = [["posts"]] as const;
const SITE = [["site"]] as const;

// ── Journal ───────────────────────────────────────────────────────────────
export const usePosts = (q: PageQuery & { status?: PostStatus }) =>
  useQuery({ queryKey: ["posts", "list", q], queryFn: () => journalApi.list(q), placeholderData: keepPreviousData });
export const usePost = (id: string) => useQuery({ queryKey: ["posts", "detail", id], queryFn: () => journalApi.get(id) });
export const useCategories = () => useQuery({ queryKey: ["posts", "categories"], queryFn: journalApi.categories, staleTime: 5 * 60_000 });

export function usePostActions(id?: string) {
  return {
    create: useMutationWithToast({ mutationFn: (body: PostInput & { title: string }) => journalApi.create(body), success: "Draft created", invalidate: POSTS }),
    save: useMutationWithToast({ mutationFn: (body: PostInput) => journalApi.update(id!, body), success: "Saved", invalidate: POSTS }),
    cover: useMutationWithToast({ mutationFn: (file: File) => journalApi.setCover(id!, file), success: "Cover photo updated", invalidate: POSTS }),
    publish: useMutationWithToast({
      mutationFn: (publishAt: string | null) => journalApi.publish(id!, publishAt),
      success: (p) => (p.status === "scheduled" ? "Scheduled — it goes live automatically" : "Published — live on the website within a minute"), invalidate: POSTS,
    }),
    unpublish: useMutationWithToast({ mutationFn: () => journalApi.unpublish(id!), success: "Taken off the website (now a draft)", invalidate: POSTS }),
    archive: useMutationWithToast({ mutationFn: () => journalApi.archive(id!), success: "Archived", invalidate: POSTS }),
    createCategory: useMutationWithToast({ mutationFn: (name: string) => journalApi.createCategory(name), success: (c) => `Category “${c.name}” added`, invalidate: POSTS }),
  };
}

// ── Site content ──────────────────────────────────────────────────────────
export const useSiteSettingsAdmin = () => useQuery({ queryKey: ["site", "settings"], queryFn: siteContentApi.settings });
export const useFaqs = () => useQuery({ queryKey: ["site", "faqs"], queryFn: siteContentApi.faqs });
export const useTestimonials = () => useQuery({ queryKey: ["site", "testimonials"], queryFn: siteContentApi.testimonials });
export const usePageSeo = () => useQuery({ queryKey: ["site", "pages"], queryFn: siteContentApi.pages });
export const usePageNames = () => useQuery({ queryKey: ["site", "page-names"], queryFn: siteContentApi.pageNames, staleTime: Infinity });

export function useSiteActions() {
  return {
    saveSettings: useMutationWithToast({ mutationFn: (b: Omit<SiteSettings, "updated_at">) => siteContentApi.saveSettings(b), success: "Contact details saved", invalidate: SITE }),
    createFaq: useMutationWithToast({ mutationFn: (b: FaqInput) => siteContentApi.createFaq(b), success: "Question added", invalidate: SITE }),
    updateFaq: useMutationWithToast({ mutationFn: (b: { id: string } & Partial<FaqInput>) => siteContentApi.updateFaq(b.id, b), success: "Question saved", invalidate: SITE }),
    createTestimonial: useMutationWithToast({ mutationFn: (b: TestimonialInput) => siteContentApi.createTestimonial(b), success: "Testimonial added (hidden until you show it)", invalidate: SITE }),
    updateTestimonial: useMutationWithToast({
      mutationFn: (b: { id: string } & Partial<TestimonialInput> & { is_published?: boolean }) => siteContentApi.updateTestimonial(b.id, b),
      success: "Testimonial saved", invalidate: SITE,
    }),
    testimonialPhoto: useMutationWithToast({ mutationFn: (b: { id: string; file: File }) => siteContentApi.testimonialPhoto(b.id, b.file), success: "Photo added", invalidate: SITE }),
    reorder: useMutationWithToast({ mutationFn: (b: { table: "faqs" | "testimonials"; ids: string[] }) => siteContentApi.reorder(b.table, b.ids), success: "Order saved", invalidate: SITE }),
    remove: useMutationWithToast({ mutationFn: (b: { table: "faqs" | "testimonials"; id: string }) => siteContentApi.remove(b.table, b.id), success: "Deleted", invalidate: SITE }),
    savePage: useMutationWithToast({
      mutationFn: (b: { path: string; title: string | null; description: string | null }) => siteContentApi.savePage(b.path, b),
      success: "Search-engine text saved", invalidate: SITE,
    }),
  };
}

// ── Insights ──────────────────────────────────────────────────────────────
export const useInsights = (days: number) =>
  useQuery({ queryKey: ["insights", days], queryFn: () => insightsApi.summary(days), placeholderData: keepPreviousData, staleTime: 60_000 });
