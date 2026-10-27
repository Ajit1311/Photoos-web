"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  Activity,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  RefreshCw,
  Search,
  ShieldCheck,
  X,
} from "lucide-react";

import {
  AuditLog,
  AuditStatistics,
  getAuditFilterOptions,
  getAuditLog,
  getAuditStatistics,
  listAuditLogs,
} from "@/lib/api/platform-admin-audit-logs";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Date(value).toLocaleString(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

function actionLabel(action: string) {
  return action
    .split(".")
    .map((part) =>
      part.charAt(0).toUpperCase() +
      part.slice(1),
    )
    .join(" ");
}

export default function AuditLogsPage() {
  const [logs, setLogs] =
    useState<AuditLog[]>([]);

  const [stats, setStats] =
    useState<AuditStatistics | null>(
      null,
    );

  const [filters, setFilters] =
    useState({
      actions: [] as string[],
      modules: [] as string[],
      target_types: [] as string[],
    });

  const [search, setSearch] =
    useState("");

  const [action, setAction] =
    useState("");

  const [module, setModule] =
    useState("");

  const [targetType, setTargetType] =
    useState("");

  const [page, setPage] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [selectedLog, setSelectedLog] =
    useState<AuditLog | null>(null);

  const pageSize = 20;

  const loadData = useCallback(
    async (
      showRefresh = false,
    ) => {
      try {
        setError(null);

        if (showRefresh) {
          setRefreshing(true);
        } else {
          setLoading(true);
        }

        const [
          logData,
          statsData,
          filterData,
        ] = await Promise.all([
          listAuditLogs({
            action,
            module,
            targetType,
            keyword: search,
            limit: pageSize,
            offset:
              page * pageSize,
          }),
          getAuditStatistics(),
          getAuditFilterOptions(),
        ]);

        setLogs(logData);
        setStats(statsData);
        setFilters(filterData);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Failed to load audit logs.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [
      action,
      module,
      targetType,
      search,
      page,
    ],
  );

  useEffect(() => {
    loadData();
  }, [loadData]);

  const totalCount =
    logs[0]?.total_count ??
    stats?.total_events ??
    0;

  const totalPages = Math.max(
    1,
    Math.ceil(
      totalCount / pageSize,
    ),
  );

  const canNext =
    page + 1 < totalPages;

  const canPrevious =
    page > 0;

  const statCards = useMemo(
    () => [
      {
        label: "Total Events",
        value:
          stats?.total_events ?? 0,
        icon: Activity,
      },
      {
        label: "Today",
        value: stats?.today ?? 0,
        icon: Calendar,
      },
      {
        label: "Last 7 Days",
        value:
          stats?.last_7_days ?? 0,
        icon: Activity,
      },
      {
        label: "Last 30 Days",
        value:
          stats?.last_30_days ?? 0,
        icon: ShieldCheck,
      },
    ],
    [stats],
  );

  async function openDetails(
    id: string,
  ) {
    try {
      const result =
        await getAuditLog(id);

      if (result[0]) {
        setSelectedLog(result[0]);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load audit detail.",
      );
    }
  }

  function clearFilters() {
    setSearch("");
    setAction("");
    setModule("");
    setTargetType("");
    setPage(0);
  }

  const hasFilters =
    Boolean(
      search ||
      action ||
      module ||
      targetType,
    );

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-6 w-6 text-slate-700" />
              <h1 className="text-2xl font-semibold text-slate-900">
                Audit Logs
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Read-only record of platform administration activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => loadData(true)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.label}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-500">
                      {card.label}
                    </p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">
                      {card.value}
                    </p>
                  </div>

                  <div className="rounded-xl bg-slate-100 p-3">
                    <Icon className="h-5 w-5 text-slate-600" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            <span className="text-sm font-semibold text-slate-800">
              Filters
            </span>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Search audit logs..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">
                All Actions
              </option>

              {filters.actions.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {actionLabel(item)}
                  </option>
                ),
              )}
            </select>

            <select
              value={module}
              onChange={(e) => {
                setModule(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            >
              <option value="">
                All Modules
              </option>

              {filters.modules.map(
                (item) => (
                  <option
                    key={item}
                    value={item}
                  >
                    {item}
                  </option>
                ),
              )}
            </select>

            <div className="flex gap-2">
              <select
                value={targetType}
                onChange={(e) => {
                  setTargetType(
                    e.target.value,
                  );
                  setPage(0);
                }}
                className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="">
                  All Target Types
                </option>

                {filters.target_types.map(
                  (item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ),
                )}
              </select>

              {hasFilters && (
                <button
                  type="button"
                  onClick={clearFilters}
                  className="rounded-xl border border-slate-200 px-3 text-slate-500 hover:bg-slate-50"
                  title="Clear filters"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Time
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Action
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Module
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Target
                  </th>
                  <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    IP
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
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading audit logs...
                    </td>
                  </tr>
                ) : logs.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No audit events found.
                    </td>
                  </tr>
                ) : (
                  logs.map((log) => (
                    <tr
                      key={log.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          log.created_at,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                          {actionLabel(
                            log.action,
                          )}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {log.module}
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {log.target_type ??
                            "—"}
                        </div>

                        {log.target_id && (
                          <div className="mt-1 max-w-[220px] truncate font-mono text-xs text-slate-400">
                            {log.target_id}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 font-mono text-xs text-slate-500">
                        {log.ip_address ??
                          "—"}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            openDetails(
                              log.id,
                            )
                          }
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-3.5 w-3.5" />
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
            <p className="text-sm text-slate-500">
              Page {page + 1} of{" "}
              {totalPages}
              {" · "}
              {totalCount} events
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={!canPrevious}
                onClick={() =>
                  setPage(
                    (value) =>
                      Math.max(
                        0,
                        value - 1,
                      ),
                  )
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <button
                type="button"
                disabled={!canNext}
                onClick={() =>
                  setPage(
                    (value) =>
                      value + 1,
                  )
                }
                className="rounded-lg border border-slate-200 p-2 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="max-h-[85vh] w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Audit Event Details
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(
                    selectedLog.created_at,
                  )}
                </p>
              </div>

              <button
                type="button"
                onClick={() =>
                  setSelectedLog(null)
                }
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="max-h-[70vh] space-y-5 overflow-y-auto p-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">
                    Action
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {actionLabel(
                      selectedLog.action,
                    )}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Module
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">
                    {selectedLog.module}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    Target Type
                  </p>
                  <p className="mt-1 text-sm text-slate-700">
                    {selectedLog.target_type ??
                      "—"}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-slate-500">
                    IP Address
                  </p>
                  <p className="mt-1 font-mono text-sm text-slate-700">
                    {selectedLog.ip_address ??
                      "—"}
                  </p>
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Target ID
                </p>
                <div className="rounded-xl bg-slate-50 p-3 font-mono text-xs break-all text-slate-700">
                  {selectedLog.target_id ??
                    "—"}
                </div>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Metadata
                </p>
                <pre className="overflow-x-auto rounded-xl bg-slate-950 p-4 text-xs text-slate-100">
                  {JSON.stringify(
                    selectedLog.metadata,
                    null,
                    2,
                  )}
                </pre>
              </div>

              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  User Agent
                </p>
                <div className="rounded-xl bg-slate-50 p-3 text-xs break-all text-slate-600">
                  {selectedLog.user_agent ??
                    "—"}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
