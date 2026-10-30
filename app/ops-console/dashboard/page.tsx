"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarClock,
  CheckCircle2,
  ChevronRight,
  CircleDollarSign,
  CreditCard,
  Loader2,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import {
  getPlatformAdminDashboard,
  type PlatformAdminDashboard,
} from "@/lib/api/platform-admin";

function number(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
  ).format(value);
}

function currency(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(value);
}

function date(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(new Date(value));
}

function statusClass(
  status: string,
) {
  const normalized =
    status.toLowerCase();

  if (
    normalized === "active" ||
    normalized === "trial"
  ) {
    return "bg-emerald-50 text-emerald-700";
  }

  if (
    normalized === "cancelled" ||
    normalized === "expired"
  ) {
    return "bg-red-50 text-red-700";
  }

  return "bg-slate-100 text-slate-600";
}

type KpiProps = {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
};

function KpiCard({
  title,
  value,
  detail,
  icon: Icon,
}: KpiProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61]/8 text-[#0A3F61]">
          <Icon className="h-5 w-5" />
        </div>

        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <TrendingUp className="h-3.5 w-3.5" />
          Live
        </span>
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-slate-500">
          {title}
        </div>

        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          {detail}
        </div>
      </div>
    </div>
  );
}

function MiniBar({
  value,
}: {
  value: number;
}) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
      <div
        className="h-full rounded-full bg-[#0A3F61]"
        style={{
          width: `${Math.max(
            4,
            Math.min(100, value),
          )}%`,
        }}
      />
    </div>
  );
}

