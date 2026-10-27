"use client";

import {
  ArrowLeft,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Search,
  UserRound,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformMarketingSignups,
  type PlatformMarketingSignup,
} from "@/lib/api/platform-admin";

const TYPE_OPTIONS = [
  { value: "", label: "All Signups" },
  { value: "studio", label: "Studio" },
  { value: "client", label: "Client" },
  { value: "other", label: "Other" },
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

function typeClass(type: string) {
  if (type === "studio") {
    return "bg-blue-50 text-blue-700";
  }

  if (type === "client") {
    return "bg-violet-50 text-violet-700";
  }

  return "bg-slate-100 text-slate-700";
}

function TypeIcon({ type }: { type: string }) {
  if (type === "studio") {
    return <Building2 className="h-4 w-4" />;
  }

  if (type === "client") {
    return <UserRound className="h-4 w-4" />;
  }

  return <Users className="h-4 w-4" />;
}

export default function MarketingSignupsPage() {
  const [items, setItems] = useState<PlatformMarketingSignup[]>([]);
  const [total, setTotal] = useState(0);
  const [hasMore, setHasMore] = useState(false);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [offset, setOffset] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const limit = 50;

  const loadSignups = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await getPlatformMarketingSignups({
        search,
        type,
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
          : "Unable to load marketing signups.",
      );
    } finally {
      setLoading(false);
    }
  }, [search, type, offset]);

  useEffect(() => {
    void loadSignups();
  }, [loadSignups]);

  function handleSearchChange(value: string) {
    setSearch(value);
    setOffset(0);
  }

  function handleTypeChange(value: string) {
    setType(value);
    setOffset(0);
  }

  const pageStart = total === 0 ? 0 : offset + 1;
  const pageEnd = Math.min(offset + items.length, total);

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        {/* Header */}
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
              <span>Signups</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Signups
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              All studio and client signups with QR and selfie activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSignups()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>

        {/* Summary */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Total Signups
              </p>
              <Users className="h-5 w-5 text-slate-400" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {total}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Studio Signups
              </p>
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {items.filter((item) => item.signup_type === "studio").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Client Signups
              </p>
              <UserRound className="h-5 w-5 text-violet-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {items.filter((item) => item.signup_type === "client").length}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">
                Marketing Eligible
              </p>
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="mt-3 text-2xl font-semibold text-slate-900">
              {items.filter((item) => item.marketing_eligible).length}
            </p>
          </div>
        </div>

        {/* Filters */}
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
                placeholder="Search name, phone or studio..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              />
            </div>

            <select
              value={type}
              onChange={(event) => handleTypeChange(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
            >
              {TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1100px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Signup</th>
                  <th className="px-5 py-4">Type</th>
                  <th className="px-5 py-4">Studio</th>
                  <th className="px-5 py-4">Signup Date</th>
                  <th className="px-5 py-4 text-center">QR</th>
                  <th className="px-5 py-4 text-center">Selfie</th>
                  <th className="px-5 py-4">Marketing</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      <td colSpan={7} className="px-5 py-6">
                        <div className="h-5 animate-pulse rounded bg-slate-100" />
                      </td>
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-5 py-16 text-center"
                    >
                      <Users className="mx-auto h-8 w-8 text-slate-300" />
                      <p className="mt-3 text-sm font-medium text-slate-600">
                        No signups found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try changing the search or filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.profile_id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div>
                          <p className="font-medium text-slate-900">
                            {item.full_name || "Unnamed User"}
                          </p>
                          <p className="mt-1 text-xs text-slate-500">
                            {item.phone || "No phone number"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${typeClass(
                            item.signup_type,
                          )}`}
                        >
                          <TypeIcon type={item.signup_type} />
                          {item.signup_type === "studio"
                            ? "Studio"
                            : item.signup_type === "client"
                              ? "Client"
                              : "Other"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div>
                          <p className="text-sm font-medium text-slate-800">
                            {item.studio_name || "—"}
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {item.role_code || "—"}
                          </p>
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.signup_at)}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                        {item.qr_scans}
                      </td>

                      <td className="px-5 py-4 text-center text-sm font-medium text-slate-700">
                        {item.selfie_scans}
                      </td>

                      <td className="px-5 py-4">
                        {item.marketing_eligible ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Eligible
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">
                            Not eligible
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-700">
                {pageStart}
              </span>
              {" – "}
              <span className="font-medium text-slate-700">
                {pageEnd}
              </span>
              {" of "}
              <span className="font-medium text-slate-700">
                {total}
              </span>
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={() =>
                  setOffset((current) => Math.max(0, current - limit))
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <button
                type="button"
                disabled={!hasMore || loading}
                onClick={() =>
                  setOffset((current) => current + limit)
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
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
