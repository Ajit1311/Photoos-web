"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  addChatConversationClients,
  addChatConversationMembers,
} from "@/lib/api/chat";

type MemberOption = {
  id: string;
  name: string;
  email?: string | null;
  type: "employee" | "client";
};

type ChatAddMemberDialogProps = {
  open: boolean;

  onClose: () => void;

  conversationId: string;

  employees: MemberOption[];

  clients: MemberOption[];

  existingProfileIds?: string[];

  existingClientIds?: string[];

  onAdded?: (
    addedIds: string[],
  ) => void;
};

type MemberTab =
  | "employee"
  | "client";

export function ChatAddMemberDialog({
  open,
  onClose,
  conversationId,
  employees,
  clients,
  existingProfileIds = [],
  existingClientIds = [],
  onAdded,
}: ChatAddMemberDialogProps) {
  const [
    activeTab,
    setActiveTab,
  ] =
    useState<MemberTab>(
      "employee",
    );

  const [
    selectedIds,
    setSelectedIds,
  ] =
    useState<string[]>(
      [],
    );

  const [
    search,
    setSearch,
  ] =
    useState("");

  const [
    loading,
    setLoading,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState<string | null>(
      null,
    );

  useEffect(
    () => {
      if (!open) {
        return;
      }

      setSelectedIds([]);
      setSearch("");
      setError(null);
      setActiveTab("employee");
    },
    [open],
  );

  const sourceMembers =
    activeTab === "employee"
      ? employees
      : clients;

  const existingIds =
    activeTab === "employee"
      ? existingProfileIds
      : existingClientIds;

  const visibleMembers =
    useMemo(
      () => {
        const normalizedSearch =
          search
            .trim()
            .toLowerCase();

        return sourceMembers.filter(
          (member) => {
            if (
              existingIds.includes(
                member.id,
              )
            ) {
              return false;
            }

            if (
              !normalizedSearch
            ) {
              return true;
            }

            return (
              member.name
                .toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              member.email
                ?.toLowerCase()
                .includes(
                  normalizedSearch,
                ) ||
              false
            );
          },
        );
      },
      [
        existingIds,
        search,
        sourceMembers,
      ],
    );

  function toggleMember(
    memberId: string,
  ) {
    setSelectedIds(
      (current) => {
        if (
          current.includes(
            memberId,
          )
        ) {
          return current.filter(
            (id) =>
              id !== memberId,
          );
        }

        return [
          ...current,
          memberId,
        ];
      },
    );
  }

  function switchTab(
    tab: MemberTab,
  ) {
    setActiveTab(tab);
    setSelectedIds([]);
    setSearch("");
    setError(null);
  }

  async function handleAddMembers() {
    if (
      selectedIds.length === 0 ||
      loading
    ) {
      return;
    }

    const idsToAdd =
      [...selectedIds];

    try {
      setLoading(true);
      setError(null);

      if (
        activeTab === "employee"
      ) {
        await addChatConversationMembers(
          {
            conversationId,
            memberIds:
              idsToAdd,
          },
        );
      } else {
        await addChatConversationClients(
          {
            conversationId,
            clientIds:
              idsToAdd,
          },
        );
      }

      onAdded?.(
        idsToAdd,
      );

      onClose();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : activeTab === "employee"
            ? "Unable to add employees."
            : "Unable to add clients.",
      );
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/50 p-4">
      <div className="flex max-h-[80vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Add Member
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Add employees or clients to this conversation.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg px-3 py-1.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 disabled:opacity-50"
          >
            Close
          </button>
        </div>

        <div className="flex gap-2 border-b border-slate-200 px-4 py-3">
          <button
            type="button"
            onClick={() =>
              switchTab(
                "employee",
              )
            }
            disabled={loading}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50",
              activeTab ===
              "employee"
                ? "bg-[#0A3F61] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            Employees
          </button>

          <button
            type="button"
            onClick={() =>
              switchTab(
                "client",
              )
            }
            disabled={loading}
            className={[
              "rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50",
              activeTab ===
              "client"
                ? "bg-[#0A3F61] text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200",
            ].join(" ")}
          >
            Clients
          </button>
        </div>

        <div className="border-b border-slate-200 p-3">
          <input
            type="search"
            value={search}
            onChange={(
              event,
            ) =>
              setSearch(
                event.target
                  .value,
              )
            }
            disabled={loading}
            placeholder={
              activeTab ===
              "employee"
                ? "Search employees..."
                : "Search clients..."
            }
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none transition focus:border-[#0A3F61] disabled:opacity-50"
          />
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          {visibleMembers.length ===
          0 ? (
            <div className="flex min-h-40 items-center justify-center px-6 text-center text-sm text-slate-500">
              {activeTab ===
              "employee"
                ? "No available employees found."
                : "No available clients found."}
            </div>
          ) : (
            <div className="space-y-1">
              {visibleMembers.map(
                (
                  member,
                ) => {
                  const selected =
                    selectedIds.includes(
                      member.id,
                    );

                  return (
                    <button
                      key={
                        member.id
                      }
                      type="button"
                      onClick={() =>
                        toggleMember(
                          member.id,
                        )
                      }
                      disabled={
                        loading
                      }
                      className={[
                        "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition disabled:opacity-50",
                        selected
                          ? "bg-[#e8f4f8]"
                          : "hover:bg-slate-50",
                      ].join(
                        " ",
                      )}
                    >
                      <span
                        className={[
                          "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border text-xs font-bold",
                          selected
                            ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                            : "border-slate-300 bg-white text-transparent",
                        ].join(
                          " ",
                        )}
                      >
                        ✓
                      </span>

                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {
                            member.name
                          }
                        </p>

                        {member.email && (
                          <p className="truncate text-xs text-slate-500">
                            {
                              member.email
                            }
                          </p>
                        )}
                      </div>
                    </button>
                  );
                },
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="border-t border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <p className="text-sm text-slate-500">
            {selectedIds.length ===
            0
              ? "0 selected"
              : `${selectedIds.length} selected`}
          </p>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                loading
              }
              className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() =>
                void handleAddMembers()
              }
              disabled={
                selectedIds.length ===
                  0 ||
                loading
              }
              className="rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#083550] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {loading
                ? "Adding..."
                : activeTab ===
                    "employee"
                  ? "Add Employees"
                  : "Add Clients"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}