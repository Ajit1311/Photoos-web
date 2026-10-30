"use client";

import {
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CheckCheck,
  Loader2,
  MessageSquare,
  Search,
  Send,
  ShieldCheck,
  UserRound,
  Users,
} from "lucide-react";

import {
  getMyChatConversations,
  getChatMessages,
  sendChatMessage,
  markChatMessageRead,
  type ChatConversation,
  type ChatMessage,
} from "@/lib/api/chat";

import {
  getInternalChatConversations,
  getInternalChatEmployees,
  getInternalChatMessages,
  sendInternalChatMessage,
  type InternalChatConversation,
  type InternalChatEmployee,
  type InternalChatMessage,
} from "@/lib/api/platform-admin-internal-chat";

type ChatMode = "internal" | "clients";

export default function UnifiedChatPage() {
  const [mode, setMode] = useState<ChatMode>("internal");

  const [employees, setEmployees] =
    useState<InternalChatEmployee[]>([]);

  const [internalConversations, setInternalConversations] =
    useState<InternalChatConversation[]>([]);

  const [clientConversations, setClientConversations] =
    useState<ChatConversation[]>([]);

  const [messages, setMessages] =
    useState<Array<InternalChatMessage | ChatMessage>>([]);

  const [selectedConversationId, setSelectedConversationId] =
    useState<string | null>(null);

  const [search, setSearch] =
    useState("");

  const [message, setMessage] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [messagesLoading, setMessagesLoading] =
    useState(false);

  const [sending, setSending] =
    useState(false);

  const [error, setError] =
    useState("");

  async function loadChat() {
    setLoading(true);
    setError("");

    try {
      const [
        employeeData,
        internalData,
        genericData,
      ] = await Promise.all([
        getInternalChatEmployees(),
        getInternalChatConversations(),
        getMyChatConversations(),
      ]);

      setEmployees(
        Array.isArray(employeeData)
          ? employeeData
          : [],
      );

      setInternalConversations(
        Array.isArray(internalData)
          ? internalData
          : [],
      );

      setClientConversations(
        Array.isArray(genericData)
          ? genericData.filter(
              (conversation) =>
                conversation.type === "client",
            )
          : [],
      );
    } catch (err) {
      console.error("[Unified Chat] load failed:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load chat.",
      );
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(
    conversationId: string,
  ) {
    setMessagesLoading(true);
    setError("");

    try {
      if (mode === "internal") {
        const data =
          await getInternalChatMessages(
            conversationId,
          );

        setMessages(data);
        return;
      }

      const data =
        await getChatMessages(
          conversationId,
        );

      setMessages(data);

      for (const item of data) {
        if (item.sender_id) {
          try {
            await markChatMessageRead(item.id);
          } catch (readError) {
            console.warn(
              "[Unified Chat] mark read failed:",
              readError,
            );
          }
        }
      }
    } catch (err) {
      console.error(
        "[Unified Chat] messages failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load messages.",
      );

      setMessages([]);
    } finally {
      setMessagesLoading(false);
    }
  }

  useEffect(() => {
    void loadChat();
  }, []);

  useEffect(() => {
    if (!selectedConversationId) {
      setMessages([]);
      return;
    }

    void loadMessages(
      selectedConversationId,
    );
  }, [
    selectedConversationId,
    mode,
  ]);

  const selectedInternalConversation =
    internalConversations.find(
      (conversation) =>
        conversation.conversation_id ===
        selectedConversationId,
    );

  const selectedClientConversation =
    clientConversations.find(
      (conversation) =>
        conversation.id ===
        selectedConversationId,
    );

  const selectedEmployee =
    selectedInternalConversation?.members
      ?.map((member) =>
        employees.find(
          (employee) =>
            employee.profile_id ===
            member.profile_id,
        ),
      )
      .find(Boolean);

  const filteredInternal =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return internalConversations;
      }

      return internalConversations.filter(
        (conversation) => {
          const employee =
            conversation.members
              ?.map((member) =>
                employees.find(
                  (item) =>
                    item.profile_id ===
                    member.profile_id,
                ),
              )
              .find(Boolean);

          return (
            employee?.display_name
              ?.toLowerCase()
              .includes(value) ||
            employee?.email
              ?.toLowerCase()
              .includes(value) ||
            employee?.employee_code
              ?.toLowerCase()
              .includes(value)
          );
        },
      );
    }, [
      internalConversations,
      employees,
      search,
    ]);

  const filteredClients =
    useMemo(() => {
      const value =
        search.trim().toLowerCase();

      if (!value) {
        return clientConversations;
      }

      return clientConversations.filter(
        (conversation) =>
          conversation.title
            ?.toLowerCase()
            .includes(value) ||
          conversation.client_id
            ?.toLowerCase()
            .includes(value),
      );
    }, [
      clientConversations,
      search,
    ]);

  async function handleSend(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content =
      message.trim();

    if (
      !content ||
      !selectedConversationId ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    try {
      if (mode === "internal") {
        await sendInternalChatMessage(
          selectedConversationId,
          content,
        );
      } else {
        await sendChatMessage(
          selectedConversationId,
          content,
        );
      }

      setMessage("");

      await loadMessages(
        selectedConversationId,
      );

      await loadChat();
    } catch (err) {
      console.error(
        "[Unified Chat] send failed:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to send message.",
      );
    } finally {
      setSending(false);
    }
  }

  function selectMode(
    nextMode: ChatMode,
  ) {
    setMode(nextMode);
    setSearch("");
    setMessages([]);
    setError("");

    if (nextMode === "internal") {
      setSelectedConversationId(
        internalConversations[0]
          ?.conversation_id ?? null,
      );
    } else {
      setSelectedConversationId(
        clientConversations[0]?.id ??
          null,
      );
    }
  }

  function formatTime(
    value: string,
  ) {
    return new Intl.DateTimeFormat(
      "en-IN",
      {
        hour: "2-digit",
        minute: "2-digit",
      },
    ).format(new Date(value));
  }

  const selectedTitle =
    mode === "clients"
      ? selectedClientConversation?.title ??
        "Client"
      : selectedEmployee?.display_name ??
        selectedEmployee?.email ??
        "Employee";

  const selectedSubtitle =
    mode === "clients"
      ? selectedClientConversation?.client_id
        ? `Client • ${selectedClientConversation.client_id}`
        : "Client conversation"
      : selectedEmployee?.employee_code ??
        "Internal Team";

  return (
    <div className="flex h-[calc(100vh-5rem)] min-h-[620px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <aside className="flex w-[330px] shrink-0 flex-col border-r border-slate-200 bg-slate-50/60">

        <div className="border-b border-slate-200 p-4">

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold text-slate-900">
                Chat
              </h1>

              <p className="mt-0.5 text-xs text-slate-500">
                Unified PhotoOS Chat
              </p>
            </div>

            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A3F61]/10 text-[#0A3F61]">
              <MessageSquare size={18} />
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 rounded-xl bg-slate-200/70 p-1">
            <button
              type="button"
              onClick={() =>
                selectMode("internal")
              }
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                mode === "internal"
                  ? "bg-white text-[#0A3F61] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <Users size={14} />
              Internal
            </button>

            <button
              type="button"
              onClick={() =>
                selectMode("clients")
              }
              className={`flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition ${
                mode === "clients"
                  ? "bg-white text-[#0A3F61] shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              <UserRound size={14} />
              Clients
            </button>
          </div>

          <div className="relative mt-4">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder={
                mode === "clients"
                  ? "Search clients..."
                  : "Search employees..."
              }
              className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-[#0A3F61]"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">

          {loading ? (
            <div className="flex items-center justify-center p-8 text-slate-400">
              <Loader2
                size={20}
                className="animate-spin"
              />
            </div>
          ) : mode === "internal" ? (

            filteredInternal.length === 0 ? (
              <EmptyState
                title="No internal conversations"
                description="Start a conversation with a team member."
              />
            ) : (
              filteredInternal.map(
                (conversation) => {
                  const employee =
                    conversation.members
                      ?.map((member) =>
                        employees.find(
                          (item) =>
                            item.profile_id ===
                            member.profile_id,
                        ),
                      )
                      .find(Boolean);

                  const active =
                    conversation.conversation_id ===
                    selectedConversationId;

                  return (
                    <ConversationButton
                      key={
                        conversation.conversation_id
                      }
                      active={active}
                      title={
                        employee?.display_name ??
                        employee?.email ??
                        "Employee"
                      }
                      subtitle={
                        employee?.employee_code ??
                        employee?.email ??
                        "Team Member"
                      }
                      initial={
                        (
                          employee?.display_name ??
                          employee?.email ??
                          "E"
                        )
                          .charAt(0)
                          .toUpperCase()
                      }
                      unread={0}
                      onClick={() =>
                        setSelectedConversationId(
                          conversation.conversation_id,
                        )
                      }
                    />
                  );
                },
              )
            )

          ) : (

            filteredClients.length === 0 ? (
              <EmptyState
                title="No client conversations"
                description="Client messages will appear here when they contact the studio."
              />
            ) : (
              filteredClients.map(
                (conversation) => (
                  <ConversationButton
                    key={conversation.id}
                    active={
                      conversation.id ===
                      selectedConversationId
                    }
                    title={
                      conversation.title ??
                      "Client"
                    }
                    subtitle={
                      conversation.unread_count
                        ? `${conversation.unread_count} unread message${conversation.unread_count === 1 ? "" : "s"}`
                        : "Client conversation"
                    }
                    initial={
                      (
                        conversation.title ??
                        "C"
                      )
                        .charAt(0)
                        .toUpperCase()
                    }
                    unread={
                      conversation.unread_count ?? 0
                    }
                    onClick={() =>
                      setSelectedConversationId(
                        conversation.id,
                      )
                    }
                  />
                ),
              )
            )
          )}
        </div>
      </aside>

      <section className="flex min-w-0 flex-1 flex-col">

        {!selectedConversationId ? (

          <div className="flex flex-1 flex-col items-center justify-center text-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100">
              <MessageSquare
                size={28}
                className="text-slate-400"
              />
            </div>

            <h2 className="mt-4 text-base font-semibold text-slate-800">
              {mode === "clients"
                ? "Client Chat"
                : "Internal Team Chat"}
            </h2>

            <p className="mt-1 max-w-sm text-sm text-slate-400">
              {mode === "clients"
                ? "Client App conversations will appear here."
                : "Select a team member to start chatting."}
            </p>
          </div>

        ) : (

          <>
            <header className="flex items-center gap-3 border-b border-slate-200 px-5 py-4">

              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A3F61]/10 text-sm font-semibold text-[#0A3F61]">
                {mode === "clients" ? (
                  <UserRound size={19} />
                ) : (
                  selectedTitle
                    .charAt(0)
                    .toUpperCase()
                )}
              </div>

              <div className="min-w-0">
                <h2 className="truncate text-sm font-semibold text-slate-900">
                  {selectedTitle}
                </h2>

                <p className="truncate text-xs text-slate-400">
                  {selectedSubtitle}
                </p>
              </div>

              <div className="ml-auto flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1.5 text-[11px] text-slate-500">
                <ShieldCheck
                  size={14}
                  className="text-emerald-600"
                />
                Encrypted
              </div>
            </header>

            <div className="flex-1 overflow-y-auto bg-[#F8FAFC] px-5 py-6">

              {messagesLoading ? (

                <div className="flex h-full items-center justify-center">
                  <Loader2
                    size={22}
                    className="animate-spin text-slate-400"
                  />
                </div>

              ) : messages.length === 0 ? (

                <div className="flex h-full items-center justify-center">
                  <div className="text-center">
                    <MessageSquare
                      size={30}
                      className="mx-auto text-slate-300"
                    />

                    <p className="mt-3 text-sm text-slate-500">
                      No messages yet
                    </p>

                    <p className="mt-1 text-xs text-slate-400">
                      Start the conversation below.
                    </p>
                  </div>
                </div>

              ) : (

                <div className="mx-auto flex max-w-3xl flex-col gap-3">

                  {messages.map(
                    (item) => {
                      const mine =
                        mode === "clients"
                          ? Boolean(
                              item.sender_id,
                            ) &&
                            !(
                              item as ChatMessage
                            ).metadata?.client_id
                          : item.sender_id ===
                            selectedInternalConversation
                              ?.members?.[0]
                              ?.profile_id;

                      return (
                        <div
                          key={item.id}
                          className={`flex ${
                            mine
                              ? "justify-end"
                              : "justify-start"
                          }`}
                        >
                          <div
                            className={`max-w-[75%] rounded-2xl px-4 py-2.5 shadow-sm ${
                              mine
                                ? "rounded-br-md bg-[#0A3F61] text-white"
                                : "rounded-bl-md border border-slate-200 bg-white text-slate-800"
                            }`}
                          >
                            <p className="whitespace-pre-wrap break-words text-sm">
                              {item.content ??
                                ""}
                            </p>

                            <div
                              className={`mt-1.5 flex items-center justify-end gap-1 text-[10px] ${
                                mine
                                  ? "text-white/60"
                                  : "text-slate-400"
                              }`}
                            >
                              {formatTime(
                                item.created_at,
                              )}

                              {mine ? (
                                <CheckCheck
                                  size={12}
                                />
                              ) : null}
                            </div>
                          </div>
                        </div>
                      );
                    },
                  )}

                </div>
              )}
            </div>

            <div className="border-t border-slate-200 bg-white">

              <div className="border-b border-slate-100 px-5 py-2 text-center text-[11px] text-slate-400">
                🔒 Messages are encrypted with AES-256-GCM
              </div>

              {error ? (
                <div className="mx-5 mt-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600">
                  {error}
                </div>
              ) : null}

              <form
                onSubmit={handleSend}
                className="flex items-end gap-3 p-4"
              >
                <textarea
                  value={message}
                  onChange={(event) =>
                    setMessage(event.target.value)
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key === "Enter" &&
                      !event.shiftKey
                    ) {
                      event.preventDefault();

                      if (!sending) {
                        event.currentTarget.form?.requestSubmit();
                      }
                    }
                  }}
                  rows={1}
                  placeholder={
                    mode === "clients"
                      ? "Reply to client..."
                      : "Write a message..."
                  }
                  className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
                />

                <button
                  type="submit"
                  disabled={
                    sending ||
                    !message.trim()
                  }
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#0A3F61] text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {sending ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Send size={18} />
                  )}
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function ConversationButton({
  active,
  title,
  subtitle,
  initial,
  unread,
  onClick,
}: {
  active: boolean;
  title: string;
  subtitle: string;
  initial: string;
  unread: number;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-slate-100 px-4 py-3.5 text-left transition ${
        active
          ? "bg-white"
          : "hover:bg-white/70"
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#0A3F61]/10 text-sm font-semibold text-[#0A3F61]">
        {initial}
      </div>

      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-slate-800">
          {title}
        </div>

        <div className="mt-0.5 truncate text-xs text-slate-400">
          {subtitle}
        </div>
      </div>

      {unread > 0 ? (
        <div className="flex h-5 min-w-5 items-center justify-center rounded-full bg-[#0A3F61] px-1.5 text-[10px] font-semibold text-white">
          {unread > 99 ? "99+" : unread}
        </div>
      ) : active ? (
        <div className="h-2 w-2 rounded-full bg-[#0A3F61]" />
      ) : null}
    </button>
  );
}

function EmptyState({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="p-8 text-center">
      <MessageSquare
        size={28}
        className="mx-auto text-slate-300"
      />

      <p className="mt-3 text-sm font-medium text-slate-600">
        {title}
      </p>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  );
}
