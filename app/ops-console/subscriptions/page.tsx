"use client"

import {
  CalendarDays,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Mail,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  getPlatformAdminSubscriptions,
  type PlatformAdminSubscription,
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
    maximumFractionDigits: 0,
  }).format(value)
}

function statusClass(status: string | null) {
  switch (status) {
    case "active":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200"
    case "trial":
      return "bg-blue-50 text-blue-700 ring-blue-200"
    case "cancelled":
      return "bg-amber-50 text-amber-700 ring-amber-200"
    case "expired":
      return "bg-red-50 text-red-700 ring-red-200"
    default:
      return "bg-slate-50 text-slate-600 ring-slate-200"
  }
}

function paymentClass(status: string | null) {
  switch (status) {
    case "completed":
      return "text-emerald-700"
    case "failed":
      return "text-red-700"
    case "pending":
      return "text-amber-700"
    default:
      return "text-slate-500"
  }
}

export default function SubscriptionsPage() {
  const [items, setItems] = useState<PlatformAdminSubscription[]>([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [planCode, setPlanCode] = useState("all")
  const [billingCycle, setBillingCycle] = useState("all")
  const [autoRenew, setAutoRenew] = useState("all")
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")

  const [page, setPage] = useState(0)

  const [selected, setSelected] =
    useState<PlatformAdminSubscription | null>(null)

  async function loadSubscriptions(showRefresh = false) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await getPlatformAdminSubscriptions({
        search: search.trim() || undefined,
        status: status === "all" ? undefined : status,
        planCode: planCode === "all" ? undefined : planCode,
        billingCycle:
          billingCycle === "all"
            ? undefined
            : billingCycle,
        autoRenew:
          autoRenew === "all"
            ? null
            : autoRenew === "true",
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
          : "Unable to load subscriptions.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadSubscriptions()
    }, 250)

    return () => window.clearTimeout(timer)
  }, [
    search,
    status,
    planCode,
    billingCycle,
    autoRenew,
    dateFrom,
    dateTo,
    page,
  ])

  const stats = useMemo(() => {
    return {
      active: items.filter(
        (item) => item.subscription_status === "active",
      ).length,
      trial: items.filter(
        (item) => item.subscription_status === "trial",
      ).length,
      cancelled: items.filter(
        (item) => item.subscription_status === "cancelled",
      ).length,
      expired: items.filter(
        (item) => item.subscription_status === "expired",
      ).length,
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
    setPlanCode("all")
    setBillingCycle("all")
    setAutoRenew("all")
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
              Subscriptions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage and monitor all PhotoOS software subscriptions,
              trials, renewals, cancellations and billing lifecycle.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadSubscriptions(true)}
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
            label="All Subscriptions"
            value={total}
          />

          <StatCard
            label="Active"
            value={stats.active}
          />

          <StatCard
            label="Free Trials"
            value={stats.trial}
          />

          <StatCard
            label="Cancelled"
            value={stats.cancelled}
          />

          <StatCard
            label="Expired"
            value={stats.expired}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-4">
            <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-4">
              <div className="relative lg:col-span-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value)
                    setPage(0)
                  }}
                  placeholder="Search studio, owner, email, plan or subscription ID..."
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
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>

              <select
                value={planCode}
                onChange={(event) => {
                  setPlanCode(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Plans</option>
                <option value="business_starter_monthly">
                  Business Starter Monthly
                </option>
                <option value="business_starter_yearly">
                  Business Starter Yearly
                </option>
                <option value="photoos_free_trial_7_day">
                  PhotoOS 7-Day Free Trial
                </option>
              </select>

              <select
                value={billingCycle}
                onChange={(event) => {
                  setBillingCycle(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">All Billing Cycles</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
              </select>

              <select
                value={autoRenew}
                onChange={(event) => {
                  setAutoRenew(event.target.value)
                  setPage(0)
                }}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
              >
                <option value="all">Auto-Renew: All</option>
                <option value="true">Auto-Renew On</option>
                <option value="false">Auto-Renew Off</option>
              </select>

              <label className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(event) => {
                    setDateFrom(event.target.value)
                    setPage(0)
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none"
                />
              </label>

              <label className="relative">
                <CalendarDays className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="date"
                  value={dateTo}
                  onChange={(event) => {
                    setDateTo(event.target.value)
                    setPage(0)
                  }}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none"
                />
              </label>

              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Clear Filters
              </button>
            </div>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1650px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Start / End</th>
                  <th className="px-5 py-3">Next Billing</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Auto Renew</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 7 }).map((_, row) => (
                    <tr key={row}>
                      {Array.from({ length: 10 }).map(
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
                      colSpan={10}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No subscriptions found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.subscription_id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.studio_name || "Unnamed Studio"}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {item.studio_code || "No code"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {item.owner_name || "—"}
                        </div>
                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          {item.owner_email || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {item.plan_name || "—"}
                        </div>
                        <div className="mt-0.5 text-xs text-slate-500">
                          {item.billing_cycle || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">
                          {formatMoney(
                            item.plan_price,
                            item.plan_currency,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(
                            item.subscription_status,
                          )}`}
                        >
                          {item.subscription_status || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-xs text-slate-600">
                        <div>
                          <span className="font-semibold text-slate-700">
                            Start:
                          </span>{" "}
                          {formatDate(
                            item.subscription_start_at ||
                              item.trial_start_at,
                          )}
                        </div>

                        <div className="mt-1">
                          <span className="font-semibold text-slate-700">
                            End:
                          </span>{" "}
                          {formatDate(
                            item.subscription_end_at ||
                              item.trial_end_at,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.next_billing_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center gap-1.5 text-xs font-semibold capitalize ${paymentClass(
                            item.last_payment_status,
                          )}`}
                        >
                          {item.last_payment_status === "completed" && (
                            <CheckCircle2 className="h-4 w-4" />
                          )}
                          {item.last_payment_status || "No payment"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={
                            item.auto_renew
                              ? "text-xs font-semibold text-emerald-700"
                              : "text-xs font-semibold text-slate-500"
                          }
                        >
                          {item.auto_renew
                            ? "Enabled"
                            : "Disabled"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Showing {showingFrom}–{showingTo} of {total}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((current) =>
                    Math.max(0, current - 1),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-xs font-semibold text-slate-600">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={page + 1 >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      totalPages - 1,
                      current + 1,
                    ),
                  )
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <SubscriptionDrawer
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
        {label}
      </div>
      <div className="mt-2 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </div>
    </div>
  )
}

function SubscriptionDrawer({
  item,
  onClose,
}: {
  item: PlatformAdminSubscription
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Close subscription details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/30 backdrop-blur-[2px]"
      />

      <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-100 bg-white px-6 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subscription Details
            </div>
            <div className="mt-1 text-lg font-bold text-slate-950">
              {item.plan_name || "Subscription"}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-6 p-6">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Status
                </div>
                <span
                  className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(
                    item.subscription_status,
                  )}`}
                >
                  {item.subscription_status || "—"}
                </span>
              </div>

              <div className="text-right">
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Plan Price
                </div>
                <div className="mt-1 text-xl font-bold text-slate-950">
                  {formatMoney(
                    item.plan_price,
                    item.plan_currency,
                  )}
                </div>
              </div>
            </div>
          </div>

          <DetailSection
            title="Studio"
            icon={<CreditCard className="h-4 w-4" />}
            rows={[
              ["Studio", item.studio_name || "—"],
              ["Studio Code", item.studio_code || "—"],
              ["Studio Email", item.studio_email || "—"],
              ["Studio ID", item.studio_id],
            ]}
          />

          <DetailSection
            title="Owner"
            icon={<UserRound className="h-4 w-4" />}
            rows={[
              ["Owner", item.owner_name || "—"],
              ["Email", item.owner_email || "—"],
            ]}
          />

          <DetailSection
            title="Plan & Billing"
            icon={<CreditCard className="h-4 w-4" />}
            rows={[
              ["Plan", item.plan_name || "—"],
              ["Plan Code", item.plan_code || "—"],
              ["Billing Cycle", item.billing_cycle || "—"],
              ["Plan Type", item.plan_type || "—"],
              ["Trial Days", String(item.trial_days ?? 0)],
              [
                "Auto Renew",
                item.auto_renew ? "Enabled" : "Disabled",
              ],
            ]}
          />

          <DetailSection
            title="Lifecycle"
            icon={<CalendarDays className="h-4 w-4" />}
            rows={[
              [
                "Created",
                formatDate(item.created_at),
              ],
              [
                "Trial Start",
                formatDate(item.trial_start_at),
              ],
              [
                "Trial End",
                formatDate(item.trial_end_at),
              ],
              [
                "Subscription Start",
                formatDate(item.subscription_start_at),
              ],
              [
                "Subscription End",
                formatDate(item.subscription_end_at),
              ],
              [
                "Next Billing",
                formatDate(item.next_billing_at),
              ],
              [
                "Last Payment",
                formatDate(item.last_payment_at),
              ],
            ]}
          />

          <DetailSection
            title="Payment"
            icon={<CheckCircle2 className="h-4 w-4" />}
            rows={[
              [
                "Payment Status",
                item.last_payment_status || "—",
              ],
              ["Payment Provider", item.payment_provider || "—"],
              ["Payment ID", item.payment_id || "—"],
              [
                "Latest Payment ID",
                item.latest_payment_id || "—",
              ],
              [
                "Invoice ID",
                item.current_invoice_id || "—",
              ],
            ]}
          />

          <DetailSection
            title="Provider"
            icon={<CreditCard className="h-4 w-4" />}
            rows={[
              [
                "Provider Customer ID",
                item.provider_customer_id || "—",
              ],
              [
                "Provider Subscription ID",
                item.provider_subscription_id || "—",
              ],
            ]}
          />

          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Subscription ID
            </div>
            <div className="mt-2 break-all font-mono text-xs text-slate-600">
              {item.subscription_id}
            </div>
          </div>
        </div>
      </aside>
    </div>
  )
}

function DetailSection({
  title,
  icon,
  rows,
}: {
  title: string
  icon: React.ReactNode
  rows: Array<[string, string]>
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-900">
        <span className="text-slate-400">{icon}</span>
        {title}
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200">
        {rows.map(([label, value]) => (
          <div
            key={label}
            className="grid grid-cols-[150px_1fr] gap-4 border-b border-slate-100 px-4 py-3 last:border-b-0"
          >
            <div className="text-xs font-semibold text-slate-400">
              {label}
            </div>
            <div className="break-words text-sm font-medium text-slate-700">
              {value}
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
