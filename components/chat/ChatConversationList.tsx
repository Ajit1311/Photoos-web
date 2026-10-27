"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  MessageCircle,
} from "lucide-react";

import type {
  ClientDto,
} from "@/types/api/client";

import type {
  ChatConversation,
} from "@/types/chat";

import {
  getClientPresence,
  type ClientPresence,
} from "@/lib/api/clientPresence";

interface ChatConversationListProps {
  clients: ClientDto[];
  conversations: ChatConversation[];
  selectedConversationId: string | null;
  loading: boolean;
  startingClientId: string | null;
  onSelectClient: (
    client: ClientDto,
  ) => void;
  onSelectConversation?: (
    conversation: ChatConversation,
  ) => void;
}

function getInitials(
  name: string,
) {
  return (
    name
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map(
        (part) =>
          part[0]?.toUpperCase() ?? "",
      )
      .join("") || "C"
  );
}

function getPreview(
  conversation: ChatConversation | null,
) {
  if (!conversation) {
    return "Start a conversation";
  }

  const metadata =
    conversation.metadata ?? {};

  if (
    typeof metadata.last_message ===
      "string" &&
    metadata.last_message.trim()
  ) {
    return metadata.last_message;
  }

  return "No messages yet";
}

function getTime(
  conversation: ChatConversation | null,
) {
  if (!conversation) {
    return "";
  }

  const date =
    new Date(
      conversation.updated_at,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleTimeString(
    "en-IN",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

function getConversationClientName(
  conversation: ChatConversation,
  clients: ClientDto[],
) {
  const metadata = conversation.metadata ?? {};

  const metadataName =
    typeof metadata.client_display_name === "string"
      ? metadata.client_display_name.trim()
      : "";

  const client = conversation.client_id
    ? clients.find(
        (item) => item.id === conversation.client_id,
      )
    : null;

  const clientName =
    typeof client?.display_name === "string"
      ? client.display_name.trim()
      : "";

  return metadataName || clientName || "Client";
}

export default function ChatConversationList({
  clients,
  conversations,
  selectedConversationId,
  loading,
  startingClientId,
  onSelectClient,
  onSelectConversation,
}: ChatConversationListProps) {
  const [
    presenceByClientId,
    setPresenceByClientId,
  ] =
    useState<
      Record<
        string,
        ClientPresence
      >
    >({});

  useEffect(() => {
    let cancelled =
      false;

    async function loadPresence() {
      if (
        clients.length === 0
      ) {
        if (!cancelled) {
          setPresenceByClientId(
            {},
          );
        }

        return;
      }

      try {
        const results =
          await Promise.all(
            clients.map(
              async (
                client,
              ) => {
                try {
                  const presence =
                    await getClientPresence(
                      client.id,
                    );

                  return [
                    client.id,
                    presence,
                  ] as const;
                } catch (
                  error
                ) {
                  console.error(
                    "CLIENT PRESENCE LOAD FAILED",
                    {
                      clientId:
                        client.id,
                      error,
                    },
                  );

                  return [
                    client.id,
                    {
                      client_id:
                        client.id,
                      is_online:
                        false,
                      last_seen_at:
                        null,
                    },
                  ] as const;
                }
              },
            ),
          );

        if (cancelled) {
          return;
        }

        const nextPresence:
          Record<
            string,
            ClientPresence
          > =
          {};

        for (
          const [
            clientId,
            presence,
          ] of results
        ) {
          nextPresence[
            clientId
          ] =
            presence;
        }

        setPresenceByClientId(
          nextPresence,
        );
      } catch (
        error
      ) {
        console.error(
          "CLIENT PRESENCE LOAD FAILED",
          error,
        );
      }
    }

    void loadPresence();

    return () => {
      cancelled =
        true;
    };
  }, [
    clients,
  ]);

  if (loading) {
    return (
      <div className="space-y-3 p-4">
        {Array.from({
          length: 8,
        }).map((_, index) => (
          <div
            key={index}
            className="flex gap-3"
          >
            <div className="h-11 w-11 shrink-0 animate-pulse rounded-full bg-slate-200" />

            <div className="min-w-0 flex-1 space-y-2">
              <div className="h-3 w-32 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-44 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  const systemConversations =
    conversations.filter(
      (conversation) =>
        conversation.metadata
          ?.system_conversation ===
          true &&
        conversation.title ===
          "PhotoOS Team",
    );

  /*
   * IMPORTANT:
   *
   * Existing conversations are rendered directly from
   * the conversation collection.
   *
   * Do NOT require the client to exist in the clients
   * API response for an existing conversation to appear.
   */
  const clientConversations =
    conversations.filter(
      (conversation) =>
        conversation.type ===
          "client" &&
        Boolean(
          conversation.client_id,
        ),
    );

  const clientConversationIds =
    new Set(
      clientConversations
        .map(
          (conversation) =>
            conversation.client_id,
        )
        .filter(
          (
            clientId,
          ): clientId is string =>
            Boolean(clientId),
        ),
    );

  const clientsWithoutConversation =
    clients.filter(
      (client) =>
        !clientConversationIds.has(
          client.id,
        ),
    );

  if (
    !systemConversations.length &&
    !clientConversations.length &&
    !clientsWithoutConversation.length
  ) {
    return (
      <div className="flex h-full flex-col items-center justify-center px-6 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
          <MessageCircle className="h-6 w-6 text-slate-400" />
        </div>

        <p className="font-medium text-slate-700">
          No conversations found
        </p>

        <p className="mt-1 text-sm text-slate-400">
          No clients or conversations are available.
        </p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-slate-100">

      {/* ================================================================
          PHOTOOS TEAM
         ================================================================ */}

      {systemConversations.map(
        (conversation) => {
          const active =
            conversation.id ===
            selectedConversationId;

          const unread =
            conversation.unread_count ??
            0;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() =>
                onSelectConversation?.(
                  conversation,
                )
              }
              className={`flex w-full gap-3 px-4 py-3 text-left transition ${
                active
                  ? "bg-slate-100"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0A3F61] text-sm font-semibold text-white">
                PT
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    PhotoOS Team
                  </p>

                  <span className="shrink-0 text-[11px] text-slate-400">
                    {getTime(
                      conversation,
                    )}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">
                    {getPreview(
                      conversation,
                    )}
                  </p>

                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0A3F61] px-1.5 text-[10px] font-bold text-white">
                      {unread > 99
                        ? "99+"
                        : unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        },
      )}

      {/* ================================================================
          EXISTING CLIENT CONVERSATIONS
         ================================================================ */}

      {clientConversations.map(
        (conversation) => {
          const active =
            conversation.id ===
            selectedConversationId;

          const unread =
            conversation.unread_count ??
            0;

          const client =
            conversation.client_id
              ? clients.find(
                  (item) =>
                    item.id ===
                    conversation.client_id,
                )
              : null;

          const displayName =
            getConversationClientName(
              conversation,
              clients,
            );

          const presence =
            conversation.client_id
              ? presenceByClientId[
                  conversation.client_id
                ]
              : undefined;

          const isOnline =
            presence?.is_online ===
            true;

          return (
            <button
              key={conversation.id}
              type="button"
              onClick={() =>
                onSelectConversation?.(
                  conversation,
                )
              }
              className={`flex w-full gap-3 px-4 py-3 text-left transition ${
                active
                  ? "bg-slate-100"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A3F61] text-sm font-semibold text-white">
                  {getInitials(
                    displayName,
                  )}
                </div>

                {client && (
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                      isOnline
                        ? "bg-emerald-500"
                        : "bg-red-500"
                    }`}
                  />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {displayName}
                  </p>

                  <span className="shrink-0 text-[11px] text-slate-400">
                    {getTime(
                      conversation,
                    )}
                  </span>
                </div>

                <div className="mt-1 flex items-center justify-between gap-2">
                  <p className="truncate text-xs text-slate-500">
                    {getPreview(
                      conversation,
                    )}
                  </p>

                  {unread > 0 && (
                    <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#0A3F61] px-1.5 text-[10px] font-semibold text-white">
                      {unread > 99
                        ? "99+"
                        : unread}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        },
      )}

      {/* ================================================================
          CLIENTS WITHOUT A CONVERSATION
         ================================================================ */}

      {clientsWithoutConversation.map(
        (client) => {
          const starting =
            startingClientId ===
            client.id;

          const presence =
            presenceByClientId[
              client.id
            ];

          const isOnline =
            presence?.is_online ===
            true;

          return (
            <button
              key={`client-${client.id}`}
              type="button"
              disabled={
                startingClientId !==
                null
              }
              onClick={() =>
                onSelectClient(
                  client,
                )
              }
              className={`flex w-full gap-3 px-4 py-3 text-left transition ${
                startingClientId !==
                null
                  ? "disabled:cursor-not-allowed"
                  : "bg-white hover:bg-slate-50"
              }`}
            >
              <div className="relative shrink-0">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A3F61] text-sm font-semibold text-white">
                  {getInitials(
                    client.display_name,
                  )}
                </div>

                <span
                  className={`absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white ${
                    isOnline
                      ? "bg-emerald-500"
                      : "bg-red-500"
                  }`}
                />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-slate-900">
                    {client.display_name}
                  </p>
                </div>

                <div className="mt-1">
                  <p className="truncate text-xs text-slate-500">
                    {starting
                      ? "Opening chat..."
                      : "Start a conversation"}
                  </p>
                </div>
              </div>
            </button>
          );
        },
      )}
    </div>
  );
}
