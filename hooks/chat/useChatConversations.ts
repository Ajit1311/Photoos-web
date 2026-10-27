"use client";

import { useQuery } from "@tanstack/react-query";

import { getMyChatConversations } from "@/lib/api/chat";

export const CHAT_CONVERSATIONS_QUERY_KEY = [
  "chat",
  "conversations",
] as const;

export function useChatConversations() {
  const query = useQuery({
    queryKey: CHAT_CONVERSATIONS_QUERY_KEY,

    queryFn: getMyChatConversations,

    staleTime: 1000 * 30,

    gcTime: 1000 * 60 * 10,

    refetchOnWindowFocus: true,

    refetchInterval: false,
  });

  return {
    conversations: query.data ?? [],

    loading: query.isPending,

    refreshing: query.isFetching,

    error: query.error ?? null,

    refresh: query.refetch,
  };
}