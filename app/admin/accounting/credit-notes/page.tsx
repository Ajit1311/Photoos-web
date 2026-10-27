"use client";

import { useCallback, useEffect, useState } from "react";
import {
  CheckCircle2,
  FileMinus2,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import {
  getPlatformAdminCreditNotes,
  type PlatformAdminCreditNotes,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0));
}

function dateText(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function CreditNotesPage() {
  const [data, setData] = useState<PlatformAdminCreditNotes | null>(null);
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
  const [paymentStatus, setPaymentStatus] = useState("");
  const [page, setPage] = useState(0);

  const limit = 50;

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPlatformAdminCreditNotes({
        dateFrom,
        dateTo,
        search: search.trim() || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        limit,
        offset: page * limit,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load credit notes"
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, status, paymentStatus, page]);

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
            <FileMinus2 className="h-4 w-4" />
            Billing & Revenue / Accounting
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Credit Notes
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Track issued credit notes, tax adjustments, balances and
            settlement status across all studios.
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
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-6">
          <label>
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

          <label>
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

          <label className="md:col-span-2">
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
                placeholder="Credit note no., studio, notes..."
                className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </label>

          <label>
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
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="refunded">Refunded</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>

          <label>
            <span className="mb-1 block text-xs font-medium text-slate-500">
              Payment Status
            </span>

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setPage(0);
              }}
              className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
            >
              <option value="">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="refunded">Refunded</option>
            </select>
          </label>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Credit Notes"
          value={String(summary?.credit_note_count ?? 0)}
          icon={<FileMinus2 className="h-5 w-5" />}
          tone="blue"
        />

        <KpiCard
          label="Total Credit"
          value={money(summary?.total_amount ?? 0, summary?.currency)}
          icon={<Wallet className="h-5 w-5" />}
          tone="amber"
        />

        <KpiCard
          label="Tax Amount"
          value={money(summary?.tax_amount ?? 0, summary?.currency)}
          icon={<Wallet className="h-5 w-5" />}
          tone="violet"
        />

        <KpiCard
          label="Balance"
          value={money(summary?.balance_amount ?? 0, summary?.currency)}
          icon={<CheckCircle2 className="h-5 w-5" />}
          tone="green"
        />
      </div>

      {/* Secondary summary */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <SummaryBox
          label="Subtotal"
          value={money(summary?.subtotal ?? 0, summary?.currency)}
        />

        <SummaryBox
          label="Paid Amount"
          value={money(summary?.paid_amount ?? 0, summary?.currency)}
        />

        <SummaryBox
          label="Approved"
          value={String(summary?.approved_count ?? 0)}
        />

        <SummaryBox
          label="Refunded"
          value={String(summary?.refunded_count ?? 0)}
        />
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Credit Notes Ledger
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            {data?.total ?? 0} credit note records
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1150px] text-left">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50">
                <Th>Credit Note</Th>
                <Th>Studio</Th>
                <Th>Date</Th>
                <Th>Status</Th>
                <Th>Payment</Th>
                <Th align="right">Subtotal</Th>
                <Th align="right">Tax</Th>
                <Th align="right">Total</Th>
                <Th align="right">Balance</Th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-sm text-slate-500"
                  >
                    Loading credit notes...
                  </td>
                </tr>
              ) : items.length ? (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        #{item.invoice_number}
                      </div>
                      <div className="mt-1 max-w-[240px] truncate text-xs text-slate-500">
                        {item.notes || "Credit note"}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-700">
                      {item.studio_name}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-600">
                      {dateText(item.invoice_date)}
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.status} />
                    </td>

                    <td className="px-5 py-4">
                      <StatusBadge status={item.payment_status} />
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-700">
                      {money(item.subtotal, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm text-slate-600">
                      {money(item.tax_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {money(item.total_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-semibold text-slate-900">
                      {money(item.balance_amount, item.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={9} className="px-5 py-14 text-center">
                    <FileMinus2 className="mx-auto h-9 w-9 text-slate-300" />
                    <p className="mt-3 text-sm font-medium text-slate-700">
                      No credit notes found
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      No credit notes match the selected filters.
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
                items.length === 0 ||
                (data.offset ?? 0) + items.length >= data.total
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
  tone: "blue" | "amber" | "violet" | "green";
}) {
  const tones = {
    blue: "bg-blue-50 text-blue-700",
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    green: "bg-emerald-50 text-emerald-700",
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

function StatusBadge({ status }: { status: string }) {
  const normalized = status || "unknown";

  const classes =
    normalized === "paid" || normalized === "refunded"
      ? "bg-emerald-50 text-emerald-700"
      : normalized === "approved"
        ? "bg-blue-50 text-blue-700"
        : normalized === "draft"
          ? "bg-slate-100 text-slate-600"
          : "bg-amber-50 text-amber-700";

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium capitalize ${classes}`}
    >
      {normalized.replaceAll("_", " ")}
    </span>
  );
}
