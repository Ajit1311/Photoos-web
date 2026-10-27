"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getPlatformAdminFailedPayments,
  type PlatformAdminFailedPayment,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatMoney(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function label(value: string | null) {
  if (!value) return "—";

  return value
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClass(status: string | null) {
  switch (status) {
    case "failed":
      return "border-red-200 bg-red-50 text-red-700";
    case "processing":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "pending":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "cancelled":
      return "border-slate-200 bg-slate-50 text-slate-600";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function FailedPaymentsPage() {
  const [items, setItems] = useState<PlatformAdminFailedPayment[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("failed");
  const [method, setMethod] = useState("");
  const [paymentMode, setPaymentMode] = useState("");
  const [paymentType, setPaymentType] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const [selected, setSelected] =
    useState<PlatformAdminFailedPayment | null>(null);

  async function loadPayments() {
    setLoading(true);
    setError(null);

    try {
      const result = await getPlatformAdminFailedPayments({
        search: search.trim() || undefined,
        status,
        method: method || undefined,
        paymentMode: paymentMode || undefined,
        paymentType: paymentType || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });

      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load failed payments.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadPayments();
  }, [
    page,
    status,
    method,
    paymentMode,
    paymentType,
    dateFrom,
    dateTo,
  ]);

  const stats = useMemo(() => {
    const amount = items.reduce(
      (sum, item) => sum + Number(item.total_amount || 0),
      0,
    );

    const tax = items.reduce(
      (sum, item) => sum + Number(item.tax_amount || 0),
      0,
    );

    return {
      failed: items.filter((x) => x.status === "failed").length,
      processing: items.filter((x) => x.status === "processing").length,
      pending: items.filter((x) => x.status === "pending").length,
      amount,
      tax,
    };
  }, [items]);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-red-600 p-2.5 text-white">
              <AlertCircle className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Failed Payments
              </h1>
              <p className="text-sm text-slate-500">
                Monitor failed, pending and processing payment attempts.
              </p>
            </div>
          </div>

          <button
            onClick={() => void loadPayments()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5">
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={<AlertCircle className="h-5 w-5" />}
          />
          <StatCard
            label="Processing"
            value={stats.processing}
            icon={<RefreshCw className="h-5 w-5" />}
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Current Page Amount"
            value={formatMoney(stats.amount)}
            icon={<CreditCard className="h-5 w-5" />}
          />
          <StatCard
            label="Current Page Tax"
            value={formatMoney(stats.tax)}
            icon={<CreditCard className="h-5 w-5" />}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-7">
            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(0);
                    void loadPayments();
                  }
                }}
                placeholder="Search studio, transaction, payment..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="failed">Failed</option>
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={method}
              onChange={(e) => {
                setMethod(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All Methods</option>
              <option value="upi">UPI</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="credit_card">Credit Card</option>
              <option value="debit_card">Debit Card</option>
              <option value="net_banking">Net Banking</option>
              <option value="cash">Cash</option>
              <option value="cheque">Cheque</option>
              <option value="wallet">Wallet</option>
              <option value="online_gateway">Online Gateway</option>
              <option value="other">Other</option>
            </select>

            <select
              value={paymentMode}
              onChange={(e) => {
                setPaymentMode(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none"
            >
              <option value="">All Modes</option>
              <option value="incoming">Incoming</option>
              <option value="outgoing">Outgoing</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Studio</th>
                  <th className="px-5 py-4">Payment</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Method</th>
                  <th className="px-5 py-4">Transaction</th>
                  <th className="px-5 py-4">Payment Date</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      Loading failed payments...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <CreditCard className="h-6 w-6" />
                        </div>
                        <div className="text-sm font-medium text-slate-800">
                          No failed payments
                        </div>
                        <div className="mt-1 text-sm text-slate-500">
                          There are currently no payment records matching
                          this filter.
                        </div>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-900">
                          {item.studio_name || "Unnamed Studio"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {item.owner_email || item.studio_email || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          #{item.payment_number ?? "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          {label(item.payment_type)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(item.status)}`}
                        >
                          {label(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {formatMoney(
                            Number(item.total_amount || 0),
                            item.currency || "INR",
                          )}
                        </div>
                        <div className="mt-1 text-xs text-slate-500">
                          Tax:{" "}
                          {formatMoney(
                            Number(item.tax_amount || 0),
                            item.currency || "INR",
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {label(item.method)}
                      </td>

                      <td className="px-5 py-4">
                        <span className="block max-w-[180px] truncate text-sm text-slate-700">
                          {item.transaction_id || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-700">
                        {formatDate(item.payment_date)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Eye className="h-4 w-4" />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <div className="text-sm text-slate-500">
              {total === 0
                ? "0 records"
                : `${page * PAGE_SIZE + 1}–${Math.min(
                    (page + 1) * PAGE_SIZE,
                    total,
                  )} of ${total}`}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 text-sm text-slate-600">
                {page + 1} / {totalPages}
              </span>

              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Payment Details
                </h2>
                <p className="text-xs text-slate-500">
                  {selected.id}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <DetailSection title="Studio">
                <DetailRow label="Studio" value={selected.studio_name} />
                <DetailRow label="Studio Code" value={selected.studio_code} />
                <DetailRow label="Email" value={selected.studio_email} />
                <DetailRow label="Owner" value={selected.owner_name} />
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow
                  label="Payment Number"
                  value={selected.payment_number?.toString()}
                />
                <DetailRow label="Status" value={label(selected.status)} />
                <DetailRow label="Type" value={label(selected.payment_type)} />
                <DetailRow label="Mode" value={label(selected.payment_mode)} />
                <DetailRow label="Method" value={label(selected.method)} />
                <DetailRow
                  label="Amount"
                  value={formatMoney(
                    Number(selected.amount || 0),
                    selected.currency || "INR",
                  )}
                />
                <DetailRow
                  label="Tax"
                  value={formatMoney(
                    Number(selected.tax_amount || 0),
                    selected.currency || "INR",
                  )}
                />
                <DetailRow
                  label="Total"
                  value={formatMoney(
                    Number(selected.total_amount || 0),
                    selected.currency || "INR",
                  )}
                />
                <DetailRow
                  label="Currency"
                  value={selected.currency}
                />
              </DetailSection>

              <DetailSection title="Transaction">
                <DetailRow
                  label="Transaction ID"
                  value={selected.transaction_id}
                />
                <DetailRow
                  label="Reference Type"
                  value={label(selected.reference_type)}
                />
                <DetailRow
                  label="Reference ID"
                  value={selected.reference_id}
                />
                <DetailRow
                  label="Invoice"
                  value={selected.invoice_number}
                />
              </DetailSection>

              <DetailSection title="Subscription">
                <DetailRow label="Plan" value={selected.plan_name} />
                <DetailRow label="Plan Code" value={selected.plan_code} />
                <DetailRow
                  label="Subscription Status"
                  value={label(selected.subscription_status)}
                />
                <DetailRow
                  label="Subscription ID"
                  value={selected.subscription_id}
                />
              </DetailSection>

              <DetailSection title="Dates">
                <DetailRow
                  label="Payment Date"
                  value={formatDate(selected.payment_date)}
                />
                <DetailRow
                  label="Due Date"
                  value={
                    selected.due_date
                      ? new Intl.DateTimeFormat("en-IN", {
                          dateStyle: "medium",
                          timeZone: "Asia/Kolkata",
                        }).format(new Date(selected.due_date))
                      : "—"
                  }
                />
                <DetailRow
                  label="Created"
                  value={formatDate(selected.created_at)}
                />
                <DetailRow
                  label="Updated"
                  value={formatDate(selected.updated_at)}
                />
              </DetailSection>

              {selected.notes && (
                <DetailSection title="Notes">
                  <div className="px-4 py-4 text-sm text-slate-700">
                    {selected.notes}
                  </div>
                </DetailSection>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number | string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
        <span className="text-xl font-semibold text-slate-900">
          {value}
        </span>
      </div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
    </div>
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
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h3>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
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
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[65%] break-all text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}
