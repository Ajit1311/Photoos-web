"use client";

import {
  AlertTriangle,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Download,
  Loader2,
  LogOut,
  QrCode,
  RefreshCw,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";

import {
  usePlatformAdminDashboard,
} from "@/hooks/usePlatformAdminDashboard";


function formatNumber(
  value: number,
) {

  return new Intl.NumberFormat(
    "en-IN",
  ).format(
    value,
  );

}


function formatCurrency(
  value: number,
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );

}


function formatDate(
  value: string,
) {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );

}


type Props = {
  enabled: boolean;
};


export default function PlatformAdminDashboard({
  enabled,
}: Props) {

  const {
    data,
    loading,
    error,
    refreshing,
    reload,
  } =
    usePlatformAdminDashboard(
      enabled,
    );


  if (
    loading
  ) {

    return (
      <main className="flex min-h-[70vh] items-center justify-center">

        <div className="flex flex-col items-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50">

            <Loader2 className="h-7 w-7 animate-spin text-[#0A3F61]" />

          </div>

          <h2 className="mt-5 text-xl font-bold text-slate-900">

            Loading platform intelligence

          </h2>

          <p className="mt-2 text-sm text-slate-500">

            Preparing the latest PhotoOS platform data.

          </p>

        </div>

      </main>
    );

  }


  if (
    error ||
    !data
  ) {

    return (
      <main className="flex min-h-[70vh] items-center justify-center">

        <div className="w-full max-w-lg rounded-[28px] border border-red-100 bg-white p-8 shadow-xl shadow-slate-200/50">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <AlertTriangle className="h-7 w-7" />

          </div>

          <h1 className="mt-6 text-2xl font-bold text-slate-900">

            Unable to load platform dashboard

          </h1>

          <p className="mt-3 text-sm leading-6 text-slate-500">

            {
              error?.message ??
              "The platform dashboard returned no data."
            }

          </p>

          <button
            type="button"
            onClick={
              () => {
                void reload();
              }
            }
            className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#083653]"
          >

            <RefreshCw className="h-4 w-4" />

            Try Again

          </button>

        </div>

      </main>
    );

  }


  const {
    overview,
    alerts,
    marketing,
    revenue,
    quick_stats,
    app_analytics,
    latest_studios,
    latest_signups,
    latest_subscriptions,
  } =
    data;


  const alertCount =
    alerts.trial_expiring +
    alerts.trial_expired +
    alerts.renewal_due +
    alerts.renewal_overdue +
    alerts.subscription_expiring;


  return (
    <main className="space-y-8">


      {/* Hero */}

      <section className="relative overflow-hidden rounded-[32px] bg-[#0A3F61] p-8 text-white shadow-xl shadow-blue-900/20 lg:p-10">

        <div className="absolute right-[-60px] top-[-80px] h-72 w-72 rounded-full bg-white/5 blur-3xl" />

        <div className="absolute bottom-[-100px] right-[20%] h-72 w-72 rounded-full bg-sky-400/10 blur-3xl" />


        <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold text-sky-100">

              <CheckCircle2 className="h-4 w-4" />

              PhotoOS Platform Administration

            </div>


            <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">

              Platform Command Center

            </h1>


            <p className="mt-4 max-w-2xl text-base leading-7 text-sky-100/80">

              Monitor studios, subscriptions, growth and platform activity from one central workspace.

            </p>

          </div>


          <div className="flex items-center gap-4">

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-4 backdrop-blur">

              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-sky-100/70">

                Platform Alerts

              </p>

              <p className="mt-2 text-4xl font-bold">

                {formatNumber(alertCount)}

              </p>

            </div>


            <button
              type="button"
              onClick={
                () => {
                  void reload();
                }
              }
              disabled={refreshing}
              className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/10 transition hover:bg-white/20 disabled:cursor-not-allowed"
              aria-label="Refresh platform dashboard"
            >

              <RefreshCw
                className={`h-5 w-5 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

            </button>

          </div>

        </div>

      </section>


      {/* Primary Metrics */}

      <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          title="Total Studios"
          value={
            formatNumber(
              overview.total_studios,
            )
          }
          description={`${formatNumber(overview.active_studios)} active`}
          icon={Building2}
        />

        <MetricCard
          title="Platform Users"
          value={
            formatNumber(
              overview.total_users,
            )
          }
          description={`${formatNumber(marketing.month_signups)} this month`}
          icon={Users}
        />

        <MetricCard
          title="Monthly Revenue"
          value={
            formatCurrency(
              revenue.monthly_recurring_revenue,
            )
          }
          description="Recurring revenue"
          icon={CircleDollarSign}
        />

        <MetricCard
          title="Trial Conversion"
          value={`${quick_stats.trial_conversion_rate}%`}
          description={`${formatNumber(overview.trial_studios)} studios on trial`}
          icon={TrendingUp}
        />

      </section>


      {/* App Analytics */}

      <section>

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A3F61]">

              Client App

            </p>

            <h2 className="mt-2 text-2xl font-bold text-slate-950">

              App Analytics

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Basic app usage and booking data. Install tracking will be connected with GA4.

            </p>

          </div>


          <div className="shrink-0 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5 text-xs font-semibold text-amber-700">

            {app_analytics.tracking_status === "ga4_pending"
              ? "GA4 Pending"
              : app_analytics.tracking_status}

          </div>

        </div>


        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <MetricCard
            title="Registered Users"
            value={formatNumber(app_analytics.registered_users)}
            description="Total registered profiles"
            icon={Users}
          />

          <MetricCard
            title="Sign-ups"
            value={formatNumber(app_analytics.signups_30d)}
            description="Last 30 days"
            icon={UserPlus}
          />

          <MetricCard
            title="Active Users"
            value={formatNumber(app_analytics.active_users_30d)}
            description="Seen in last 30 days"
            icon={TrendingUp}
          />

          <MetricCard
            title="Total Bookings"
            value={formatNumber(app_analytics.total_bookings)}
            description={`${formatNumber(app_analytics.bookings_30d)} in last 30 days`}
            icon={CalendarClock}
          />

          <MetricCard
            title="App Installs"
            value={
              app_analytics.installs === null
                ? "—"
                : formatNumber(app_analytics.installs)
            }
            description={
              app_analytics.installs === null
                ? "GA4 tracking pending"
                : "Tracked installs"
            }
            icon={Download}
          />

          <MetricCard
            title="Uninstalls"
            value={
              app_analytics.uninstalls === null
                ? "—"
                : formatNumber(app_analytics.uninstalls)
            }
            description={
              app_analytics.uninstalls === null
                ? "GA4 tracking pending"
                : "Tracked uninstall events"
            }
            icon={LogOut}
          />

          <MetricCard
            title="QR Installs"
            value={
              app_analytics.qr_installs === null
                ? "—"
                : formatNumber(app_analytics.qr_installs)
            }
            description={
              app_analytics.qr_installs === null
                ? "GA4 flow pending"
                : "Installs from QR flow"
            }
            icon={QrCode}
          />

          <MetricCard
            title="Bookings (30d)"
            value={formatNumber(app_analytics.bookings_30d)}
            description="Created in last 30 days"
            icon={CalendarClock}
          />

        </div>

      </section>


      {/* Status Grid */}

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">


        <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A3F61]">

                Studio Portfolio

              </p>

              <h2 className="mt-2 text-2xl font-bold text-slate-950">

                Subscription Health

              </h2>

            </div>

          </div>


          <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            <StatusMetric
              label="Trial"
              value={overview.trial_studios}
            />

            <StatusMetric
              label="Active"
              value={overview.active_studios}
            />

            <StatusMetric
              label="Expired"
              value={overview.expired_studios}
            />

            <StatusMetric
              label="Cancelled"
              value={overview.cancelled_studios}
            />

          </div>


          <div className="mt-8 grid gap-4 border-t border-slate-100 pt-6 sm:grid-cols-2">

            <div>

              <p className="text-sm text-slate-500">

                Annual recurring revenue

              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">

                {
                  formatCurrency(
                    revenue.annual_recurring_revenue,
                  )
                }

              </p>

            </div>


            <div>

              <p className="text-sm text-slate-500">

                Active subscription rate

              </p>

              <p className="mt-2 text-3xl font-bold text-slate-950">

                {quick_stats.active_subscription_rate}%

              </p>

            </div>

          </div>

        </div>


        <div className="rounded-[28px] border border-amber-100 bg-amber-50/60 p-6">

          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-amber-700 shadow-sm">

            <AlertTriangle className="h-6 w-6" />

          </div>


          <p className="mt-5 text-xs font-bold uppercase tracking-[0.18em] text-amber-700">

            Attention Required

          </p>


          <h2 className="mt-2 text-2xl font-bold text-slate-950">

            {formatNumber(alertCount)} open alerts

          </h2>


          <div className="mt-6 space-y-4">

            <AlertRow
              label="Trials expiring"
              value={alerts.trial_expiring}
            />

            <AlertRow
              label="Trials expired"
              value={alerts.trial_expired}
            />

            <AlertRow
              label="Renewals due"
              value={alerts.renewal_due}
            />

            <AlertRow
              label="Renewals overdue"
              value={alerts.renewal_overdue}
            />

            <AlertRow
              label="Subscriptions expiring"
              value={alerts.subscription_expiring}
            />

          </div>

        </div>

      </section>


      {/* Growth */}

      <section className="grid gap-6 xl:grid-cols-3">

        <GrowthCard
          title="Today"
          value={marketing.today_signups}
          icon={UserPlus}
        />

        <GrowthCard
          title="This Week"
          value={marketing.week_signups}
          icon={CalendarClock}
        />

        <GrowthCard
          title="This Month"
          value={marketing.month_signups}
          icon={TrendingUp}
        />

      </section>


      {/* Latest Activity */}

      <section className="grid gap-6 xl:grid-cols-3">

        <ActivityPanel
          title="Latest Studios"
          emptyMessage="No studio activity available."
        >

          {
            latest_studios.map(
              (
                studio,
              ) => (

                <div
                  key={studio.studio_id}
                  className="flex items-center justify-between gap-4 py-4"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">

                      {studio.studio_name}

                    </p>

                    <p className="mt-1 text-xs text-slate-400">

                      Studio created

                    </p>

                  </div>


                  <span className="shrink-0 text-xs text-slate-500">

                    {
                      formatDate(
                        studio.created_at,
                      )
                    }

                  </span>

                </div>

              ),
            )
          }

        </ActivityPanel>


        <ActivityPanel
          title="Latest Signups"
          emptyMessage="No recent user signups."
        >

          {
            latest_signups.map(
              (
                signup,
              ) => (

                <div
                  key={signup.profile_id}
                  className="flex items-center justify-between gap-4 py-4"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-900">

                      {
                        signup.full_name ??
                        "Unnamed user"
                      }

                    </p>

                    <p className="mt-1 text-xs text-slate-400">

                      New platform user

                    </p>

                  </div>


                  <span className="shrink-0 text-xs text-slate-500">

                    {
                      formatDate(
                        signup.created_at,
                      )
                    }

                  </span>

                </div>

              ),
            )
          }

        </ActivityPanel>


        <ActivityPanel
          title="Latest Subscriptions"
          emptyMessage="No recent subscription activity."
        >

          {
            latest_subscriptions.map(
              (
                subscription,
              ) => (

                <div
                  key={subscription.subscription_id}
                  className="flex items-center justify-between gap-4 py-4"
                >

                  <div className="min-w-0">

                    <p className="text-sm font-semibold capitalize text-slate-900">

                      {subscription.status}

                    </p>

                    <p className="mt-1 text-xs text-slate-400">

                      Subscription update

                    </p>

                  </div>


                  <span className="shrink-0 text-xs text-slate-500">

                    {
                      formatDate(
                        subscription.created_at,
                      )
                    }

                  </span>

                </div>

              ),
            )
          }

        </ActivityPanel>

      </section>

    </main>
  );

}


type MetricCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
};


function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: MetricCardProps) {

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-start justify-between">

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">

          <Icon className="h-5 w-5" />

        </div>

      </div>


      <p className="mt-5 text-sm font-medium text-slate-500">

        {title}

      </p>


      <p className="mt-2 text-3xl font-bold tracking-tight text-slate-950">

        {value}

      </p>


      <p className="mt-2 text-xs text-slate-400">

        {description}

      </p>

    </div>
  );

}


type StatusMetricProps = {
  label: string;
  value: number;
};


function StatusMetric({
  label,
  value,
}: StatusMetricProps) {

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">

        {label}

      </p>

      <p className="mt-3 text-3xl font-bold text-slate-950">

        {formatNumber(value)}

      </p>

    </div>
  );

}


type AlertRowProps = {
  label: string;
  value: number;
};


function AlertRow({
  label,
  value,
}: AlertRowProps) {

  return (
    <div className="flex items-center justify-between border-b border-amber-100 pb-3 last:border-b-0 last:pb-0">

      <span className="text-sm text-amber-950/70">

        {label}

      </span>

      <span className="rounded-full bg-white px-3 py-1 text-sm font-bold text-amber-800 shadow-sm">

        {formatNumber(value)}

      </span>

    </div>
  );

}


type GrowthCardProps = {
  title: string;
  value: number;
  icon: React.ElementType;
};


function GrowthCard({
  title,
  value,
  icon: Icon,
}: GrowthCardProps) {

  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <p className="text-sm font-medium text-slate-500">

          New Signups · {title}

        </p>

        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A3F61]">

          <Icon className="h-5 w-5" />

        </div>

      </div>


      <p className="mt-6 text-4xl font-bold tracking-tight text-slate-950">

        {formatNumber(value)}

      </p>

    </div>
  );

}


type ActivityPanelProps = {
  title: string;
  emptyMessage: string;
  children: React.ReactNode;
};


function ActivityPanel({
  title,
  emptyMessage,
  children,
}: ActivityPanelProps) {

  const hasChildren =
    Array.isArray(
      children,
    )
      ? children.length >
        0
      : Boolean(
          children,
        );


  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">

      <h2 className="text-lg font-bold text-slate-950">

        {title}

      </h2>


      <div className="mt-5 divide-y divide-slate-100">

        {
          hasChildren
            ? children
            : (

              <p className="py-8 text-center text-sm text-slate-400">

                {emptyMessage}

              </p>

            )
        }

      </div>

    </div>
  );

}
