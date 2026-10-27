"use client";

import { useQuery } from "@tanstack/react-query";

import {
  getChatMessages,
  getChatConversationDetails,
} from "@/lib/api/chat";

export function useChatMessages(
  conversationId: string | null,
) {
  const detailsQuery = useQuery({
    queryKey: [
      "chat",
      "conversation",
      conversationId,
      "details",
    ],

    queryFn: () =>
      getChatConversationDetails(
        conversationId as string,
      ),

    enabled: Boolean(conversationId),

    staleTime: 1000 * 30,

    gcTime: 1000 * 60 * 10,
  });

  const messagesQuery = useQuery({
    queryKey: [
      "chat",
      "conversation",
      conversationId,
      "messages",
    ],

    queryFn: () =>
      getChatMessages(
        conversationId as string,
        {
          limit: 50,
          before: null,
        },
      ),

    enabled: Boolean(conversationId),

    staleTime: 1000 * 30,

    gcTime: 1000 * 60 * 10,

    refetchOnWindowFocus: true,
  });

  return {
    conversation:
      detailsQuery.data ?? null,

    messages:
      messagesQuery.data ?? [],

    loading:
      detailsQuery.isPending ||
      messagesQuery.isPending,

    refreshing:
      messagesQuery.isFetching,

    error:
      messagesQuery.error ??
      null,

    detailsError:
      detailsQuery.error ??
      null,

    refresh: messagesQuery.refetch,
  };
}