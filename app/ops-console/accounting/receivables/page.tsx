"use client";

import { useCallback, useEffect, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  Wallet,
} from "lucide-react";
import Link from "next/link";

import {
  getPlatformAdminReceivables,
  type PlatformAdminReceivables,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
}

function date(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function paymentBadge(value: string) {
  switch (value) {
    case "paid":
      return "bg-emerald-50 text-emerald-700";
    case "partial":
      return "bg-amber-50 text-amber-700";
    case "overdue":
      return "bg-red-50 text-red-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function ReceivablesPage() {
  const [data, setData] = useState<PlatformAdminReceivables | null>(null);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [offset, setOffset] = useState(0);

  const limit = 50;

  const load = useCallback(async () => {
    setLoading(true);

    try {
      const result = await getPlatformAdminReceivables({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: search.trim() || undefined,
        paymentStatus: paymentStatus || undefined,
        limit,
        offset,
      });

      setData(result);
    } catch (error) {
      console.error("Failed to load receivables:", error);
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo, search, paymentStatus, offset]);

  useEffect(() => {
    load();
  }, [load]);

  const summary = data?.summary;
  const totalPages = data
    ? Math.max(1, Math.ceil(data.total / limit))
    : 1;
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <Link
              href="/ops-console/accounting"
              className="mb-3 inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              <ArrowLeft className="h-4 w-4" />
              Accounting Dashboard
            </Link>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-900 text-white">
                <Wallet className="h-5 w-5" />
              </div>

              <div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900">
                  Receivables
                </h1>
                <p className="text-sm text-slate-500">
                  Outstanding invoices and customer receivables
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <Kpi
            icon={<FileText className="h-5 w-5" />}
            label="Outstanding Invoices"
            value={String(summary?.invoice_count ?? 0)}
          />

          <Kpi
            icon={<FileText className="h-5 w-5" />}
            label="Total Invoiced"
            value={money(
              summary?.total_invoiced ?? 0,
              summary?.currency,
            )}
          />

          <Kpi
            icon={<Wallet className="h-5 w-5" />}
            label="Total Paid"
            value={money(summary?.total_paid ?? 0, summary?.currency)}
          />

          <Kpi
            icon={<Clock3 className="h-5 w-5" />}
            label="Outstanding"
            value={money(
              summary?.total_outstanding ?? 0,
              summary?.currency,
            )}
          />

          <Kpi
            icon={<AlertCircle className="h-5 w-5" />}
            label="Overdue"
            value={money(
              summary?.overdue_amount ?? 0,
              summary?.currency,
            )}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") setOffset(0);
                }}
                placeholder="Search invoice / studio..."
                className="h-10 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setOffset(0);
              }}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setOffset(0);
              }}
              className="h-10 rounded-xl border border-slate-200 px-3 text-sm outline-none"
            />

            <select
              value={paymentStatus}
              onChange={(e) => {
                setPaymentStatus(e.target.value);
                setOffset(0);
              }}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm"
            >
              <option value="">All payment status</option>
              <option value="unpaid">Unpaid</option>
              <option value="partial">Partial</option>
              <option value="overdue">Overdue</option>
            </select>

            <button
              type="button"
              onClick={() => setOffset(0)}
              className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white hover:bg-slate-800"
            >
              Apply Filters
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1250px] w-full text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {[
                    "Invoice",
                    "Studio",
                    "Type",
                    "Payment",
                    "Invoice Date",
                    "Due Date",
                    "Days Overdue",
                    "Total",
                    "Paid",
                    "Outstanding",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <Loader2 className="mx-auto h-6 w-6 animate-spin text-slate-400" />
                      <p className="mt-2 text-sm text-slate-500">
                        Loading receivables...
                      </p>
                    </td>
                  </tr>
                ) : data?.items?.length ? (
                  data.items.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-50">
                      <td className="px-4 py-4 font-semibold text-slate-900">
                        #{item.invoice_number}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-700">
                        {item.studio_name}
                      </td>

                      <td className="px-4 py-4 text-sm capitalize text-slate-600">
                        {item.invoice_type.replaceAll("_", " ")}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ${paymentBadge(item.payment_status)}`}
                        >
                          {item.payment_status.replaceAll("_", " ")}
                        </span>
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {date(item.invoice_date)}
                      </td>

                      <td className="px-4 py-4 text-sm text-slate-600">
                        {date(item.due_date)}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold">
                        {item.days_overdue > 0 ? (
                          <span className="text-red-600">
                            {item.days_overdue} days
                          </span>
                        ) : (
                          <span className="text-emerald-600">Current</span>
                        )}
                      </td>

                      <td className="px-4 py-4 text-sm font-semibold text-slate-900">
                        {money(item.total_amount, item.currency)}
                      </td>

                      <td className="px-4 py-4 text-sm text-emerald-700">
                        {money(item.paid_amount, item.currency)}
                      </td>

                      <td className="px-4 py-4 text-sm font-bold text-amber-700">
                        {money(item.balance_amount, item.currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} className="px-6 py-16 text-center">
                      <Wallet className="mx-auto h-10 w-10 text-slate-300" />
                      <p className="mt-3 font-semibold text-slate-700">
                        No outstanding receivables
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        There are currently no invoices with an outstanding balance.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-4 py-3">
            <p className="text-sm text-slate-500">
              {data?.total ?? 0} outstanding invoices
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={() => setOffset(Math.max(0, offset - limit))}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-sm text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={!data || offset + limit >= data.total || loading}
                onClick={() => setOffset(offset + limit)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
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

function Kpi({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
        {icon}
      </div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
