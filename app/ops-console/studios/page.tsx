"use client"

import {
  Building2,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Mail,
  MapPin,
  RefreshCw,
  Search,
  UsersRound,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  getPlatformAdminStudios,
  type PlatformAdminStudio,
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

function initials(studio: PlatformAdminStudio) {
  const source =
    studio.studio_name ||
    studio.brand_name ||
    studio.owner_name ||
    "S"

  return source
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("")
}

export default function PlatformStudiosPage() {
  const [studios, setStudios] = useState<PlatformAdminStudio[]>([])
  const [total, setTotal] = useState(0)

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [status, setStatus] = useState("all")
  const [subscriptionStatus, setSubscriptionStatus] = useState("all")
  const [planCode, setPlanCode] = useState("all")
  const [page, setPage] = useState(0)

  const [selectedStudio, setSelectedStudio] =
    useState<PlatformAdminStudio | null>(null)

  async function loadStudios(showRefresh = false) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await getPlatformAdminStudios({
        search,
        status,
        subscriptionStatus,
        planCode,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })

      setStudios(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load platform studios.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadStudios()
  }, [page, status, subscriptionStatus, planCode])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0)
      void loadStudios()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const showingFrom = total === 0 ? 0 : page * PAGE_SIZE + 1
  const showingTo = Math.min((page + 1) * PAGE_SIZE, total)

  const stats = useMemo(() => {
    const active = studios.filter(
      (studio) => studio.studio_status === "active",
    ).length

    const activeSubscriptions = studios.filter(
      (studio) => studio.subscription_status === "active",
    ).length

    const trials = studios.filter(
      (studio) =>
        studio.subscription_status === "trial" ||
        studio.trial_end_at != null,
    ).length

    return {
      active,
      activeSubscriptions,
      trials,
    }
  }, [studios])

  return (
    <div className="min-h-full bg-slate-50/70 p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px] space-y-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
              <Building2 className="h-4 w-4" />
              Platform
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Studios
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage all PhotoOS studios, owners, subscriptions,
              plans and billing activity.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadStudios(true)}
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
            icon={Building2}
            label="Total Studios"
            value={total}
          />

          <StatCard
            icon={Building2}
            label="Active Studios"
            value={stats.active}
          />

          <StatCard
            icon={CreditCard}
            label="Active Subscriptions"
            value={stats.activeSubscriptions}
          />

          <StatCard
            icon={CircleDollarSign}
            label="Trial Studios"
            value={stats.trials}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 xl:flex-row xl:items-center">

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search studio, owner, email or code..."
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
              <option value="all">All Studio Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>

            <select
              value={subscriptionStatus}
              onChange={(event) => {
                setSubscriptionStatus(event.target.value)
                setPage(0)
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">All Subscriptions</option>
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
                Business Starter
              </option>
              <option value="business_starter_yearly">
                Business Starter Yearly
              </option>
            </select>
          </div>

          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Owner</th>
                  <th className="px-5 py-3">Members</th>
                  <th className="px-5 py-3">Plan</th>
                  <th className="px-5 py-3">Subscription</th>
                  <th className="px-5 py-3">Next Billing</th>
                  <th className="px-5 py-3">Created</th>
                  <th className="px-5 py-3 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : studios.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No studios found.
                    </td>
                  </tr>
                ) : (
                  studios.map((studio) => (
                    <tr
                      key={studio.studio_id}
                      className="transition hover:bg-slate-50/80"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-xs font-bold text-white">
                            {initials(studio)}
                          </div>

                          <div className="min-w-0">
                            <div className="truncate font-semibold text-slate-900">
                              {studio.studio_name || "Unnamed Studio"}
                            </div>

                            <div className="mt-0.5 text-xs text-slate-500">
                              {studio.studio_code || "No code"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {studio.owner_name || "—"}
                        </div>

                        <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
                          <Mail className="h-3.5 w-3.5" />
                          {studio.owner_email || "No email"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm font-semibold text-slate-700">
                          <UsersRound className="h-3.5 w-3.5" />
                          {studio.member_count}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-800">
                          {studio.plan_name || "No Plan"}
                        </div>

                        <div className="mt-0.5 text-xs text-slate-500">
                          {formatMoney(
                            studio.plan_price,
                            studio.plan_currency,
                          )}
                          {studio.billing_cycle
                            ? ` / ${studio.billing_cycle}`
                            : ""}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(
                            studio.subscription_status,
                          )}`}
                        >
                          {studio.subscription_status || "none"}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(studio.next_billing_at)}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(studio.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedStudio(studio)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
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
                  setPage((current) => Math.max(0, current - 1))
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
                    Math.min(totalPages - 1, current + 1),
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

      {selectedStudio && (
        <StudioDrawer
          studio={selectedStudio}
          onClose={() => setSelectedStudio(null)}
        />
      )}
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Building2
  label: string
  value: number
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
          <Icon className="h-5 w-5" />
        </div>

        <span className="text-xs font-medium text-slate-400">
          Platform
        </span>
      </div>

      <div className="mt-5 text-2xl font-bold tracking-tight text-slate-950">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">
        {label}
      </div>
    </div>
  )
}

function StudioDrawer({
  studio,
  onClose,
}: {
  studio: PlatformAdminStudio
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close studio details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Studio Details
            </div>

            <h2 className="mt-1 text-lg font-bold text-slate-950">
              {studio.studio_name || "Unnamed Studio"}
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
          <section className="rounded-2xl border border-slate-200 p-4">
            <div className="flex items-start gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-lg font-bold text-white">
                {initials(studio)}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="font-bold text-slate-950">
                  {studio.studio_name || "Unnamed Studio"}
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {studio.studio_code || "No studio code"}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${statusClass(
                      studio.studio_status,
                    )}`}
                  >
                    Studio: {studio.studio_status || "—"}
                  </span>

                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-semibold capitalize ring-1 ${statusClass(
                      studio.subscription_status,
                    )}`}
                  >
                    Subscription:{" "}
                    {studio.subscription_status || "—"}
                  </span>
                </div>
              </div>
            </div>
          </section>

          <DetailSection title="Owner">
            <DetailRow label="Name" value={studio.owner_name} />
            <DetailRow label="Email" value={studio.owner_email} />
            <DetailRow
              label="Profile ID"
              value={studio.owner_profile_id}
            />
            <DetailRow
              label="Membership"
              value={studio.owner_status}
            />
            <DetailRow
              label="Employee Code"
              value={studio.owner_employee_code}
            />
          </DetailSection>

          <DetailSection title="Studio Profile">
            <DetailRow label="Legal Name" value={studio.legal_name} />
            <DetailRow label="Brand Name" value={studio.brand_name} />
            <DetailRow label="Email" value={studio.studio_email} />
            <DetailRow label="Phone" value={studio.studio_phone} />
            <DetailRow
              label="Location"
              value={[
                studio.city,
                studio.state,
                studio.country,
              ]
                .filter(Boolean)
                .join(", ")}
              icon={<MapPin className="h-3.5 w-3.5" />}
            />
            <DetailRow
              label="Members"
              value={String(studio.member_count)}
              icon={<UsersRound className="h-3.5 w-3.5" />}
            />
          </DetailSection>

          <DetailSection title="Current Subscription">
            <DetailRow label="Plan" value={studio.plan_name} />
            <DetailRow label="Plan Code" value={studio.plan_code} />
            <DetailRow
              label="Price"
              value={formatMoney(
                studio.plan_price,
                studio.plan_currency,
              )}
            />
            <DetailRow
              label="Billing Cycle"
              value={studio.billing_cycle}
            />
            <DetailRow
              label="Status"
              value={studio.subscription_status}
            />
            <DetailRow
              label="Auto Renew"
              value={
                studio.auto_renew == null
                  ? null
                  : studio.auto_renew
                    ? "Enabled"
                    : "Disabled"
              }
            />
            <DetailRow
              label="Start"
              value={formatDate(studio.subscription_start_at)}
              icon={<CalendarDays className="h-3.5 w-3.5" />}
            />
            <DetailRow
              label="End"
              value={formatDate(studio.subscription_end_at)}
            />
            <DetailRow
              label="Next Billing"
              value={formatDate(studio.next_billing_at)}
            />
          </DetailSection>

          <DetailSection title="Trial">
            <DetailRow
              label="Trial Days"
              value={
                studio.trial_days == null
                  ? null
                  : `${studio.trial_days} days`
              }
            />
            <DetailRow
              label="Trial Start"
              value={formatDate(studio.trial_start_at)}
            />
            <DetailRow
              label="Trial End"
              value={formatDate(studio.trial_end_at)}
            />
          </DetailSection>

          <DetailSection title="Payment">
            <DetailRow
              label="Provider"
              value={studio.payment_provider}
            />
            <DetailRow
              label="Last Payment"
              value={formatDate(studio.last_payment_at)}
            />
            <DetailRow
              label="Payment Status"
              value={studio.last_payment_status}
              icon={<CreditCard className="h-3.5 w-3.5" />}
            />
          </DetailSection>

          <DetailSection title="System">
            <DetailRow
              label="Created"
              value={formatDate(studio.created_at)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(studio.updated_at)}
            />
            <DetailRow label="Studio ID" value={studio.studio_id} />
            <DetailRow
              label="Subscription ID"
              value={studio.subscription_id}
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
