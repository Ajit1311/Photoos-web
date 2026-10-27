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
  getPlatformAdminActiveSubscriptions,
  type PlatformAdminActiveSubscription,
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

export default function ActiveSubscriptionsPage() {
  const [items, setItems] = useState<
    PlatformAdminActiveSubscription[]
  >([])

  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("active")
  const [planCode, setPlanCode] = useState("all")
  const [billingCycle, setBillingCycle] = useState("all")
  const [autoRenew, setAutoRenew] = useState("all")

  const [page, setPage] = useState(0)

  const [selected, setSelected] =
    useState<PlatformAdminActiveSubscription | null>(null)

  async function loadSubscriptions(
    showRefresh = false,
  ) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result =
        await getPlatformAdminActiveSubscriptions({
          search,
          status,
          planCode,
          billingCycle,
          ...(autoRenew === "all"
            ? {}
            : {
                autoRenew: autoRenew === "true",
              }),
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
    void loadSubscriptions()
  }, [
    page,
    status,
    planCode,
    billingCycle,
    autoRenew,
  ])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0)
      void loadSubscriptions()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const stats = useMemo(() => {
    const monthly = items.filter(
      (item) => item.billing_cycle === "monthly",
    ).length

    const yearly = items.filter(
      (item) => item.billing_cycle === "yearly",
    ).length

    const autoRenewEnabled = items.filter(
      (item) => item.auto_renew === true,
    ).length

    const revenue = items.reduce(
      (sum, item) =>
        sum +
        (item.plan_price == null
          ? 0
          : Number(item.plan_price)),
      0,
    )

    return {
      monthly,
      yearly,
      autoRenewEnabled,
      revenue,
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

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <CreditCard className="h-4 w-4" />
              Platform / Billing
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Active Subscriptions
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor active PhotoOS software subscriptions,
              billing cycles, renewals and payment status.
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

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Active Subscriptions"
            value={total}
          />

          <StatCard
            label="Monthly Billing"
            value={stats.monthly}
          />

          <StatCard
            label="Yearly Billing"
            value={stats.yearly}
          />

          <StatCard
            label="Auto-Renew Enabled"
            value={stats.autoRenewEnabled}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search studio, owner, email or subscription ID..."
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
              <option value="active">Active</option>
              <option value="trial">Trial</option>
              <option value="cancelled">Cancelled</option>
              <option value="expired">Expired</option>
              <option value="all">All Status</option>
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
            </select>

            <select
              value={billingCycle}
              onChange={(event) => {
                setBillingCycle(event.target.value)
                setPage(0)
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All Cycles</option>
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
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1350px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Price</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Next Billing</th>
                  <th className="px-5 py-3">Payment</th>
                  <th className="px-5 py-3">Auto Renew</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, row) => (
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
                          {item.studio_name ||
                            "Unnamed Studio"}
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
                          {item.subscription_status ||
                            "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(
                          item.next_billing_at,
                        )}
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <CheckCircle2 className="h-4 w-4" />
                          {item.last_payment_status ||
                            "—"}
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
                          onClick={() =>
                            setSelected(item)
                          }
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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <CreditCard className="h-5 w-5 text-slate-700" />
      </div>

      <div className="mt-5 text-2xl font-bold text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {label}
      </div>
    </div>
  )
}

function SubscriptionDrawer({
  item,
  onClose,
}: {
  item: PlatformAdminActiveSubscription
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close subscription details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Subscription Details
            </div>

            <h2 className="mt-1 text-lg font-bold text-slate-950">
              {item.plan_name || "Subscription"}
            </h2>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-5 p-5">

          <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-xs font-medium text-slate-500">
                  Studio
                </div>

                <div className="mt-1 font-bold text-slate-950">
                  {item.studio_name || "—"}
                </div>

                <div className="mt-1 text-xs text-slate-500">
                  {item.studio_code || "—"}
                </div>
              </div>

              <span
                className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(
                  item.subscription_status,
                )}`}
              >
                {item.subscription_status || "—"}
              </span>
            </div>
          </section>

          <DetailSection title="Plan & Billing">
            <DetailRow
              label="Plan"
              value={item.plan_name}
            />
            <DetailRow
              label="Plan Code"
              value={item.plan_code}
            />
            <DetailRow
              label="Price"
              value={formatMoney(
                item.plan_price,
                item.plan_currency,
              )}
            />
            <DetailRow
              label="Billing Cycle"
              value={item.billing_cycle}
            />
            <DetailRow
              label="Auto Renew"
              value={
                item.auto_renew
                  ? "Enabled"
                  : "Disabled"
              }
            />
            <DetailRow
              label="Next Billing"
              value={formatDate(
                item.next_billing_at,
              )}
            />
          </DetailSection>

          <DetailSection title="Subscription Period">
            <DetailRow
              label="Subscription Start"
              value={formatDate(
                item.subscription_start_at,
              )}
              icon={
                <CalendarDays className="h-3.5 w-3.5" />
              }
            />
            <DetailRow
              label="Subscription End"
              value={formatDate(
                item.subscription_end_at,
              )}
            />
            <DetailRow
              label="Created"
              value={formatDate(item.created_at)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(item.updated_at)}
            />
          </DetailSection>

          <DetailSection title="Owner">
            <DetailRow
              label="Name"
              value={item.owner_name}
              icon={
                <UserRound className="h-3.5 w-3.5" />
              }
            />
            <DetailRow
              label="Email"
              value={item.owner_email}
              icon={
                <Mail className="h-3.5 w-3.5" />
              }
            />
            <DetailRow
              label="Profile ID"
              value={item.owner_profile_id}
            />
            <DetailRow
              label="Employee Code"
              value={item.owner_employee_code}
            />
          </DetailSection>

          <DetailSection title="Payment">
            <DetailRow
              label="Payment Status"
              value={item.last_payment_status}
            />
            <DetailRow
              label="Payment Provider"
              value={item.payment_provider}
            />
            <DetailRow
              label="Last Payment"
              value={formatDate(
                item.last_payment_at,
              )}
            />
            <DetailRow
              label="Payment ID"
              value={item.latest_payment_id}
            />
            <DetailRow
              label="Invoice ID"
              value={item.current_invoice_id}
            />
          </DetailSection>

          <DetailSection title="Trial Information">
            <DetailRow
              label="Trial Days"
              value={
                item.trial_days == null
                  ? null
                  : `${item.trial_days} days`
              }
            />
            <DetailRow
              label="Trial Start"
              value={formatDate(
                item.trial_start_at,
              )}
            />
            <DetailRow
              label="Trial End"
              value={formatDate(
                item.trial_end_at,
              )}
            />
          </DetailSection>

          <DetailSection title="System">
            <DetailRow
              label="Subscription ID"
              value={item.subscription_id}
            />
            <DetailRow
              label="Studio ID"
              value={item.studio_id}
            />
            <DetailRow
              label="Plan ID"
              value={item.plan_id}
            />
            <DetailRow
              label="Provider Subscription"
              value={item.provider_subscription_id}
            />
          </DetailSection>

        </div>
      </aside>
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
    <section className="rounded-2xl border border-slate-200 p-4">
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <div className="divide-y divide-slate-100">
        {children}
      </div>
    </section>
  )
}

function DetailRow({
  label,
  value,
  icon,
}: {
  label: string
  value: string | null | undefined
  icon?: React.ReactNode
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <span className="flex shrink-0 items-center gap-1.5 text-xs font-medium text-slate-500">
        {icon}
        {label}
      </span>

      <span className="max-w-[65%] break-all text-right text-xs font-semibold text-slate-800">
        {value || "—"}
      </span>
    </div>
  )
}
