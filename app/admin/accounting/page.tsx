"use client"

import {
  BarChart3,
  CalendarDays,
  CreditCard,
  FileText,
  Receipt,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react"
import { useEffect, useMemo, useState } from "react"

import {
  getPlatformAdminAccountingDashboard,
  type PlatformAdminAccountingDashboard,
} from "@/lib/api/platform-admin"

function formatMoney(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatMonth(value: string) {
  const date = new Date(`${value}-01T00:00:00`)
  return new Intl.DateTimeFormat("en-IN", {
    month: "short",
    year: "numeric",
  }).format(date)
}

function StatCard({
  label,
  value,
  detail,
  icon: Icon,
}: {
  label: string
  value: string
  detail: string
  icon: typeof Wallet
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500">
            {label}
          </p>

          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {value}
          </p>

          <p className="mt-1 text-xs text-slate-400">
            {detail}
          </p>
        </div>

        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>
    </div>
  )
}

function MetricRow({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: string
  icon: typeof Wallet
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-slate-100 py-3 last:border-0">
      <div className="flex min-w-0 items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2">
          <Icon className="h-4 w-4 text-slate-600" />
        </div>
        <span className="truncate text-sm text-slate-600">
          {label}
        </span>
      </div>

      <span className="shrink-0 text-sm font-semibold text-slate-950">
        {value}
      </span>
    </div>
  )
}

export default function PlatformAdminAccountingDashboardPage() {
  const [data, setData] =
    useState<PlatformAdminAccountingDashboard | null>(null)

  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date()
    date.setDate(date.getDate() - 30)
    return date.toISOString().slice(0, 10)
  })

  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  )

  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadDashboard(showRefresh = false) {
    try {
      setError(null)

      if (showRefresh) {
        setRefreshing(true)
      } else {
        setLoading(true)
      }

      const result =
        await getPlatformAdminAccountingDashboard({
          dateFrom,
          dateTo,
        })

      setData(result)
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load accounting dashboard.",
      )
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    void loadDashboard()
  }, [dateFrom, dateTo])

  const summary = data?.summary

  const maxTrendValue = useMemo(() => {
    const values =
      data?.monthly_trend.flatMap((item) => [
        Number(item.revenue || 0),
        Number(item.expenses || 0),
      ]) ?? []

    return Math.max(...values, 1)
  }, [data])

  const profitMargin =
    summary && summary.net_revenue > 0
      ? (summary.profit / summary.net_revenue) * 100
      : 0

  return (
    <main className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-slate-700" />
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Accounting Dashboard
              </h1>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              Revenue, expenses, tax, refunds and financial performance.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
              <CalendarDays className="h-4 w-4 text-slate-400" />

              <input
                type="date"
                value={dateFrom}
                onChange={(event) =>
                  setDateFrom(event.target.value)
                }
                className="bg-transparent text-sm text-slate-700 outline-none"
              />

              <span className="text-slate-300">→</span>

              <input
                type="date"
                value={dateTo}
                onChange={(event) =>
                  setDateTo(event.target.value)
                }
                className="bg-transparent text-sm text-slate-700 outline-none"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadDashboard(true)}
              disabled={loading || refreshing}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCw
                className={[
                  "h-4 w-4",
                  refreshing ? "animate-spin" : "",
                ].join(" ")}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {loading && !data ? (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div
                key={index}
                className="h-32 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : (
          <>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <StatCard
                label="Total Revenue"
                value={formatMoney(
                  summary?.total_revenue ?? 0,
                  data?.currency,
                )}
                detail={`${summary?.payment_count ?? 0} completed payments`}
                icon={TrendingUp}
              />

              <StatCard
                label="Net Revenue"
                value={formatMoney(
                  summary?.net_revenue ?? 0,
                  data?.currency,
                )}
                detail="After completed refunds"
                icon={Wallet}
              />

              <StatCard
                label="Total Expenses"
                value={formatMoney(
                  summary?.total_expenses ?? 0,
                  data?.currency,
                )}
                detail={`${summary?.expense_count ?? 0} expenses`}
                icon={TrendingDown}
              />

              <StatCard
                label="Net Profit"
                value={formatMoney(
                  summary?.profit ?? 0,
                  data?.currency,
                )}
                detail={`${profitMargin.toFixed(1)}% net margin`}
                icon={BarChart3}
              />

              <StatCard
                label="Tax Collected"
                value={formatMoney(
                  summary?.total_tax ?? 0,
                  data?.currency,
                )}
                detail="Recorded transaction tax"
                icon={Receipt}
              />

              <StatCard
                label="Refunds"
                value={formatMoney(
                  summary?.total_refunds ?? 0,
                  data?.currency,
                )}
                detail={`${summary?.refund_count ?? 0} completed refunds`}
                icon={TrendingDown}
              />

              <StatCard
                label="Invoices"
                value={String(summary?.invoice_count ?? 0)}
                detail="Invoices in selected period"
                icon={FileText}
              />

              <StatCard
                label="Payments"
                value={String(summary?.payment_count ?? 0)}
                detail="Completed incoming payments"
                icon={CreditCard}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-[minmax(0,1.7fr)_minmax(320px,0.8fr)]">
              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h2 className="text-base font-semibold text-slate-950">
                      Revenue & Expense Trend
                    </h2>
                    <p className="mt-1 text-xs text-slate-400">
                      Monthly accounting performance.
                    </p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-900" />
                      Revenue
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
                      Expenses
                    </span>
                  </div>
                </div>

                <div className="mt-8 space-y-5">
                  {data?.monthly_trend.map((item) => {
                    const revenueWidth =
                      (Number(item.revenue) /
                        maxTrendValue) *
                      100

                    const expenseWidth =
                      (Number(item.expenses) /
                        maxTrendValue) *
                      100

                    return (
                      <div key={item.month}>
                        <div className="mb-2 flex items-center justify-between text-xs">
                          <span className="font-medium text-slate-600">
                            {formatMonth(item.month)}
                          </span>

                          <span className="text-slate-400">
                            Net{" "}
                            {formatMoney(
                              Number(item.net_revenue),
                              data.currency,
                            )}
                          </span>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="w-16 text-[11px] text-slate-400">
                              Revenue
                            </span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-900 transition-all"
                                style={{
                                  width: `${revenueWidth}%`,
                                }}
                              />
                            </div>
                            <span className="w-24 text-right text-xs font-semibold text-slate-700">
                              {formatMoney(
                                Number(item.revenue),
                                data.currency,
                              )}
                            </span>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="w-16 text-[11px] text-slate-400">
                              Expense
                            </span>
                            <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-slate-300 transition-all"
                                style={{
                                  width: `${expenseWidth}%`,
                                }}
                              />
                            </div>
                            <span className="w-24 text-right text-xs font-semibold text-slate-500">
                              {formatMoney(
                                Number(item.expenses),
                                data.currency,
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {!data?.monthly_trend.length && (
                    <div className="py-12 text-center text-sm text-slate-400">
                      No accounting activity in this period.
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div>
                  <h2 className="text-base font-semibold text-slate-950">
                    Financial Summary
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Selected accounting period.
                  </p>
                </div>

                <div className="mt-4">
                  <MetricRow
                    label="Gross Revenue"
                    value={formatMoney(
                      summary?.total_revenue ?? 0,
                      data?.currency,
                    )}
                    icon={TrendingUp}
                  />

                  <MetricRow
                    label="Refunds"
                    value={formatMoney(
                      summary?.total_refunds ?? 0,
                      data?.currency,
                    )}
                    icon={TrendingDown}
                  />

                  <MetricRow
                    label="Net Revenue"
                    value={formatMoney(
                      summary?.net_revenue ?? 0,
                      data?.currency,
                    )}
                    icon={Wallet}
                  />

                  <MetricRow
                    label="Expenses"
                    value={formatMoney(
                      summary?.total_expenses ?? 0,
                      data?.currency,
                    )}
                    icon={CreditCard}
                  />

                  <MetricRow
                    label="Tax"
                    value={formatMoney(
                      summary?.total_tax ?? 0,
                      data?.currency,
                    )}
                    icon={Receipt}
                  />

                  <MetricRow
                    label="Net Profit"
                    value={formatMoney(
                      summary?.profit ?? 0,
                      data?.currency,
                    )}
                    icon={BarChart3}
                  />
                </div>
              </section>
            </div>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-col gap-1">
                <h2 className="text-base font-semibold text-slate-950">
                  Accounting Operations
                </h2>
                <p className="text-xs text-slate-400">
                  Quick overview of the accounting modules available to the platform.
                </p>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {[
                  ["Sales / Revenue", "/admin/accounting/sales"],
                  ["Purchase / Expenses", "/admin/accounting/expenses"],
                  ["Invoices", "/admin/accounting/invoices"],
                  ["Tax / GST", "/admin/accounting/tax-gst"],
                ].map(([label, href]) => (
                  <a
                    key={href}
                    href={href}
                    className="rounded-xl border border-slate-200 p-4 transition hover:border-slate-300 hover:bg-slate-50"
                  >
                    <p className="text-sm font-semibold text-slate-800">
                      {label}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Open module →
                    </p>
                  </a>
                ))}
              </div>
            </section>
          </>
        )}
      </div>
    </main>
  )
}
