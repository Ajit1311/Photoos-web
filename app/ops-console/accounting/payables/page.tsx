"use client";

import { useCallback, useEffect, useState } from "react";
import {
  ArrowDownToLine,
  CheckCircle2,
  Clock3,
  FileText,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import {
  getPlatformAdminPayables,
  type PlatformAdminPayables,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function dateText(value: string) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function PayablesPage() {
  const [data, setData] = useState<PlatformAdminPayables | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  const limit = 50;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPlatformAdminPayables({
        dateFrom,
        dateTo,
        search: search.trim() || undefined,
        status: status || undefined,
        limit,
        offset: page * limit,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load payables"
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, status, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary;
  const items = data?.items ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-slate-500">
            <Wallet className="h-4 w-4" />
            Billing & Revenue / Accounting
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Payables
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track outstanding expenses, approved payables and settled
            payments across all studios.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-5">
          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              From
            </span>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              To
            </span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
            />
          </label>

          <label className="block md:col-span-2 lg:col-span-2">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Search
            </span>

            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(0);
                }}
                placeholder="Expense no., title, category, studio..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Status
            </span>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All statuses</option>
              <option value="submitted">Submitted</option>
              <option value="approved">Approved</option>
              <option value="paid">Paid</option>
            </select>
          </label>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Total Payable"
          value={money(summary?.total_payable ?? 0, summary?.currency)}
          icon={<Wallet className="h-5 w-5" />}
          tone="amber"
        />

        <KpiCard
          label="Total Paid"
          value={money(summary?.total_paid ?? 0, summary?.currency)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="green"
        />

        <KpiCard
          label="Submitted"
          value={String(summary?.submitted_count ?? 0)}
          icon={<Clock3 className="h-5 w-5" />}
          tone="blue"
        />

        <KpiCard
          label="Approved"
          value={String(summary?.approved_count ?? 0)}
          icon={<FileText className="h-5 w-5" />}
          tone="violet"
        />
      </div>

      {/* Secondary summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <SummaryBox
          label="Total Expenses"
          value={money(summary?.total_expenses ?? 0, summary?.currency)}
        />
        <SummaryBox
          label="Total Tax"
          value={money(summary?.total_tax ?? 0, summary?.currency)}
        />
        <SummaryBox
          label="Paid Entries"
          value={String(summary?.paid_count ?? 0)}
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Payables Ledger
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              {data?.total ?? 0} records
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <Th>Expense</Th>
                <Th>Studio</Th>
                <Th>Category</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th align="right">Amount</Th>
                <Th align="right">Tax</Th>
                <Th align="right">Total</Th>
                <Th align="right">Outstanding Days</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading payables...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {item.expense_number}
                      </div>
                      <div className="mt-1 max-w-[220px] truncate text-xs text-slate-500">
                        {item.title}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {item.studio_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.category || "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {dateText(item.expense_date)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-700">
                      {money(item.amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {money(item.tax_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {money(item.total_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {item.status === "paid"
                        ? "Settled"
                        : `${item.days_outstanding} days`}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-14 text-center"
                  >
                    <Wallet className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No payables found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      No submitted, approved or paid expenses match the
                      selected filters.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
          <span className="text-xs text-slate-500">
            Showing{" "}
            {items.length ? (data?.offset ?? 0) + 1 : 0}–{" "}
            {items.length
              ? (data?.offset ?? 0) + items.length
              : 0}{" "}
            of {data?.total ?? 0}
          </span>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0 || loading}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                loading ||
                !data ||
                data.offset + items.length >= data.total
              }
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon,
  tone,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  tone: "amber" | "green" | "blue" | "violet";
}) {
  const tones = {
    amber: "bg-amber-50 text-amber-700",
    green: "bg-emerald-50 text-emerald-700",
    blue: "bg-blue-50 text-blue-700",
    violet: "bg-violet-50 text-violet-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {value}
          </p>
        </div>

        <div className={`rounded-lg p-2.5 ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </div>
  );
}

function SummaryBox({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-slate-900">{value}</p>
    </div>
  );
}

function Th({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500 ${
        align === "right" ? "text-right" : "text-left"
      }`}
    >
      {children}
    </th>
  );
}

function StatusBadge({ status }: { status: string | null }) {
  const normalized = status || "unknown";

  const classes =
    normalized === "paid"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "approved"
        ? "bg-blue-50 text-blue-700"
        : normalized === "submitted"
          ? "bg-amber-50 text-amber-700"
          : "bg-slate-100 text-slate-600";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}
