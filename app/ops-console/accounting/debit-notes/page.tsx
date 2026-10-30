"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FilePlus2,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import {
  getPlatformAdminDebitNotes,
  type PlatformAdminDebitNotes,
} from "@/lib/api/platform-admin";

function money(value: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status) {
    case "approved":
      return "bg-emerald-50 text-emerald-700";
    case "paid":
      return "bg-blue-50 text-blue-700";
    case "refunded":
      return "bg-violet-50 text-violet-700";
    case "cancelled":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-700";
  }
}

export default function DebitNotesPage() {
  const [data, setData] = useState<PlatformAdminDebitNotes | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [offset, setOffset] = useState(0);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPlatformAdminDebitNotes({
        dateFrom,
        dateTo,
        search: search.trim() || undefined,
        status: status || undefined,
        paymentStatus: paymentStatus || undefined,
        limit: 50,
        offset,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load debit notes",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, status, paymentStatus, offset]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary;
  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const hasPrevious = offset > 0;
  const hasNext = offset + items.length < total;

  function applyFilters() {
    setOffset(0);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-100 p-2.5">
              <FilePlus2 className="h-5 w-5 text-slate-700" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Debit Notes
              </h1>
              <p className="text-sm text-slate-500">
                Monitor debit notes, adjustments and outstanding amounts.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Debit Notes</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary?.debit_note_count ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Total Debit</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.total_amount, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tax Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.tax_amount, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Balance</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.balance_amount, summary?.currency)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-6">
          <div className="xl:col-span-2">
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Search
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyFilters();
                }}
                placeholder="Debit note number or studio..."
                className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Status
            </label>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="sent">Sent</option>
              <option value="viewed">Viewed</option>
              <option value="approved">Approved</option>
              <option value="partially_paid">Partially Paid</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="cancelled">Cancelled</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              Payment
            </label>
            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setOffset(0);
              }}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            >
              <option value="">All</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="paid">Paid</option>
              <option value="overdue">Overdue</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={applyFilters}
            className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Subtotal</p>
          <p className="mt-2 text-lg font-semibold text-slate-900">
            {money(summary?.subtotal, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Paid Amount</p>
          <p className="mt-2 text-lg font-semibold text-emerald-700">
            {money(summary?.paid_amount, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Approved</p>
          <p className="mt-2 text-lg font-semibold text-blue-700">
            {summary?.approved_count ?? 0}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs text-slate-500">Refunded</p>
          <p className="mt-2 text-lg font-semibold text-violet-700">
            {summary?.refunded_count ?? 0}
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4 text-slate-500" />
            <h2 className="font-semibold text-slate-900">
              Debit Note Ledger
            </h2>
          </div>
          <span className="text-sm text-slate-500">
            {total} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1050px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Debit Note</th>
                <th className="px-5 py-3">Studio</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3">Payment</th>
                <th className="px-5 py-3 text-right">Subtotal</th>
                <th className="px-5 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right">Total</th>
                <th className="px-5 py-3 text-right">Balance</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading debit notes...
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No debit notes found.
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{item.invoice_number}
                    </td>

                    <td className="px-5 py-4 text-slate-700">
                      {item.studio_name}
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {dateLabel(item.invoice_date)}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}
                      >
                        {item.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {item.payment_status.replaceAll("_", " ")}
                    </td>

                    <td className="px-5 py-4 text-right text-slate-700">
                      {money(item.subtotal, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right text-slate-700">
                      {money(item.tax_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {money(item.total_amount, item.currency)}
                    </td>

                    <td className="px-5 py-4 text-right font-medium text-slate-900">
                      {money(item.balance_amount, item.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-4">
          <p className="text-sm text-slate-500">
            Showing {total === 0 ? 0 : offset + 1}–
            {Math.min(offset + items.length, total)} of {total}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={!hasPrevious || loading}
              onClick={() => setOffset((value) => Math.max(value - 50, 0))}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={!hasNext || loading}
              onClick={() => setOffset((value) => value + 50)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
