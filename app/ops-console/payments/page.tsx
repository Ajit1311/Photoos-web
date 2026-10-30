"use client"

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Eye,
  FileText,
  Mail,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  getPlatformAdminPayments,
  type PlatformAdminPayment,
} from "@/lib/api/platform-admin"

const PAGE_SIZE = 25

function formatDate(value: string | null) {
  if (!value) return "—"

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value))
}

function formatMoney(
  value: number | null,
  currency: string | null,
) {
  if (value == null) return "—"

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 2,
  }).format(Number(value))
}

function statusClass(status: string | null) {
  switch (status) {
    case "completed":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200"
    case "processing":
      return "bg-blue-50 text-blue-700 ring-blue-200"
    case "pending":
      return "bg-amber-50 text-amber-700 ring-amber-200"
    case "failed":
      return "bg-red-50 text-red-700 ring-red-200"
    case "cancelled":
      return "bg-slate-100 text-slate-600 ring-slate-200"
    case "refunded":
      return "bg-purple-50 text-purple-700 ring-purple-200"
    case "partially_refunded":
      return "bg-orange-50 text-orange-700 ring-orange-200"
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200"
  }
}

function titleCase(value: string | null) {
  if (!value) return "—"

  return value
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() + part.slice(1),
    )
    .join(" ")
}

