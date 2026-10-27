"use client";

import {
  ArrowLeft,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  RefreshCw,
  Search,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformMarketingTrialConversion,
  type PlatformMarketingTrialConversion,
} from "@/lib/api/platform-admin";

const STATUS_OPTIONS = [
  { value: "", label: "All Status" },
  { value: "in_trial", label: "In Trial" },
  { value: "converted", label: "Converted" },
  { value: "expired", label: "Expired" },
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
  if (status === "converted") {
    return "bg-emerald-50 text-emerald-700";
  }

  if (status === "in_trial") {
    return "bg-blue-50 text-blue-700";
  }

  return "bg-red-50 text-red-700";
}

function StatusIcon({ status }: { status: string }) {
  if (status === "converted") {
    return <CheckCircle2 className="h-4 w-4" />;
  }

  if (status === "in_trial") {
    return <Clock3 className="h-4 w-4" />;
  }

  return <XCircle className="h-4 w-4" />;
}

function statusLabel(status: string) {
  if (status === "converted") return "Converted";
  if (status === "in_trial") return "In Trial";
  return "Expired";
}

export default function MarketingTrialConversionPage() {
  const [items, setItems] = useState<PlatformMarketingTrialConversion[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 50;

  const loadData = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPlatformMarketingTrialConversion({
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
          : "Unable to load trial conversion data.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, status, offset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setOffset(0);
  }

  function handleStatusChange(value: string) {
    setStatus(value);
    setOffset(0);
  }

  const convertedCount = items.filter(
    (item) => item.conversion_status === "converted",
  ).length;

  const inTrialCount = items.filter(
    (item) => item.conversion_status === "in_trial",
  ).length;

  const expiredCount = items.filter(
    (item) => item.conversion_status === "expired",
  ).length;

  const conversionPercent =
    total > 0 ? ((convertedCount / total) * 100).toFixed(1) : "0.0";

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
              <span>Trial Conversion</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Trial Conversion
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track free-trial users and their paid subscription conversion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData()}
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
            <p className="text-sm font-medium text-slate-500">Total Trials</p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">In Trial</p>
            <p className="mt-3 text-2xl font-semibold text-blue-700">
              {inTrialCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">Converted</p>
            <p className="mt-3 text-2xl font-semibold text-emerald-700">
              {convertedCount}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm font-medium text-slate-500">
              Conversion Rate
            </p>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {conversionPercent}%
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
                onChange={(event) => handleSearchChange(event.target.value)}
                placeholder="Search studio, email or phone..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={status}
              onChange={(event) => handleStatusChange(event.target.value)}
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
                  <th className="px-5 py-4">Studio</th>
                  <th className="px-5 py-4">Trial Period</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Paid Plan</th>
                  <th className="px-5 py-4">Converted</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading trial conversion data...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No trial conversion records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.trial_subscription_id}>
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {item.studio_name ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.contact_email ?? item.contact_phone ?? "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-700">
                          <CalendarClock className="h-4 w-4 text-slate-400" />
                          {formatDate(item.trial_start_at)}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Ends {formatDate(item.trial_end_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            item.conversion_status,
                          )}`}
                        >
                          <StatusIcon status={item.conversion_status} />
                          {statusLabel(item.conversion_status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        {item.paid_plan_name ? (
                          <>
                            <div className="font-medium text-slate-900">
                              {item.paid_plan_name}
                            </div>
                            <div className="mt-1 text-xs text-slate-500">
                              ₹{Number(item.paid_plan_price).toLocaleString(
                                "en-IN",
                              )}{" "}
                              · {item.paid_status ?? "—"}
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-slate-400">—</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.converted_at)}
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
                onClick={() => setOffset(Math.max(0, offset - limit))}
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

        <div className="text-xs text-slate-400">
          Expired trials are determined from the trial end date; conversion is
          based on a subsequent paid subscription for the same studio.
        </div>
      </div>
    </div>
  );
}
