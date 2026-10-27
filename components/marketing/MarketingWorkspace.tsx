"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Check,
  CheckSquare,
  ChevronDown,
  Loader2,
  Megaphone,
  MessageSquare,
  RefreshCw,
  Search,
  Send,
  Square,
  Users,
  X,
} from "lucide-react";

import {
  getMarketingCampaigns,
  getMarketingStudioClients,
  sendMarketingCampaign,
} from "@/lib/api/marketing";

import type {
  MarketingCampaign,
  MarketingStudioClient,
} from "@/types/marketing";

function formatDate(
  value: string | null,
) {
  if (!value) {
    return "Not sent";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    new Date(value),
  );
}

function statusLabel(
  status: string,
) {
  switch (status) {
    case "sent":
      return "Sent";

    case "sending":
      return "Sending";

    case "partial":
      return "Partial";

    case "failed":
      return "Failed";

    case "draft":
      return "Draft";

    default:
      return status;
  }
}

function statusClassName(
  status: string,
) {
  switch (status) {
    case "sent":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";

    case "sending":
      return "bg-blue-50 text-blue-700 ring-blue-600/20";

    case "partial":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";

    case "failed":
      return "bg-red-50 text-red-700 ring-red-600/20";

    default:
      return "bg-slate-50 text-slate-700 ring-slate-600/20";
  }
}

