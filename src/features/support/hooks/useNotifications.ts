"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { getSupabase } from "@/lib/supabase/client";
import { useAuth } from "@/providers/AuthProvider";
import { notificationsApi } from "../api/SupportApi";

export const nk = { unread: ["notifications", "unread"] as const, list: ["notifications", "list"] as const };

/**
 * Unread count + list, kept fresh in real time: Supabase Realtime pushes a signal the moment a new
 * notification row is created for this user (row-level security ensures only their own rows are sent).
 * If Realtime is unavailable, we still refresh every minute.
 */
export function useNotifications() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const unread = useQuery({ queryKey: nk.unread, queryFn: notificationsApi.unread, enabled: Boolean(user), refetchInterval: 60_000 });
  const list = useQuery({ queryKey: nk.list, queryFn: () => notificationsApi.list({ page_size: 30 }), enabled: Boolean(user) });

  useEffect(() => {
    if (!user) return;
    let channel: ReturnType<ReturnType<typeof getSupabase>["channel"]> | null = null;
    try {
      const supabase = getSupabase();
      channel = supabase
        .channel(`notifications:${user.id}`)
        .on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${user.id}` },
          () => queryClient.invalidateQueries({ queryKey: ["notifications"] }))
        .subscribe();
    } catch {
      /* realtime is an enhancement; polling covers us */
    }
    return () => { channel?.unsubscribe(); };
  }, [user, queryClient]);

  const markRead = useMutation({
    mutationFn: (ids?: string[]) => notificationsApi.markRead(ids),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  return { unread: unread.data?.unread ?? 0, items: list.data?.items ?? [], loading: list.isLoading, markRead };
}
