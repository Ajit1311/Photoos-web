"use client";

import {
  ArrowLeft,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Mail,
  RefreshCw,
  Search,
  Send,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformMarketingCampaigns,
  type PlatformMarketingCampaign,
} from "@/lib/api/platform-admin";

const STATUS_OPTIONS = [
  { value: "", label: "All Campaigns" },
  { value: "draft", label: "Draft" },
  { value: "sending", label: "Sending" },
  { value: "sent", label: "Sent" },
  { value: "partial", label: "Partial" },
  { value: "failed", label: "Failed" },
  { value: "cancelled", label: "Cancelled" },
];

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function statusClass(status: string) {
  if (status === "sent") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "sending") {
    return "bg-blue-50 text-blue-700";
  }

  if (status === "partial") {
    return "bg-amber-50 text-amber-700";
  }

  if (status === "failed") {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-700";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "sent") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "sending") {
    return <Clock3 className="h-4 w-4" />;
  }

  if (status === "failed") {
    return <XCircle className="h-4 w-4" />;
  }

  return <Mail className="h-4 w-4" />;
}

function statusLabel(status: string) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export default function MarketingCampaignsPage() {
  const [items, setItems] = useState<PlatformMarketingCampaign[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 50;

  const loadCampaigns = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPlatformMarketingCampaigns({
        search,
        status,
        limit,
        offset,
      });

      setItems(response.data.items);
      setTotal(response.data.total);
      setHasMore(response.data.has_more);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load marketing campaigns.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, offset]);

  useEffect(() => {
    void loadCampaigns();
  }, [loadCampaigns]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setOffset(0);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setOffset(0);
  }

  const sentCount = items.filter(
    (item) => item.status === "sent",
  ).length;

  const sendingCount = items.filter(
    (item) => item.status === "sending",
  ).length;

  const failedCount = items.filter(
    (item) => item.status === "failed",
  ).length;

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + items.length, total);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/admin/marketing"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Marketing
              </Link>
              <span>/</span>
              <span>Campaigns</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Campaigns
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor marketing campaign activity and client delivery.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadCampaigns()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Total Campaigns
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Sent Campaigns
            </p>
            <p className="mt-3 text-2xl font-semibold text-emerald-700">
              {sentCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Sending
            </p>
            <p className="mt-3 text-2xl font-semibold text-blue-700">
              {sendingCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Failed
            </p>
            <p className="mt-3 text-2xl font-semibold text-red-700">
              {failedCount}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                type="search"
                value={search}
                onChange={(event) =>
                  handleSearchChange(event.target.value)
                }
                placeholder="Search campaign, message or studio..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) =>
                handleStatusChange(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1200px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Campaign</th>
                  <th className="px-5 py-4">Studio</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Recipients</th>
                  <th className="px-5 py-4">Delivery</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading campaigns...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      <Send className="mx-auto mb-3 h-7 w-7 text-slate-300" />
                      No marketing campaigns found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.campaign_id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {item.title ?? "Untitled Campaign"}
                        </div>
                        <div className="mt-1 max-w-md truncate text-xs text-slate-500">
                          {item.message}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {item.studio_name ?? "—"}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            item.status,
                          )}`}
                        >
                          <StatusIcon status={item.status} />
                          {statusLabel(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {item.recipient_count}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.sent_count} sent · {item.failed_count} failed
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-900">
                          {Number(item.delivery_percent).toFixed(1)}%
                        </div>
                        <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-slate-700"
                            style={{
                              width: `${Math.min(
                                100,
                                Math.max(
                                  0,
                                  Number(item.delivery_percent),
                                ),
                              )}%`,
                            }}
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.created_at)}
                        {item.sent_at && (
                          <div className="mt-1 text-xs text-slate-400">
                            Sent {formatDate(item.sent_at)}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              {pageStart}-{pageEnd} of {total}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={() =>
                  setOffset(Math.max(0, offset - limit))
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={!hasMore || loading}
                onClick={() => setOffset(offset + limit)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