export function MarketingWorkspace() {
  const [
    campaigns,
    setCampaigns,
  ] = useState<
    MarketingCampaign[]
  >([]);

  const [
    clients,
    setClients,
  ] = useState<
    MarketingStudioClient[]
  >([]);

  const [
    selectedClientIds,
    setSelectedClientIds,
  ] = useState<
    string[]
  >([]);

  const [
    title,
    setTitle,
  ] = useState("");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    search,
    setSearch,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    refreshing,
    setRefreshing,
  ] = useState(false);

  const [
    sending,
    setSending,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  const loadWorkspace =
    useCallback(
      async (
        showRefreshState = false,
      ) => {
        if (showRefreshState) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        setError(null);

        try {
          const [
            campaignData,
            clientData,
          ] =
            await Promise.all([
              getMarketingCampaigns(),
              getMarketingStudioClients(),
            ]);

          setCampaigns(
            campaignData,
          );

          setClients(
            clientData,
          );
        } catch (
          loadError
        ) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Failed to load marketing workspace.",
          );
        } finally {
          setLoading(false);
          setRefreshing(false);
        }
      },
      [],
    );

  useEffect(
    () => {
      void loadWorkspace();
    },
    [
      loadWorkspace,
    ],
  );

  const filteredClients =
    useMemo(() => {
      const query =
        search.trim().toLowerCase();

      if (!query) {
        return clients;
      }

      return clients.filter(
        (client) =>
          client.name
            .toLowerCase()
            .includes(query) ||
          client.email
            ?.toLowerCase()
            .includes(query) ||
          client.phone
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      clients,
      search,
    ]);

  const selectedClientSet =
    useMemo(
      () =>
        new Set(
          selectedClientIds,
        ),
      [
        selectedClientIds,
      ],
    );

  const allFilteredSelected =
    filteredClients.length > 0 &&
    filteredClients.every(
      (client) =>
        selectedClientSet.has(
          client.id,
        ),
    );

  const toggleClient =
    useCallback(
      (
        clientId: string,
      ) => {
        setSelectedClientIds(
          (current) => {
            if (
              current.includes(
                clientId,
              )
            ) {
              return current.filter(
                (id) =>
                  id !== clientId,
              );
            }

            return [
              ...current,
              clientId,
            ];
          },
        );
      },
      [],
    );

  const toggleAllFiltered =
    useCallback(() => {
      setSelectedClientIds(
        (current) => {
          const currentSet =
            new Set(current);

          if (
            allFilteredSelected
          ) {
            return current.filter(
              (id) =>
                !filteredClients.some(
                  (client) =>
                    client.id ===
                    id,
                ),
            );
          }

          for (
            const client of filteredClients
          ) {
            currentSet.add(
              client.id,
            );
          }

          return Array.from(
            currentSet,
          );
        },
      );
    }, [
      allFilteredSelected,
      filteredClients,
    ]);

  const handleSend =
    useCallback(
      async () => {
        const cleanMessage =
          message.trim();

        if (!cleanMessage) {
          setError(
            "Campaign message cannot be empty.",
          );

          return;
        }

        if (
          selectedClientIds.length ===
          0
        ) {
          setError(
            "Select at least one client.",
          );

          return;
        }

        setSending(true);
        setError(null);
        setSuccess(null);

        try {
          await sendMarketingCampaign({
            title,
            message:
              cleanMessage,
            clientIds:
              selectedClientIds,
          });

          setTitle("");
          setMessage("");
          setSelectedClientIds([]);

          setSuccess(
            `Campaign sent to ${selectedClientIds.length} client${selectedClientIds.length === 1 ? "" : "s"}.`,
          );

          await loadWorkspace(
            true,
          );
        } catch (
          sendError
        ) {
          setError(
            sendError instanceof Error
              ? sendError.message
              : "Failed to send campaign.",
          );
        } finally {
          setSending(false);
        }
      },
      [
        loadWorkspace,
        message,
        selectedClientIds,
        title,
      ],
    );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white">
              <Megaphone className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-950">
                Marketing
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Send internal marketing messages directly to your studio clients.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() =>
            void loadWorkspace(
              true,
            )
          }
          disabled={
            loading ||
            refreshing
          }
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <RefreshCw
            className={[
              "h-4 w-4",
              refreshing
                ? "animate-spin"
                : "",
            ].join(" ")}
          />

          Refresh
        </button>
      </div>

      {error ? (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <p className="text-sm text-red-700">
            {error}
          </p>

          <button
            type="button"
            onClick={() =>
              setError(null)
            }
            className="text-red-500 transition hover:text-red-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      {success ? (
        <div className="flex items-start justify-between gap-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3">
          <div className="flex items-center gap-2">
            <Check className="h-4 w-4 text-emerald-600" />

            <p className="text-sm text-emerald-700">
              {success}
            </p>
          </div>

          <button
            type="button"
            onClick={() =>
              setSuccess(null)
            }
            className="text-emerald-600 transition hover:text-emerald-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(380px,0.8fr)]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center gap-3">
              <MessageSquare className="h-5 w-5 text-[#0A3F61]" />

              <div>
                <h2 className="font-semibold text-slate-900">
                  Create Campaign
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  Messages are delivered through the client chat system.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-5 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Campaign title
                <span className="ml-1 font-normal text-slate-400">
                  Optional
                </span>
              </label>

              <input
                value={title}
                onChange={(event) =>
                  setTitle(
                    event.target.value,
                  )
                }
                placeholder="Example: Festival Offer"
                className="h-11 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Message
              </label>

              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(
                    event.target.value,
                  )
                }
                placeholder="Write the message you want to send to selected clients..."
                rows={7}
                className="w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm leading-6 outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10"
              />
            </div>

            <div className="flex flex-col gap-4 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium text-slate-900">
                  {selectedClientIds.length} selected
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Only clients belonging to the active studio can receive this campaign.
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  void handleSend()
                }
                disabled={
                  sending ||
                  loading ||
                  !message.trim() ||
                  selectedClientIds.length ===
                    0
                }
                className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#0A3F61] px-5 text-sm font-medium text-white transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}

                {sending
                  ? "Sending..."
                  : `Send to ${selectedClientIds.length || 0}`}
              </button>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-[#0A3F61]" />

                <div>
                  <h2 className="font-semibold text-slate-900">
                    Studio Clients
                  </h2>

                  <p className="mt-1 text-xs text-slate-500">
                    {clients.length} available client{clients.length === 1 ? "" : "s"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={toggleAllFiltered}
                disabled={
                  filteredClients.length ===
                  0
                }
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0A3F61] transition hover:text-[#08344f] disabled:opacity-40"
              >
                {allFilteredSelected ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}

                {allFilteredSelected
                  ? "Clear"
                  : "Select all"}
              </button>
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search clients..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-sm outline-none transition focus:border-[#0A3F61] focus:bg-white focus:ring-2 focus:ring-[#0A3F61]/10"
              />
            </div>
          </div>

          <div className="max-h-[540px] overflow-y-auto">
            {loading ? (
              <div className="flex min-h-[260px] items-center justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-[#0A3F61]" />
              </div>
            ) : filteredClients.length ===
              0 ? (
              <div className="flex min-h-[260px] flex-col items-center justify-center px-6 text-center">
                <Users className="h-8 w-8 text-slate-300" />

                <p className="mt-3 text-sm font-medium text-slate-700">
                  No clients found
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  {search
                    ? "Try a different search."
                    : "There are no clients available for this studio."}
                </p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredClients.map(
                  (client) => {
                    const selected =
                      selectedClientSet.has(
                        client.id,
                      );

                    return (
                      <button
                        key={
                          client.id
                        }
                        type="button"
                        onClick={() =>
                          toggleClient(
                            client.id,
                          )
                        }
                        className={[
                          "flex w-full items-start gap-3 px-5 py-4 text-left transition",
                          selected
                            ? "bg-[#0A3F61]/5"
                            : "hover:bg-slate-50",
                        ].join(" ")}
                      >
                        <div className="mt-0.5 shrink-0">
                          {selected ? (
                            <CheckSquare className="h-5 w-5 text-[#0A3F61]" />
                          ) : (
                            <Square className="h-5 w-5 text-slate-300" />
                          )}
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {client.name}
                          </p>

                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500">
                            {client.email ? (
                              <span>
                                {client.email}
                              </span>
                            ) : null}

                            {client.phone ? (
                              <span>
                                {client.phone}
                              </span>
                            ) : null}

                            {!client.email &&
                            !client.phone ? (
                              <span>
                                No contact details
                              </span>
                            ) : null}
                          </div>
                        </div>
                      </button>
                    );
                  },
                )}
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">
              Campaign History
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Recent campaigns sent through the internal client chat system.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ChevronDown className="h-4 w-4" />

            Latest first
          </div>
        </div>

        {loading ? (
          <div className="flex min-h-[220px] items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-[#0A3F61]" />
          </div>
        ) : campaigns.length ===
          0 ? (
          <div className="flex min-h-[220px] flex-col items-center justify-center px-6 text-center">
            <Megaphone className="h-9 w-9 text-slate-300" />

            <p className="mt-3 text-sm font-medium text-slate-700">
              No campaigns yet
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Your sent marketing campaigns will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/70">
                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Campaign
                  </th>

                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Recipients
                  </th>

                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Delivery
                  </th>

                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-xs font-medium uppercase tracking-wide text-slate-500">
                    Sent
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {campaigns.map(
                  (campaign) => (
                    <tr
                      key={
                        campaign.id
                      }
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="max-w-[360px] px-6 py-4">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {campaign.title ||
                            "Untitled Campaign"}
                        </p>

                        <p className="mt-1 line-clamp-2 text-sm text-slate-500">
                          {campaign.message}
                        </p>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-700">
                        {campaign.recipientCount}
                      </td>

                      <td className="px-6 py-4">
                        <div className="text-sm text-slate-700">
                          {campaign.sentCount} sent
                        </div>

                        {campaign.failedCount >
                        0 ? (
                          <div className="mt-1 text-xs text-red-600">
                            {campaign.failedCount} failed
                          </div>
                        ) : null}
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={[
                            "inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset",
                            statusClassName(
                              campaign.status,
                            ),
                          ].join(" ")}
                        >
                          {statusLabel(
                            campaign.status,
                          )}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-slate-500">
                        {formatDate(
                          campaign.sentAt,
                        )}
                      </td>
                    </tr>
                  ),
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}