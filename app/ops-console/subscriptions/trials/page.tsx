"use client"

import {
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  Mail,
  RefreshCw,
  Search,
  UserRound,
  X,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"
import {
  getPlatformAdminFreeTrials,
  type PlatformAdminFreeTrial,
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

function statusClass(status: string | null) {
  if (status === "trial") {
    return "bg-blue-50 text-blue-700 ring-blue-200"
  }

  return "bg-slate-50 text-slate-600 ring-slate-200"
}

export default function FreeTrialsPage() {
  const [items, setItems] = useState<
    PlatformAdminFreeTrial[]
  >([])

  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [search, setSearch] = useState("")
  const [planCode, setPlanCode] = useState("all")
  const [page, setPage] = useState(0)

  const [selected, setSelected] =
    useState<PlatformAdminFreeTrial | null>(null)

  async function loadTrials(showRefresh = false) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result = await getPlatformAdminFreeTrials({
        search,
        planCode,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      })

      setItems(result.items)
      setTotal(result.total)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load free trials.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadTrials()
  }, [page, planCode])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(0)
      void loadTrials()
    }, 350)

    return () => window.clearTimeout(timer)
  }, [search])

  const stats = useMemo(() => {
    const endingSoon = items.filter(
      (item) =>
        item.remaining_seconds <= 48 * 60 * 60,
    ).length

    const averageRemaining =
      items.length === 0
        ? 0
        : Math.round(
            items.reduce(
              (sum, item) =>
                sum + item.remaining_seconds,
              0,
            ) / items.length,
          )

    return {
      endingSoon,
      averageRemaining,
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
              <Clock3 className="h-4 w-4" />
              Platform
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
              Free Trials
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor active 7-day PhotoOS trials,
              expiry timelines and studios approaching
              conversion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadTrials(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
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
            label="Active Free Trials"
            value={total}
          />

          <StatCard
            label="Ending Within 48h"
            value={stats.endingSoon}
          />

          <StatCard
            label="Trial Package"
            value="7 Days"
          />

          <StatCard
            label="Average Time Remaining"
            value={formatRemaining(
              stats.averageRemaining,
            )}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">

          <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">

            <div className="relative min-w-0 flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search studio, owner, email or subscription ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={planCode}
              onChange={(event) => {
                setPlanCode(event.target.value)
                setPage(0)
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="all">
                All Trial Plans
              </option>
              <option value="photoos_free_trial_7_day">
                PhotoOS 7-Day Free Trial
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
                  <th className="px-5 py-3">
                    Studio
                  </th>
                  <th className="px-5 py-3">
                    Owner
                  </th>
                  <th className="px-5 py-3">
                    Trial Plan
                  </th>
                  <th className="px-5 py-3">
                    Remaining
                  </th>
                  <th className="px-5 py-3">
                    Trial Ends
                  </th>
                  <th className="px-5 py-3">
                    Status
                  </th>
                  <th className="px-5 py-3">
                    Started
                  </th>
                  <th className="px-5 py-3 text-right">
                    Action
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 6 }).map(
                    (_, row) => (
                      <tr key={row}>
                        {Array.from({
                          length: 8,
                        }).map((_, cell) => (
                          <td
                            key={cell}
                            className="px-5 py-5"
                          >
                            <div className="h-4 animate-pulse rounded bg-slate-100" />
                          </td>
                        ))}
                      </tr>
                    ),
                  )
                ) : items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-5 py-16 text-center text-sm text-slate-500"
                    >
                      No active free trials found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <TrialRow
                      key={item.subscription_id}
                      item={item}
                      onView={() =>
                        setSelected(item)
                      }
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-100 px-4 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              Showing {showingFrom}–{showingTo} of{" "}
              {total}
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
                disabled={
                  page + 1 >= totalPages
                }
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
        <TrialDrawer
          item={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}

function TrialRow({
  item,
  onView,
}: {
  item: PlatformAdminFreeTrial
  onView: () => void
}) {
  const [remaining, setRemaining] = useState(
    item.remaining_seconds,
  )

  useEffect(() => {
    setRemaining(item.remaining_seconds)

    const timer = window.setInterval(() => {
      setRemaining((current) =>
        Math.max(0, current - 1),
      )
    }, 1000)

    return () => window.clearInterval(timer)
  }, [item.remaining_seconds])

  return (
    <tr className="transition hover:bg-slate-50/80">
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
          FREE · {item.trial_days ?? 7} days
        </div>
      </td>

      <td className="px-5 py-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-blue-600" />

          <span className="font-bold text-slate-900">
            {formatRemaining(remaining)}
          </span>
        </div>
      </td>

      <td className="px-5 py-4 text-sm text-slate-600">
        {formatDate(item.trial_end_at)}
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

      <td className="px-5 py-4 text-sm text-slate-600">
        {formatDate(item.trial_start_at)}
      </td>

      <td className="px-5 py-4 text-right">
        <button
          type="button"
          onClick={onView}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
        >
          View
        </button>
      </td>
    </tr>
  )
}

function StatCard({
  label,
  value,
}: {
  label: string
  value: number | string
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100">
        <Clock3 className="h-5 w-5 text-slate-700" />
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

function TrialDrawer({
  item,
  onClose,
}: {
  item: PlatformAdminFreeTrial
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[80] flex justify-end">
      <button
        type="button"
        aria-label="Close trial details"
        onClick={onClose}
        className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px]"
      />

      <aside className="relative h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">

        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
              Free Trial
            </div>

            <h2 className="mt-1 text-lg font-bold text-slate-950">
              {item.studio_name ||
                "Trial Subscription"}
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

          <section className="rounded-2xl border border-blue-200 bg-blue-50 p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
              <Clock3 className="h-4 w-4" />
              Time Remaining
            </div>

            <div className="mt-2 text-3xl font-bold text-blue-950">
              {formatRemaining(
                item.remaining_seconds,
              )}
            </div>

            <div className="mt-1 text-xs text-blue-700">
              Expires {formatDate(item.trial_end_at)}
            </div>
          </section>

          <DetailSection title="Studio">
            <DetailRow
              label="Studio"
              value={item.studio_name}
            />
            <DetailRow
              label="Studio Code"
              value={item.studio_code}
            />
            <DetailRow
              label="Email"
              value={item.studio_email}
              icon={
                <Mail className="h-3.5 w-3.5" />
              }
            />
            <DetailRow
              label="Status"
              value={item.studio_status}
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
            />
            <DetailRow
              label="Profile ID"
              value={item.owner_profile_id}
            />
          </DetailSection>

          <DetailSection title="Trial Plan">
            <DetailRow
              label="Plan"
              value={item.plan_name}
            />
            <DetailRow
              label="Plan Code"
              value={item.plan_code}
            />
            <DetailRow
              label="Trial Duration"
              value={
                item.trial_days == null
                  ? null
                  : `${item.trial_days} days`
              }
            />
            <DetailRow
              label="Price"
              value="FREE"
            />
            <DetailRow
              label="Billing Cycle"
              value={item.billing_cycle}
            />
          </DetailSection>

          <DetailSection title="Trial Period">
            <DetailRow
              label="Started"
              value={formatDate(
                item.trial_start_at,
              )}
            />
            <DetailRow
              label="Expires"
              value={formatDate(
                item.trial_end_at,
              )}
            />
            <DetailRow
              label="Remaining Days"
              value={`${item.remaining_days} days`}
            />
            <DetailRow
              label="Remaining Seconds"
              value={String(
                item.remaining_seconds,
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
              label="Created"
              value={formatDate(item.created_at)}
            />
            <DetailRow
              label="Updated"
              value={formatDate(item.updated_at)}
            />
          </DetailSection>

          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-800">
            <div className="flex items-center gap-2 font-bold">
              <CheckCircle2 className="h-4 w-4" />
              Backend-authoritative trial
            </div>

            <p className="mt-1 leading-5">
              Trial status and expiry are resolved from
              the platform subscription data.
            </p>
          </div>
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

function formatRemaining(seconds: number) {
  const safe = Math.max(0, Math.floor(seconds))
  const days = Math.floor(safe / 86400)
  const hours = Math.floor((safe % 86400) / 3600)
  const minutes = Math.floor((safe % 3600) / 60)

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }

  return `${hours}h ${minutes}m`
}
