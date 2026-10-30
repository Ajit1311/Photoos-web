"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getSecurityFilterOptions,
  getSecurityStatistics,
  listSecurityLogs,
  type SecurityFilterOptions,
  type SecurityLog,
  type SecurityStatistics,
} from "@/lib/api/platform-admin-security-logs";

function formatDate(
  value: string | null,
) {
  if (!value) return "—";

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function eventLabel(value: string) {
  return value
    .replaceAll(".", " ")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

function statusBadge(log: SecurityLog) {
  if (log.success) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
        <CheckCircle2 size={13} />
        Success
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <XCircle size={13} />
      Failed
    </span>
  );
}

export default function SecurityLogsPage() {
  const [logs, setLogs] =
    useState<SecurityLog[]>([]);

  const [stats, setStats] =
    useState<SecurityStatistics | null>(
      null,
    );

  const [filters, setFilters] =
    useState<SecurityFilterOptions>({
      event_types: [],
      event_categories: [],
    });

  const [keyword, setKeyword] =
    useState("");

  const [eventType, setEventType] =
    useState("");

  const [eventCategory, setEventCategory] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [total, setTotal] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedLog, setSelectedLog] =
    useState<SecurityLog | null>(
      null,
    );

  const [detailsLoading, setDetailsLoading] =
    useState(false);

  const limit = 25;

  const loadData = useCallback(
    async () => {
      try {
        setLoading(true);
        setError(null);

        const [
          logData,
          statistics,
          filterData,
        ] = await Promise.all([
          listSecurityLogs({
            keyword:
              keyword.trim() || undefined,
            eventType:
              eventType || undefined,
            eventCategory:
              eventCategory || undefined,
            success:
              success === ""
                ? undefined
                : success === "true",
            limit,
            offset: page * limit,
          }),
          getSecurityStatistics(),
          getSecurityFilterOptions(),
        ]);

        setLogs(logData ?? []);
        setStats(statistics);
        setFilters(filterData);

        setTotal(
          Number(
            logData?.[0]?.total_count ??
              0,
          ),
        );
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load security logs.",
        );
      } finally {
        setLoading(false);
      }
    },
    [
      keyword,
      eventType,
      eventCategory,
      success,
      page,
    ],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalPages =
    Math.max(
      1,
      Math.ceil(total / limit),
    );

  const statCards = useMemo(
    () => [
      {
        label: "Total Events",
        value:
          stats?.total_events ?? 0,
        icon: ShieldCheck,
      },
      {
        label: "Today",
        value: stats?.today ?? 0,
        icon: Clock3,
      },
      {
        label: "Successful",
        value:
          stats?.successful_events ?? 0,
        icon: CheckCircle2,
      },
      {
        label: "Failed",
        value:
          stats?.failed_events ?? 0,
        icon: AlertTriangle,
      },
    ],
    [stats],
  );

  function openDetails(
    log: SecurityLog,
  ) {
    setError(null);
    setDetailsLoading(false);
    setSelectedLog(log);
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck
                className="text-slate-700"
                size={24}
              />
              <h1 className="text-2xl font-semibold text-slate-900">
                Security Logs
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Platform administrator authentication
              and security events.
            </p>
          </div>

          <button
            type="button"
            onClick={loadData}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              size={16}
              className={
                loading
                  ? "animate-spin"
                  : ""
              }
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm text-slate-500">
                    {card.label}
                  </p>

                  <Icon
                    size={19}
                    className="text-slate-500"
                  />
                </div>

                <p className="mt-3 text-2xl font-semibold text-slate-900">
                  {card.value.toLocaleString(
                    "en-IN",
                  )}
                </p>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter
              size={17}
              className="text-slate-500"
            />
            <span className="text-sm font-semibold text-slate-800">
              Filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
            <div className="relative">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={keyword}
                onChange={(e) => {
                  setPage(0);
                  setKeyword(e.target.value);
                }}
                placeholder="Search events..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <select
              value={eventType}
              onChange={(e) => {
                setPage(0);
                setEventType(e.target.value);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">
                All Event Types
              </option>

              {filters.event_types.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {eventLabel(value)}
                  </option>
                ),
              )}
            </select>

            <select
              value={eventCategory}
              onChange={(e) => {
                setPage(0);
                setEventCategory(e.target.value);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">
                All Categories
              </option>

              {filters.event_categories.map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {eventLabel(value)}
                  </option>
                ),
              )}
            </select>

            <select
              value={success}
              onChange={(e) => {
                setPage(0);
                setSuccess(e.target.value);
              }}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">
                All Results
              </option>
              <option value="true">
                Successful
              </option>
              <option value="false">
                Failed
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Event
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Category
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Result
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IP Address
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>
                  <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Details
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center"
                    >
                      <Loader2
                        className="mx-auto animate-spin text-slate-400"
                        size={24}
                      />
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No security events found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {eventLabel(
                            log.event_type,
                          )}
                        </div>

                        {log.failure_reason && (
                          <div className="mt-1 text-xs text-slate-500">
                            {log.failure_reason}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {eventLabel(
                          log.event_category,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {statusBadge(log)}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-600">
                        {log.ip_address ?? "—"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          log.created_at,
                        )}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(log)
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye size={14} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3">
            <p className="text-xs text-slate-500">
              {total === 0
                ? "0 events"
                : `${page * limit + 1}–${Math.min(
                    (page + 1) * limit,
                    total,
                  )} of ${total}`}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={
                  page === 0 || loading
                }
                onClick={() =>
                  setPage((value) =>
                    Math.max(value - 1, 0),
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Previous
              </button>

              <span className="text-xs text-slate-500">
                Page {page + 1} /{" "}
                {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page + 1 >= totalPages ||
                  loading
                }
                onClick={() =>
                  setPage((value) =>
                    value + 1,
                  )
                }
                className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>

        {(selectedLog ||
          detailsLoading) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Security Event Details
                  </h2>

                  {selectedLog && (
                    <p className="mt-0.5 text-xs text-slate-500">
                      {formatDate(
                        selectedLog.created_at,
                      )}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setSelectedLog(null)
                  }
                  className="rounded-lg px-2 py-1 text-slate-500 hover:bg-slate-100"
                >
                  ×
                </button>
              </div>

              {detailsLoading ? (
                <div className="flex justify-center p-12">
                  <Loader2
                    className="animate-spin text-slate-400"
                    size={24}
                  />
                </div>
              ) : selectedLog ? (
                <div className="space-y-4 p-5">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div>
                      <p className="text-xs text-slate-500">
                        Event
                      </p>
                      <p className="mt-1 text-sm font-medium text-slate-900">
                        {eventLabel(
                          selectedLog.event_type,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Result
                      </p>
                      <div className="mt-1">
                        {statusBadge(
                          selectedLog,
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Category
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {eventLabel(
                          selectedLog.event_category,
                        )}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Failure Reason
                      </p>
                      <p className="mt-1 text-sm text-slate-900">
                        {selectedLog.failure_reason ??
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        IP Address
                      </p>
                      <p className="mt-1 font-mono text-sm text-slate-900">
                        {selectedLog.ip_address ??
                          "—"}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-slate-500">
                        Session ID
                      </p>
                      <p className="mt-1 break-all font-mono text-xs text-slate-900">
                        {selectedLog.session_id ??
                          "—"}
                      </p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-slate-500">
                      User Agent
                    </p>

                    <div className="rounded-lg bg-slate-50 p-3 font-mono text-xs text-slate-700">
                      {selectedLog.user_agent ??
                        "—"}
                    </div>
                  </div>

                  <div>
                    <p className="mb-2 text-xs text-slate-500">
                      Metadata
                    </p>

                    <pre className="max-h-64 overflow-auto rounded-lg bg-slate-950 p-4 text-xs text-slate-100">
                      {JSON.stringify(
                        selectedLog.metadata ??
                          {},
                        null,
                        2,
                      )}
                    </pre>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