export default function AdminDashboardPage() {
  const [data, setData] =
    useState<PlatformAdminDashboard | null>(
      null,
    );

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  async function load(
    refresh = false,
  ) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const next =
        await getPlatformAdminDashboard();

      setData(next);
    } catch (err) {
      console.error(
        "ADMIN DASHBOARD LOAD ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load platform dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
          </div>

          <div className="mt-4 text-sm font-semibold text-slate-800">
            Loading platform data
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Preparing the admin command center...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-800">
            Platform data unavailable
          </div>

          <div className="mt-1 text-sm text-red-600">
            {error ??
              "No dashboard data returned."}
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-4 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    overview,
    alerts,
    marketing,
    revenue,
    quick_stats,
    latest_studios,
    latest_signups,
    latest_subscriptions,
  } = data;

  const totalStudios =
    overview.total_studios || 0;

  const activeRate =
    totalStudios > 0
      ? Math.round(
          (overview.active_studios /
            totalStudios) *
            100,
        )
      : 0;

  return (
    <div className="p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-[1600px]">
        <div className="mb-7 flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#0A3F61]">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              PhotoOS Platform
            </div>

            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Command Center
            </h1>

            <p className="mt-1.5 max-w-2xl text-sm text-slate-500">
              Monitor users, studios,
              subscriptions, revenue and
              platform operations from one
              workspace.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/ops-console/support-tickets"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Support
              <ChevronRight className="h-4 w-4" />
            </Link>

            <button
              type="button"
              onClick={() => void load(true)}
              disabled={refreshing}
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:opacity-95 disabled:opacity-60"
            >
              <RefreshCcw
                className={[
                  "h-4 w-4",
                  refreshing
                    ? "animate-spin"
                    : "",
                ].join(" ")}
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            title="Total Users"
            value={number(
              overview.total_users,
            )}
            detail="Registered platform users"
            icon={Users}
          />

          <KpiCard
            title="Total Studios"
            value={number(
              overview.total_studios,
            )}
            detail={`${overview.trial_studios || 1} in free trial`}
            icon={Building2}
          />

          <KpiCard
            title="Monthly Recurring Revenue"
            value={currency(
              revenue.monthly_recurring_revenue,
            )}
            detail={revenue.monthly_recurring_revenue === 0 ? "Free Trial Phase (₹0)" : `${currency(
              revenue.annual_recurring_revenue,
            )} annualized`}
            icon={CircleDollarSign}
          />

          <KpiCard
            title="Trial Conversion"
            value={`${quick_stats.trial_conversion_rate}%`}
            detail="Trial to paid conversion"
            icon={Zap}
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Today's signups
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {number(
                    marketing.today_signups,
                  )}
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 text-xs text-slate-500">
              {number(
                marketing.week_signups,
              )}{" "}
              this week ·{" "}
              {number(
                marketing.month_signups,
              )}{" "}
              this month
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Active subscription rate
                </div>
                <div className="mt-1 text-2xl font-bold">
                  {activeRate}%
                </div>
              </div>

              <div className="rounded-xl bg-blue-50 p-2.5 text-blue-600">
                <Activity className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4">
              <MiniBar
                value={activeRate}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400">
                  Platform health
                </div>
                <div className="mt-1 text-2xl font-bold">
                  Operational
                </div>
              </div>

              <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>

            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-600">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Core platform services available
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_380px]">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Platform overview
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Subscription health
                </h2>
              </div>

              <BarChart3 className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-emerald-50 p-5">
                <div className="text-xs font-medium text-emerald-700">
                  Active Studios
                </div>
                <div className="mt-2 text-3xl font-bold text-emerald-950">
                  {number(
                    overview.active_studios,
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-amber-50 p-5">
                <div className="text-xs font-medium text-amber-700">
                  Trial Studios
                </div>
                <div className="mt-2 text-3xl font-bold text-amber-950">
                  {number(
                    overview.trial_studios,
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-red-50 p-5">
                <div className="text-xs font-medium text-red-700">
                  Expired
                </div>
                <div className="mt-2 text-3xl font-bold text-red-950">
                  {number(
                    overview.expired_studios,
                  )}
                </div>
              </div>

              <div className="rounded-2xl bg-slate-100 p-5">
                <div className="text-xs font-medium text-slate-600">
                  Cancelled
                </div>
                <div className="mt-2 text-3xl font-bold text-slate-950">
                  {number(
                    overview.cancelled_studios,
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-red-50 p-2.5 text-red-600">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Attention required
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Platform alerts
                </h2>
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {[
                [
                  "Trials expiring",
                  alerts.trial_expiring,
                ],
                [
                  "Trials expired",
                  alerts.trial_expired,
                ],
                [
                  "Renewal due",
                  alerts.renewal_due,
                ],
                [
                  "Renewal overdue",
                  alerts.renewal_overdue,
                ],
                [
                  "Subscriptions expiring",
                  alerts.subscription_expiring,
                ],
              ].map(
                ([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3"
                  >
                    <span className="text-xs font-medium text-slate-600">
                      {label}
                    </span>

                    <span className="text-sm font-bold text-slate-950">
                      {number(
                        Number(value),
                      )}
                    </span>
                  </div>
                ),
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Growth
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Platform growth snapshot
                </h2>
              </div>

              <Link
                href="/ops-console/marketing/growth"
                className="text-xs font-semibold text-[#0A3F61] hover:underline"
              >
                View analytics
              </Link>
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    Today
                  </span>
                  <span className="font-semibold">
                    {number(
                      marketing.today_signups,
                    )}
                  </span>
                </div>
                <MiniBar
                  value={Math.min(
                    100,
                    marketing.today_signups *
                      10,
                  )}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    This week
                  </span>
                  <span className="font-semibold">
                    {number(
                      marketing.week_signups,
                    )}
                  </span>
                </div>
                <MiniBar
                  value={Math.min(
                    100,
                    marketing.week_signups *
                      4,
                  )}
                />
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between text-xs">
                  <span className="text-slate-500">
                    This month
                  </span>
                  <span className="font-semibold">
                    {number(
                      marketing.month_signups,
                    )}
                  </span>
                </div>
                <MiniBar
                  value={Math.min(
                    100,
                    marketing.month_signups *
                      2,
                  )}
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revenue
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Recurring revenue
                </h2>
              </div>

              <CircleDollarSign className="h-5 w-5 text-slate-400" />
            </div>

            <div className="mt-6">
              <div className="text-3xl font-bold">
                {currency(
                  revenue.monthly_recurring_revenue,
                )}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                Monthly recurring revenue
              </div>

              <div className="mt-5 border-t border-slate-100 pt-5">
                <div className="text-2xl font-bold">
                  {currency(
                    revenue.annual_recurring_revenue,
                  )}
                </div>

                <div className="mt-1 text-xs text-slate-400">
                  Annual recurring revenue
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  New studios
                </h2>
              </div>

              <Link
                href="/ops-console/studios"
                className="text-xs font-semibold text-[#0A3F61]"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {latest_studios
                .slice(0, 5)
                .map((studio) => (
                  <div
                    key={studio.studio_id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                      <Building2 className="h-4 w-4" />
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {studio.studio_name}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {date(
                          studio.created_at,
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {latest_studios.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent studios.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  New signups
                </h2>
              </div>

              <Link
                href="/ops-console/users"
                className="text-xs font-semibold text-[#0A3F61]"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {latest_signups
                .slice(0, 5)
                .map((signup) => (
                  <div
                    key={signup.profile_id}
                    className="flex items-center gap-3 py-3"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3F61] text-xs font-bold text-white">
                      {(
                        signup.full_name ??
                        "U"
                      )
                        .trim()
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold">
                        {signup.full_name ??
                          "Unnamed user"}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {date(
                          signup.created_at,
                        )}
                      </div>
                    </div>
                  </div>
                ))}

              {latest_signups.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent signups.
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Recent
                </div>
                <h2 className="mt-1 text-lg font-bold">
                  Subscriptions
                </h2>
              </div>

              <Link
                href="/ops-console/subscriptions"
                className="text-xs font-semibold text-[#0A3F61]"
              >
                View all
              </Link>
            </div>

            <div className="mt-4 divide-y divide-slate-100">
              {latest_subscriptions
                .slice(0, 5)
                .map((subscription) => (
                  <div
                    key={
                      subscription.subscription_id
                    }
                    className="py-3"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold">
                        Subscription
                      </span>

                      <span
                        className={[
                          "rounded-full px-2 py-1 text-[10px] font-bold uppercase",
                          statusClass(
                            subscription.status,
                          ),
                        ].join(" ")}
                      >
                        {
                          subscription.status
                        }
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                      <span>
                        Created{" "}
                        {date(
                          subscription.created_at,
                        )}
                      </span>

                      <span>
                        End{" "}
                        {date(
                          subscription.subscription_end_at,
                        )}
                      </span>
                    </div>
                  </div>
                ))}

              {latest_subscriptions.length ===
              0 ? (
                <div className="py-8 text-center text-xs text-slate-400">
                  No recent subscriptions.
                </div>
              ) : null}
            </div>
          </section>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="rounded-xl bg-slate-100 p-2.5">
                <CalendarClock className="h-5 w-5 text-slate-600" />
              </div>

              <div>
                <div className="text-sm font-semibold">
                  Platform snapshot
                </div>
                <div className="text-xs text-slate-400">
                  Last generated{" "}
                  {date(
                    data.generated_at,
                  )}
                </div>
              </div>
            </div>

            <Link
              href="/ops-console/software/health"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A3F61]"
            >
              System health
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
