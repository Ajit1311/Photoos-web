"use client";

import {
  MessageCircle,
  Send,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  toast,
} from "sonner";

import {
  useChatConversations,
} from "@/hooks/chat/useChatConversations";

import {
  useClient,
} from "@/hooks/useClient";

import {
  startClientChatConversation,
} from "@/lib/api/chat";

import type {
  ChatConversation,
} from "@/types/chat";

import ChatConversationPanel from "@/components/chat/ChatConversationPanel";

interface EventChatWorkspaceProps {
  clientId: string | null;
}

export default function EventChatWorkspace({
  clientId,
}: EventChatWorkspaceProps) {
  const {
    conversations,
    loading,
    error,
    refresh:
      refreshConversations,
  } =
    useChatConversations();

  const {
    data: client,
    isLoading:
      clientLoading,
    error:
      clientError,
  } =
    useClient(
      clientId ?? "",
    );

  const [
    startedConversation,
    setStartedConversation,
  ] =
    useState<ChatConversation | null>(
      null,
    );

  const [
    startingChat,
    setStartingChat,
  ] =
    useState(false);

  async function handleStartMessage() {
    if (
      !clientId ||
      startingChat
    ) {
      return;
    }

    setStartingChat(true);

    try {
      /*
       * Start or resume the client
       * conversation through the
       * canonical backend RPC.
       */
      const conversationId =
        await startClientChatConversation(
          clientId,
          client?.display_name,
        );

      const now =
        new Date().toISOString();

      const newConversation: ChatConversation =
        {
          id:
            conversationId,

          type:
            "client",

          title:
            client?.display_name ??
            "Client Conversation",

          metadata: {
            client_id:
              clientId,

            client_name:
              client?.display_name ??
              "Client Conversation",

            source:
              "event_chat_start",
          },

          created_at:
            now,

          updated_at:
            now,

          client_id:
            clientId,

          project_id:
            null,

          album_id:
            null,

          unread_count:
            0,
        };

      /*
       * Open the chat immediately.
       * Refresh runs only as background
       * synchronization.
       */
      setStartedConversation(
        newConversation,
      );

      void refreshConversations();

      toast.success(
        "Chat opened successfully.",
        {
          position:
            "top-center",
        },
      );
    } catch (error) {
      console.error(
        "EVENT START CHAT ERROR",
        error,
      );

      const message =
        error instanceof Error
          ? error.message
          : "Unable to start client chat.";

      /*
       * Never use window.alert here.
       *
       * All user-facing errors go through
       * the application toast.
       */
      toast.error(
        message,
        {
          position:
            "top-center",
        },
      );
    } finally {
      setStartingChat(
        false,
      );
    }
  }

  /*
   * No client is assigned to this event.
   */
  if (!clientId) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <MessageCircle className="h-8 w-8 text-[#0A3F61]" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No client assigned
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This event does not have a client
            assigned yet, so a client chat
            cannot be opened.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Client is loading.
   */
  if (
    clientLoading ||
    loading
  ) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-slate-200 border-t-[#0A3F61]" />

          <p className="mt-4 text-sm text-slate-500">
            Loading client chat...
          </p>
        </div>
      </div>
    );
  }

  /*
   * Client loading error.
   *
   * Do not render browser alerts.
   * Show the error through toast.
   */
  if (clientError) {
    const message =
      clientError instanceof Error
        ? clientError.message
        : "Unable to load client.";

    toast.error(
      message,
      {
        position:
          "top-center",
      },
    );

    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-red-200 bg-white">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <MessageCircle className="h-8 w-8 text-red-500" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Unable to load client
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            The client information could not
            be loaded.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Existing client conversation.
   *
   * If Start Message created a conversation
   * locally, use that immediately.
   *
   * Otherwise find the existing conversation
   * from the shared chat list.
   */
  const conversation =
    startedConversation ??
    conversations.find(
      (item) =>
        item.client_id ===
          clientId &&
        item.type ===
          "client",
    ) ??
    null;

  /*
   * No conversation yet.
   */
  if (!conversation) {
    return (
      <div className="flex min-h-[520px] items-center justify-center rounded-2xl border border-slate-200 bg-white">
        <div className="max-w-sm px-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <MessageCircle className="h-8 w-8 text-[#0A3F61]" />
          </div>

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            No client conversation
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            No chat conversation exists for
            this client yet.
          </p>

          <button
            type="button"
            onClick={() =>
              void handleStartMessage()
            }
            disabled={
              startingChat
            }
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Send className="h-4 w-4" />

            {startingChat
              ? "Starting..."
              : "Start Message"}
          </button>
        </div>
      </div>
    );
  }

  /*
   * Existing or newly created conversation.
   */
  return (
    <div className="min-h-[520px] overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <ChatConversationPanel
        conversation={
          conversation
        }
        onBack={() =>
          setStartedConversation(
            null,
          )
        }
      />
    </div>
  );
}