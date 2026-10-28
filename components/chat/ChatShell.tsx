"use client";

import {
  Plus,
  MessageCircle,
  Search
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  ClientDto,
} from "@/types/api/client";

import type {
  ChatConversation,
} from "@/types/chat";

import {
  useClients,
} from "@/hooks/useClients";

import {
  useChatConversations,
} from "@/hooks/chat/useChatConversations";

import {
  startClientChatConversation,
} from "@/lib/api/chat";

import ChatConversationList from "./ChatConversationList";
import ChatConversationPanel from "./ChatConversationPanel";
import ChatNewConversationDialog from "./ChatNewConversationDialog";
import { useTeamMembers } from "@/hooks/useTeamMembers";

function createLocalConversation(
  client: ClientDto,
  conversationId: string,
): ChatConversation {
  const now =
    new Date().toISOString();

  return {
    id: conversationId,
    type: "client",
    title: client.display_name,

    metadata: {
      client_id: client.id,
      client_name:
        client.display_name,
      source: "chat_start",
    },

    created_at: now,
    updated_at: now,

    client_id: client.id,
    project_id: null,
    album_id: null,
    unread_count: 0,
  };
}

export default function ChatShell() {
  const [
    selectedConversation,
    setSelectedConversation,
  ] =
    useState<ChatConversation | null>(
      null,
    );

  const [newConversationOpen, setNewConversationOpen] = useState(false);

  const [
    clientSearch,
    setClientSearch,
  ] =
    useState("");

  const [
    startingClientId,
    setStartingClientId,
  ] =
    useState<string | null>(
      null,
    );

  const [
    locallyStartedConversations,
    setLocallyStartedConversations,
  ] =
    useState<ChatConversation[]>(
      [],
    );

  const teamMembersQuery =
    useTeamMembers();

  const {
    conversations,
    loading:
      conversationsLoading,
    refresh:
      refreshConversations,
  } =
    useChatConversations();

  const {
    clients,
    loading:
      clientsLoading,
    error:
      clientsError,
  } =
    useClients({
      page: 1,
      limit: 100,
      search: clientSearch,
      allPages: true,
    });

  /*
   * Notification deep-link:
   * /dashboard/chat?open=photoos-team
   *
   * The PhotoOS Team welcome conversation is a system/direct
   * conversation, not a client conversation, so it must be
   * selected directly from the loaded conversation collection.
   */
  useEffect(() => {
    const params =
      new URLSearchParams(
        window.location.search,
      );

    if (
      params.get("open") !==
      "photoos-team"
    ) {
      return;
    }

    const photoosTeamConversation =
      conversations.find(
        (conversation) =>
          conversation.type ===
            "direct" &&
          conversation.title ===
            "PhotoOS Team",
      );

    if (!photoosTeamConversation) {
      return;
    }

    setSelectedConversation(
      photoosTeamConversation,
    );

    params.delete("open");

    const nextQuery =
      params.toString();

    const nextUrl =
      nextQuery
        ? `${window.location.pathname}?${nextQuery}`
        : window.location.pathname;

    window.history.replaceState(
      null,
      "",
      nextUrl,
    );
  }, [conversations]);

  /*
   * Generic notification deep-link:
   * /dashboard/chat?open=<conversation-id>
   */
  useEffect(() => {

    const params =
      new URLSearchParams(
        window.location.search,
      );


    const openConversationId =
      params.get("open");


    if (
      !openConversationId ||
      openConversationId ===
        "photoos-team"
    ) {

      return;

    }


    const targetConversation =
      conversations.find(
        (
          conversation,
        ) =>
          conversation.id ===
          openConversationId,
      );


    if (
      !targetConversation
    ) {

      return;

    }


    setSelectedConversation(
      targetConversation,
    );


    params.delete(
      "open",
    );


    const nextQuery =
      params.toString();


    const nextUrl =
      nextQuery
        ? `${window.location.pathname}?${nextQuery}`
        : window.location.pathname;


    window.history.replaceState(
      null,
      "",
      nextUrl,
    );

  }, [conversations]);


  const displayedConversations =
    useMemo(() => {
      const merged = [
        ...locallyStartedConversations,
        ...conversations,
      ];

      return Array.from(
        new Map(
          merged.map(
            (conversation) => [
              conversation.id,
              conversation,
            ],
          ),
        ).values(),
      );
    }, [
      locallyStartedConversations,
      conversations,
    ]);

  async function handleSelectClient(
    client: ClientDto,
  ) {
    const existingConversation =
      displayedConversations.find(
        (conversation) =>
          conversation.type ===
            "client" &&
          conversation.client_id ===
            client.id,
      );

    /*
     * Existing chat:
     * Just switch to it.
     */
    if (existingConversation) {
      setSelectedConversation(
        existingConversation,
      );

      return;
    }

    /*
     * Prevent multiple conversation
     * creation requests at the same time.
     */
    if (startingClientId) {
      return;
    }

    setStartingClientId(
      client.id,
    );

    try {
      const conversationId =
        await startClientChatConversation(
          client.id,
        );

      const newConversation =
        createLocalConversation(
          client,
          conversationId,
        );

      /*
       * Add immediately to local state.
       * This means the user does not have
       * to wait for refresh.
       */
      setLocallyStartedConversations(
        (current) => [
          newConversation,
          ...current.filter(
            (conversation) =>
              conversation.id !==
              newConversation.id,
          ),
        ],
      );

      setSelectedConversation(
        newConversation,
      );

      void refreshConversations();
    } catch (error) {
      console.error(
        "START CLIENT CHAT ERROR:",
        error,
      );

      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to start client chat.",
      );
    } finally {
      setStartingClientId(
        null,
      );
    }
  }

  return (
    <div className="flex h-[calc(100vh-0px)] min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ================================================================
          CLIENT SIDEBAR
         ================================================================ */}

      <aside
        className={`flex w-full shrink-0 flex-col border-r border-slate-200 bg-white lg:w-[380px] ${
          selectedConversation
            ? "hidden lg:flex"
            : "flex"
        }`}
      >
        <div className="border-b border-slate-200 px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-slate-900">
                Chats
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                All clients
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
              <MessageCircle className="h-5 w-5 text-[#0A3F61]" />
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-100 px-3 py-2.5">
            <Search className="h-4 w-4 text-slate-400" />

            <input
              type="search"
              value={clientSearch}
              onChange={(event) =>
                setClientSearch(
                  event.target.value,
                )
              }
              placeholder="Search clients..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <>
            {clientsError && (
              <div className="border-b border-amber-100 bg-amber-50 px-4 py-2 text-xs text-amber-700">
                Client directory is temporarily unavailable. Existing conversations remain available.
              </div>
            )}

            <ChatConversationList
              clients={clients}
              conversations={
                displayedConversations
              }
              selectedConversationId={
                selectedConversation?.id ??
                null
              }
              loading={
                conversationsLoading && displayedConversations.length === 0
              }
              startingClientId={
                startingClientId
              }
              onSelectClient={
                handleSelectClient
              }
              onSelectConversation={
                setSelectedConversation
              }
            />
          </>
        </div>

        <button
          type="button"
          onClick={() =>
            setNewConversationOpen(true)
          }
          className="absolute bottom-5 right-5 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-[#0A3F61] text-white shadow-xl transition hover:scale-105 hover:bg-[#08334f]"
          title="New conversation"
        >
          <Plus className="h-6 w-6" />
        </button>
      </aside>

      {/* ================================================================
          CHAT PANEL
         ================================================================ */}

      {selectedConversation ? (
        <ChatConversationPanel
          conversation={
            selectedConversation
          }
          onBack={() =>
            setSelectedConversation(
              null,
            )
          }
        />
      ) : (
        <section className="hidden flex-1 items-center justify-center bg-[#f8fafc] lg:flex">
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <MessageCircle className="h-9 w-9 text-[#0A3F61]" />
            </div>

            <h2 className="mt-5 text-lg font-semibold text-slate-800">
              Select a client
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-500">
              Select any client from the left to start or continue chatting.
            </p>
          </div>
        </section>
      )}
      <ChatNewConversationDialog
        open={newConversationOpen}
        clients={clients}
        teamMembers={(teamMembersQuery as any)?.teamMembers ?? (teamMembersQuery as any)?.members ?? (teamMembersQuery as any)?.data ?? []}
        onClose={() =>
          setNewConversationOpen(false)
        }
        onSelectClient={(client) => {
          setNewConversationOpen(false);
          void handleSelectClient(client);
        }}
        onSelectEmployee={() => {
          setNewConversationOpen(false);
        }}
      />
    </div>
  );
}