function StatCard({
  label,
  value,
  icon: Icon,
  detail,
}: {
  label: string
  value: string | number
  icon: typeof CreditCard
  detail?: string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>
          {detail && (
            <p className="mt-1 text-xs text-slate-400">
              {detail}
            </p>
          )}
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

export default function PlatformAdminPaymentsPage() {
  const [items, setItems] = useState<PlatformAdminPayment[]>([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [method, setMethod] = useState("all")
  const [referenceType, setReferenceType] = useState("all")
  const [paymentMode, setPaymentMode] = useState("all")
  const [paymentType, setPaymentType] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [page, setPage] = useState(0)
  const [selected, setSelected] =
    useState<PlatformAdminPayment | null>(null)

  async function loadPayments(showRefresh = false) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await getPlatformAdminPayments({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        method: method === "all" ? undefined : method,
        referenceType:
          referenceType === "all"
            ? undefined
            : referenceType,
        paymentMode:
          paymentMode === "all"
            ? undefined
            : paymentMode,
        paymentType:
          paymentType === "all"
            ? undefined
            : paymentType,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })

      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load payments.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadPayments()
  }, [
    page,
    status,
    method,
    referenceType,
    paymentMode,
    paymentType,
    dateFrom,
    dateTo,
  ])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0)
      void loadPayments()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const stats = useMemo(() => {
    const completed = items.filter(
      (item) => item.status === "completed",
    )

    const pending = items.filter(
      (item) =>
        item.status === "pending" ||
        item.status === "processing",
    )

    const failed = items.filter(
      (item) =>
        item.status === "failed" ||
        item.status === "cancelled",
    )

    const received = completed.reduce(
      (sum, item) =>
        sum + Number(item.total_amount ?? item.amount ?? 0),
      0,
    )

    const tax = items.reduce(
      (sum, item) => sum + Number(item.tax_amount ?? 0),
      0,
    )

    return {
      completed: completed.length,
      pending: pending.length,
      failed: failed.length,
      received,
      tax,
    }
  }, [items])

  const totalPages = Math.max(
    1,
    Math.ceil(total / PAGE_SIZE),
  )

  const showingFrom =
    total === 0 ? 0 : page * PAGE_SIZE + 1

  const showingTo = Math.min(
    (page + 1) * PAGE_SIZE,
    total,
  )

  function resetFilters() {
    setSearch("")
    setStatus("all")
    setMethod("all")
    setReferenceType("all")
    setPaymentMode("all")
    setPaymentType("all")
    setDateFrom("")
    setDateTo("")
    setPage(0)
  }

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1700px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <CreditCard className="h-4 w-4" />
              Platform / Billing & Revenue
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Payments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor platform payments, collections,
              transactions, taxes and subscription billing.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPayments(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          <StatCard
            label="Total Payments"
            value={total}
            icon={CreditCard}
            detail="All matching records"
          />

          <StatCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            detail="Current page"
          />

          <StatCard
            label="Received"
            value={formatMoney(stats.received, "INR")}
            icon={CreditCard}
            detail="Current page"
          />

          <StatCard
            label="Pending"
            value={stats.pending}
            icon={CalendarDays}
            detail="Pending + processing"
          />

          <StatCard
            label="Tax"
            value={formatMoney(stats.tax, "INR")}
            icon={FileText}
            detail="Current page"
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
              <div className="relative min-w-0 flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search studio, email, transaction, payment or subscription ID..."
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
                />
              </div>

              <select
                value={status}
                onChange={(event) => {
                  setStatus(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Status</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="completed">Completed</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
                <option value="partially_refunded">
                  Partially Refunded
                </option>
              </select>

              <select
                value={method}
                onChange={(event) => {
                  setMethod(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="bank_transfer">
                  Bank Transfer
                </option>
                <option value="upi">UPI</option>
                <option value="credit_card">
                  Credit Card
                </option>
                <option value="debit_card">
                  Debit Card
                </option>
                <option value="net_banking">
                  Net Banking
                </option>
                <option value="cheque">Cheque</option>
                <option value="wallet">Wallet</option>
                <option value="online_gateway">
                  Online Gateway
                </option>
                <option value="other">Other</option>
              </select>

              <select
                value={referenceType}
                onChange={(event) => {
                  setReferenceType(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All References</option>
                <option value="invoice">Invoice</option>
                <option value="project">Project</option>
                <option value="booking">Booking</option>
                <option value="order">Order</option>
                <option value="client">Client</option>
                <option value="subscription">
                  Subscription
                </option>
                <option value="custom">Custom</option>
              </select>
            </div>

            <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center">
              <select
                value={paymentMode}
                onChange={(event) => {
                  setPaymentMode(event.target.value)
                  setPage(0)
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Modes</option>
                <option value="incoming">Incoming</option>
                <option value="outgoing">Outgoing</option>
              </select>

              <select
                value={paymentType}
                onChange={(event) => {
                  setPaymentType(event.target.value)
                  setPage(0)
                }}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Payment Types</option>
                <option value="advance">Advance</option>
                <option value="full_payment">
                  Full Payment
                </option>
                <option value="processing">Processing</option>
                <option value="refund">Refund</option>
                <option value="credit_note">
                  Credit Note
                </option>
                <option value="adjustment">Adjustment</option>
                <option value="other">Other</option>
              </select>

              <div className="flex items-center gap-2">
                <CalendarDays className="hidden h-4 w-4 text-slate-400 sm:block" />

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setPage(0)
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                />

                <span className="text-xs text-slate-400">
                  to
                </span>

                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setPage(0)
                  }}
                  className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
                />
              </div>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear
              </button>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1450px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Amount</th>
                  <th className="px-5 py-3">Method</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Payment Date</th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 7 }).map((_, row) => (
                    <tr key={row}>
                      {Array.from({ length: 9 }).map(
                        (_, cell) => (
                          <td
                            key={cell}
                            className="px-5 py-5"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        ),
                      )}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-5 py-16 text-center"
                    >
                      <div className="mx-auto flex max-w-sm flex-col items-center">
                        <CreditCard className="h-9 w-9 text-slate-300" />
                        <p className="mt-3 text-sm font-semibold text-slate-700">
                          No payments found
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          Try changing your search or filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          #{item.payment_number ?? "—"}
                        </div>

                        <div className="mt-0.5 max-w-[220px] truncate text-xs text-slate-500">
                          {item.transaction_id || item.id}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {item.studio_name ||
                            "Unnamed Studio"}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          {item.studio_email || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {item.plan_name || "—"}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {item.plan_code || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {formatMoney(
                            item.total_amount ??
                              item.amount,
                            item.currency,
                          )}
                        </div>

                        {Number(item.tax_amount ?? 0) > 0 && (
                          <div className="mt-0.5 text-xs text-slate-500">
                            Tax:{" "}
                            {formatMoney(
                              item.tax_amount,
                              item.currency,
                            )}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium capitalize text-slate-800">
                          {titleCase(item.method)}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {titleCase(item.payment_mode)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(
                            item.status,
                          )}`}
                        >
                          {titleCase(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium capitalize text-slate-800">
                          {titleCase(item.reference_type)}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {titleCase(item.payment_type)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.payment_date)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
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

          <div className="flex flex-col gap-3 border-t border-slate-100 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-500">
              Showing{" "}
              <span className="font-semibold text-slate-700">
                {showingFrom}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-slate-700">
                {showingTo}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">
                {total}
              </span>{" "}
              payments
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-xs font-semibold text-slate-500">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page >= totalPages - 1}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages - 1,
                      current + 1,
                    ),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/30 backdrop-blur-[2px]">
          <button
            type="button"
            aria-label="Close payment details"
            onClick={() => setSelected(null)}
            className="absolute inset-0 cursor-default"
          />

          <aside className="relative z-10 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                  Payment Details
                </p>
                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  #{selected.payment_number ?? "—"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-slate-500">
                      Total Amount
                    </p>
                    <p className="mt-1 text-3xl font-bold text-slate-950">
                      {formatMoney(
                        selected.total_amount ??
                          selected.amount,
                        selected.currency,
                      )}
                    </p>
                  </div>

                  <span
                    className={`inline-flex rounded-full px-3 py-1.5 text-xs font-semibold ring-1 ${statusClass(
                      selected.status,
                    )}`}
                  >
                    {titleCase(selected.status)}
                  </span>
                </div>
              </div>

              <DetailSection title="Studio">
                <DetailRow
                  label="Studio"
                  value={selected.studio_name}
                />
                <DetailRow
                  label="Email"
                  value={selected.studio_email}
                />
                <DetailRow
                  label="Studio ID"
                  value={selected.studio_id}
                  mono
                />
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
                <DetailRow
                  label="Amount"
                  value={formatMoney(
                    selected.amount,
                    selected.currency,
                  )}
                />
                <DetailRow
                  label="Total Amount"
                  value={formatMoney(
                    selected.total_amount,
                    selected.currency,
                  )}
                />
                <DetailRow
                  label="Tax"
                  value={formatMoney(
                    selected.tax_amount,
                    selected.currency,
                  )}
                />
                <DetailRow
                  label="Currency"
                  value={selected.currency}
                />
                <DetailRow
                  label="Method"
                  value={titleCase(selected.method)}
                />
                <DetailRow
                  label="Mode"
                  value={titleCase(selected.payment_mode)}
                />
                <DetailRow
                  label="Type"
                  value={titleCase(selected.payment_type)}
                />
                <DetailRow
                  label="Payment Date"
                  value={formatDate(selected.payment_date)}
                />
              </DetailSection>

              <DetailSection title="Reference">
                <DetailRow
                  label="Reference Type"
                  value={titleCase(
                    selected.reference_type,
                  )}
                />
                <DetailRow
                  label="Reference ID"
                  value={selected.reference_id}
                  mono
                />
                <DetailRow
                  label="Subscription ID"
                  value={selected.subscription_id}
                  mono
                />
                <DetailRow
                  label="Invoice"
                  value={
                    selected.invoice_number ||
                    selected.invoice_id
                  }
                />
                <DetailRow
                  label="Transaction ID"
                  value={selected.transaction_id}
                  mono
                />
              </DetailSection>

              <DetailSection title="Timeline">
                <DetailRow
                  label="Payment Date"
                  value={formatDate(selected.payment_date)}
                />
                <DetailRow
                  label="Created"
                  value={formatDate(selected.created_at)}
                />
                <DetailRow
                  label="Due Date"
                  value={selected.due_date || "—"}
                />
              </DetailSection>

              <DetailSection title="Plan">
                <DetailRow
                  label="Plan"
                  value={selected.plan_name}
                />
                <DetailRow
                  label="Plan Code"
                  value={selected.plan_code}
                  mono
                />
              </DetailSection>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}

function DetailSection({
  title,
  children,
}: {
  title: string
  children: React.ReactNode
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {children}
      </div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string | number | null
  mono?: boolean
}) {
  return (
    <div className="flex gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0">
      <span className="w-36 shrink-0 text-xs font-medium text-slate-500">
        {label}
      </span>

      <span
        className={`min-w-0 break-all text-right text-sm text-slate-800 ${
          mono ? "font-mono text-xs" : "font-medium"
        }`}
      >
        {value || "—"}
      </span>
    </div>
  )
}
