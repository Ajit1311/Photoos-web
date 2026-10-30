"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDownToLine,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  Eye,
  Filter,
  RefreshCw,
  Search,
  X,
} from "lucide-react";

import {
  getPlatformAdminRefunds,
  type PlatformAdminRefund,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 50;

function formatCurrency(amount: number | null, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function statusClass(status: string) {
  switch (status.toLowerCase()) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-600/20";
    case "failed":
      return "bg-red-50 text-red-700 ring-red-600/20";
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-500/20";
  }
}

export default function RefundsPage() {
  const [items, setItems] = useState<PlatformAdminRefund[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [method, setMethod] = useState("");
  const [gateway, setGateway] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<PlatformAdminRefund | null>(null);

  async function loadRefunds() {
    try {
      setLoading(true);
      setError(null);

      const result = await getPlatformAdminRefunds({
        search: search.trim() || undefined,
        status,
        method: method || undefined,
        gateway: gateway.trim() || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });

      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load refunds.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRefunds();
  }, [page, status, method, gateway, dateFrom, dateTo]);

  const completedAmount = useMemo(
    () =>
      items
        .filter((item) => item.status === "completed")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items],
  );

  const pendingAmount = useMemo(
    () =>
      items
        .filter((item) => item.status === "pending")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items],
  );

  const failedAmount = useMemo(
    () =>
      items
        .filter((item) => item.status === "failed")
        .reduce((sum, item) => sum + Number(item.amount || 0), 0),
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function applySearch() {
    setPage(0);
    void loadRefunds();
  }

  function clearFilters() {
    setSearch("");
    setStatus("all");
    setMethod("");
    setGateway("");
    setDateFrom("");
    setDateTo("");
    setPage(0);
  }

  return (
    <div className="min-h-full bg-slate-50">
      <div className="border-b border-slate-200 bg-white">
        <div className="px-6 py-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="flex items-center gap-2 text-sm text-slate-500">
                <CircleDollarSign className="h-4 w-4" />
                Billing & Revenue
                <span>/</span>
                Refunds
              </div>

              <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                Refunds
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor customer refunds, refund status, transactions and
                financial impact.
              </p>
            </div>

            <button
              type="button"
              onClick={() => void loadRefunds()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      <main className="space-y-6 p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total Refunds"
            value={String(total)}
            icon={<CircleDollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Completed"
            value={formatCurrency(completedAmount)}
            icon={<ArrowDownToLine className="h-5 w-5" />}
          />
          <StatCard
            label="Pending"
            value={formatCurrency(pendingAmount)}
            icon={<RefreshCw className="h-5 w-5" />}
          />
          <StatCard
            label="Failed"
            value={formatCurrency(failedAmount)}
            icon={<X className="h-5 w-5" />}
          />
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") applySearch();
                  }}
                  placeholder="Search refund #, payment #, studio, owner or transaction..."
                  className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none ring-0 placeholder:text-slate-400 focus:border-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={applySearch}
                className="h-10 rounded-lg bg-slate-900 px-5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Search
              </button>

              <button
                type="button"
                onClick={clearFilters}
                className="h-10 rounded-lg border border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Clear
              </button>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
              <FilterSelect
                value={status}
                onChange={(value) => {
                  setStatus(value);
                  setPage(0);
                }}
                options={[
                  ["all", "All Statuses"],
                  ["completed", "Completed"],
                  ["pending", "Pending"],
                  ["failed", "Failed"],
                  ["cancelled", "Cancelled"],
                ]}
              />

              <FilterSelect
                value={method}
                onChange={(value) => {
                  setMethod(value);
                  setPage(0);
                }}
                options={[
                  ["", "All Methods"],
                  ["upi", "UPI"],
                  ["bank_transfer", "Bank Transfer"],
                  ["credit_card", "Credit Card"],
                  ["debit_card", "Debit Card"],
                  ["cash", "Cash"],
                  ["cheque", "Cheque"],
                  ["online_gateway", "Online Gateway"],
                  ["other", "Other"],
                ]}
              />

              <input
                value={gateway}
                onChange={(event) => setGateway(event.target.value)}
                placeholder="Gateway"
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />

              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                />
              </label>

              <label className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value);
                    setPage(0);
                  }}
                  className="h-10 w-full rounded-lg border border-slate-200 pl-9 pr-3 text-sm"
                />
              </label>
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              Showing {items.length} of {total} refund records
            </div>
          </div>

          {error ? (
            <div className="m-4 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          ) : loading ? (
            <div className="p-12 text-center text-sm text-slate-500">
              Loading refunds...
            </div>
          ) : items.length === 0 ? (
            <div className="p-16 text-center">
              <CircleDollarSign className="mx-auto h-10 w-10 text-slate-300" />
              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                No refunds found
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Refund records will appear here when payments are refunded.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-[1200px] w-full">
                  <thead className="border-b border-slate-200 bg-slate-50">
                    <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      <th className="px-5 py-3">Refund</th>
                      <th className="px-5 py-3">Payment</th>
                      <th className="px-5 py-3">Studio</th>
                      <th className="px-5 py-3">Amount</th>
                      <th className="px-5 py-3">Method</th>
                      <th className="px-5 py-3">Status</th>
                      <th className="px-5 py-3">Refunded At</th>
                      <th className="px-5 py-3 text-right">Action</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <tr key={item.refund_id} className="hover:bg-slate-50/70">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            #{item.refund_number}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.gateway_transaction_id || "No gateway ID"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            #{item.payment_number ?? "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.payment_status || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {item.studio_name || "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.studio_email || item.owner_name || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-semibold text-slate-900">
                            {formatCurrency(item.amount, item.currency || "INR")}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            Payment{" "}
                            {formatCurrency(
                              item.payment_amount,
                              item.currency || "INR",
                            )}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-700">
                          {item.payment_method || item.payment_method_original || "—"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
                              item.status,
                            )}`}
                          >
                            {item.status}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {formatDate(item.refunded_at)}
                        </td>

                        <td className="px-5 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => setSelected(item)}
                            className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-medium text-slate-700 hover:bg-white"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
                <p className="text-sm text-slate-500">
                  Page {page + 1} of {totalPages}
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((value) => Math.max(0, value - 1))}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </button>

                  <button
                    type="button"
                    disabled={page >= totalPages - 1}
                    onClick={() => setPage((value) => value + 1)}
                    className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </>
          )}
        </section>
      </main>

      {selected ? (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/30">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Refund #{selected.refund_number}
                </h2>
                <p className="text-xs text-slate-500">
                  Payment #{selected.payment_number ?? "—"}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-xl border border-slate-200 p-5">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-500">Refund Amount</span>
                  <span className="text-xl font-semibold text-slate-900">
                    {formatCurrency(
                      selected.amount,
                      selected.currency || "INR",
                    )}
                  </span>
                </div>

                <div className="mt-3">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${statusClass(
                      selected.status,
                    )}`}
                  >
                    {selected.status}
                  </span>
                </div>
              </div>

              <DetailSection title="Studio">
                <DetailRow label="Studio" value={selected.studio_name} />
                <DetailRow label="Legal Name" value={selected.studio_legal_name} />
                <DetailRow label="Email" value={selected.studio_email} />
                <DetailRow label="Phone" value={selected.studio_phone} />
                <DetailRow label="Owner" value={selected.owner_name} />
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow
                  label="Payment Number"
                  value={
                    selected.payment_number
                      ? `#${selected.payment_number}`
                      : null
                  }
                />
                <DetailRow label="Payment Status" value={selected.payment_status} />
                <DetailRow
                  label="Payment Amount"
                  value={formatCurrency(
                    selected.payment_amount,
                    selected.currency || "INR",
                  )}
                />
                <DetailRow
                  label="Payment Method"
                  value={
                    selected.payment_method_original ||
                    selected.payment_method
                  }
                />
                <DetailRow
                  label="Transaction ID"
                  value={selected.payment_transaction_id}
                />
                <DetailRow
                  label="Payment Date"
                  value={formatDate(selected.payment_date)}
                />
              </DetailSection>

              <DetailSection title="Refund">
                <DetailRow label="Refund Number" value={`#${selected.refund_number}`} />
                <DetailRow label="Reason" value={selected.reason} />
                <DetailRow label="Notes" value={selected.notes} />
                <DetailRow label="Method" value={selected.payment_method} />
                <DetailRow label="Gateway" value={selected.gateway} />
                <DetailRow
                  label="Gateway Transaction"
                  value={selected.gateway_transaction_id}
                />
                <DetailRow
                  label="Refunded At"
                  value={formatDate(selected.refunded_at)}
                />
                <DetailRow
                  label="Created At"
                  value={formatDate(selected.created_at)}
                />
              </DetailSection>

              <DetailSection title="Subscription">
                <DetailRow label="Plan" value={selected.plan_name} />
                <DetailRow label="Plan Code" value={selected.plan_code} />
                <DetailRow
                  label="Subscription Status"
                  value={selected.subscription_status}
                />
              </DetailSection>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-500">{label}</span>
        <span className="text-slate-400">{icon}</span>
      </div>
      <div className="mt-2 text-xl font-semibold text-slate-900">{value}</div>
    </div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
    >
      {options.map(([optionValue, label]) => (
        <option key={optionValue} value={optionValue}>
          {label}
        </option>
      ))}
    </select>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="rounded-xl border border-slate-200 divide-y divide-slate-100">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | number | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-slate-800 break-words">
        {value || "—"}
      </span>
    </div>
  );
}
