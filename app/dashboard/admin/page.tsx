"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Activity,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  CreditCard,
  Crown,
  Loader2,
  RefreshCw,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";

import {
  usePlatformAdminDashboard,
} from "@/hooks/usePlatformAdminDashboard";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import type {
  LatestSignup,
  LatestStudio,
  LatestSubscription,
} from "@/lib/api/platform-admin";


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
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(
    value,
  );

}


function formatDate(
  value: string | null,
) {

  if (!value) {

    return "—";

  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    },
  ).format(
    new Date(
      value,
    ),
  );

}


function getSubscriptionStatusClass(
  status: string,
) {

  const normalized =
    status.toLowerCase();


  if (
    normalized ===
    "active"
  ) {

    return "border-emerald-200 bg-emerald-50 text-emerald-700";

  }


  if (
    normalized ===
    "trial"
  ) {

    return "border-blue-200 bg-blue-50 text-blue-700";

  }


  if (
    normalized ===
    "expired"
  ) {

    return "border-red-200 bg-red-50 text-red-700";

  }


  return "border-slate-200 bg-slate-50 text-slate-600";

}


type StatCardProps = {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
};


function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: StatCardProps) {

  return (
    <div className="group rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-200/60">

      <div className="flex items-start justify-between gap-4">

        <div>

          <p className="text-sm font-medium text-slate-500">

            {title}

          </p>


          <p className="mt-4 text-3xl font-bold tracking-tight text-slate-950">

            {value}

          </p>


          <p className="mt-2 text-sm text-slate-400">

            {description}

          </p>

        </div>


        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61] transition group-hover:bg-[#0A3F61] group-hover:text-white">

          <Icon className="h-5 w-5" />

        </div>

      </div>

    </div>
  );

}


type AlertCardProps = {
  title: string;
  value: number;
  description: string;
  danger?: boolean;
};


function AlertCard({
  title,
  value,
  description,
  danger =
    false,
}: AlertCardProps) {

  return (
    <div
      className={`rounded-2xl border p-5 ${
        danger
          ? "border-red-100 bg-red-50/70"
          : "border-amber-100 bg-amber-50/70"
      }`}
    >

      <div className="flex items-start justify-between gap-4">

        <div>

          <p
            className={`text-sm font-semibold ${
              danger
                ? "text-red-800"
                : "text-amber-800"
            }`}
          >

            {title}

          </p>


          <p
            className={`mt-3 text-3xl font-bold ${
              danger
                ? "text-red-700"
                : "text-amber-700"
            }`}
          >

            {formatNumber(
              value,
            )}

          </p>


          <p
            className={`mt-2 text-xs leading-5 ${
              danger
                ? "text-red-600"
                : "text-amber-700"
            }`}
          >

            {description}

          </p>

        </div>


        <AlertTriangle
          className={`h-5 w-5 shrink-0 ${
            danger
              ? "text-red-500"
              : "text-amber-500"
          }`}
        />

      </div>

    </div>
  );

}


function LatestStudios({
  studios,
}: {
  studios: LatestStudio[];
}) {

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-lg font-bold text-slate-950">

            Latest Studios

          </h2>


          <p className="mt-1 text-sm text-slate-500">

            Recently created workspaces

          </p>

        </div>


        <Building2 className="h-5 w-5 text-slate-400" />

      </div>


      <div className="divide-y divide-slate-100">

        {
          studios.length >
          0
            ? studios.map(
              (
                studio,
              ) => (

                <div
                  key={
                    studio.studio_id
                  }
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-800">

                      {studio.studio_name}

                    </p>


                    <p className="mt-1 text-xs text-slate-400">

                      Created{" "}

                      {
                        formatDate(
                          studio.created_at,
                        )
                      }

                    </p>

                  </div>


                  <ArrowUpRight className="h-4 w-4 shrink-0 text-slate-400" />

                </div>

              ),
            )
            : (

              <p className="px-6 py-8 text-center text-sm text-slate-400">

                No studios available.

              </p>

            )
        }

      </div>

    </div>
  );

}


function LatestSignups({
  signups,
}: {
  signups: LatestSignup[];
}) {

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-lg font-bold text-slate-950">

            Latest Signups

          </h2>


          <p className="mt-1 text-sm text-slate-500">

            Recently joined users

          </p>

        </div>


        <UserPlus className="h-5 w-5 text-slate-400" />

      </div>


      <div className="divide-y divide-slate-100">

        {
          signups.length >
          0
            ? signups.map(
              (
                signup,
              ) => (

                <div
                  key={
                    signup.profile_id
                  }
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >

                  <div className="min-w-0">

                    <p className="truncate text-sm font-semibold text-slate-800">

                      {
                        signup.full_name ??
                        "Unnamed User"
                      }

                    </p>


                    <p className="mt-1 text-xs text-slate-400">

                      Joined{" "}

                      {
                        formatDate(
                          signup.created_at,
                        )
                      }

                    </p>

                  </div>


                  <Users className="h-4 w-4 shrink-0 text-slate-400" />

                </div>

              ),
            )
            : (

              <p className="px-6 py-8 text-center text-sm text-slate-400">

                No recent signups.

              </p>

            )
        }

      </div>

    </div>
  );

}


function LatestSubscriptions({
  subscriptions,
}: {
  subscriptions: LatestSubscription[];
}) {

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white shadow-sm">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-lg font-bold text-slate-950">

            Latest Subscriptions

          </h2>


          <p className="mt-1 text-sm text-slate-500">

            Recent subscription activity

          </p>

        </div>


        <CreditCard className="h-5 w-5 text-slate-400" />

      </div>


      <div className="divide-y divide-slate-100">

        {
          subscriptions.length >
          0
            ? subscriptions.map(
              (
                subscription,
              ) => (

                <div
                  key={
                    subscription.subscription_id
                  }
                  className="flex items-center justify-between gap-4 px-6 py-4"
                >

                  <div className="min-w-0">

                    <div className="flex items-center gap-2">

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${
                          getSubscriptionStatusClass(
                            subscription.status,
                          )
                        }`}
                      >

                        {subscription.status}

                      </span>

                    </div>


                    <p className="mt-2 truncate text-xs text-slate-400">

                      Started{" "}

                      {
                        formatDate(
                          subscription.created_at,
                        )
                      }

                    </p>

                  </div>


                  <p className="text-right text-xs text-slate-400">

                    Ends{" "}

                    {
                      formatDate(
                        subscription.subscription_end_at,
                      )
                    }

                  </p>

                </div>

              ),
            )
            : (

              <p className="px-6 py-8 text-center text-sm text-slate-400">

                No subscription activity.

              </p>

            )
        }

      </div>

    </div>
  );

}


type AdminAccessState =
  | "loading"
  | "authorized"
  | "denied";


export default function PlatformAdminPage() {

  const router =
    useRouter();


  const [
    accessState,
    setAccessState,
  ] =
    useState<AdminAccessState>(
      "loading",
    );


  useEffect(
    () => {

      let cancelled =
        false;


      async function verifyPlatformAdminAccess() {

        try {

          const membership =
            await resolveUserStudio();


          if (!membership) {

            if (!cancelled) {

              setAccessState(
                "denied",
              );

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );


          if (
            compliance.is_photoos_admin !==
            true
          ) {

            if (!cancelled) {

              setAccessState(
                "denied",
              );

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          if (!cancelled) {

            setAccessState(
              "authorized",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "PLATFORM ADMIN ACCESS ERROR:",
            error,
          );


          if (!cancelled) {

            setAccessState(
              "denied",
            );

            router.replace(
              "/dashboard",
            );

          }

        }

      }


      verifyPlatformAdminAccess();


      return () => {

        cancelled =
          true;

      };

    },
    [
      router,
    ],
  );


  const {
    data,
    loading,
    error,
    refreshing,
    reload,
  } =
    usePlatformAdminDashboard(
      accessState ===
      "authorized",
    );


  if (
    accessState ===
    "loading"
  ) {

    return (
      <main className="flex min-h-[60vh] items-center justify-center">

        <div className="space-y-4 text-center">

          <Loader2 className="mx-auto h-9 w-9 animate-spin text-[#0A3F61]" />

          <div>

            <h2 className="text-lg font-semibold text-slate-900">

              Verifying platform access

            </h2>

            <p className="mt-1 text-sm text-slate-500">

              Checking your administrator permissions.

            </p>

          </div>

        </div>

      </main>
    );

  }


  if (
    accessState ===
    "denied"
  ) {

    return null;

  }


  if (
    loading
  ) {

    return (
      <main className="flex min-h-[70vh] items-center justify-center">

        <div className="flex flex-col items-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50">

            <Loader2 className="h-7 w-7 animate-spin text-[#0A3F61]" />

          </div>


          <h1 className="mt-5 text-lg font-bold text-slate-900">

            Loading platform intelligence

          </h1>


          <p className="mt-2 text-sm text-slate-500">

            Preparing the latest platform data.

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

        <div className="w-full max-w-lg rounded-[28px] border border-red-100 bg-white p-8 shadow-xl shadow-slate-200/60">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <AlertTriangle className="h-7 w-7" />

          </div>


          <h1 className="mt-6 text-2xl font-bold text-slate-950">

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
            onClick={() => void reload()}
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#083653]"
          >

            <RefreshCw className="h-4 w-4" />

            Try Again

          </button>

        </div>

      </main>
    );

  }


  return (
    <main className="space-y-8">


      {/* Platform Hero */}

      <section className="relative overflow-hidden rounded-[32px] bg-[#0A3F61] px-7 py-8 text-white shadow-xl shadow-blue-950/20 sm:px-9 lg:py-10">

        <div className="absolute inset-0 overflow-hidden">

          <div className="absolute -right-20 -top-32 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

          <div className="absolute -bottom-24 left-1/3 h-64 w-64 rounded-full bg-sky-400/10 blur-3xl" />

        </div>


        <div className="relative flex flex-col gap-8 xl:flex-row xl:items-center xl:justify-between">

          <div>

            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80">

              <Crown className="h-3.5 w-3.5" />

              PhotoOS Platform Administration

            </div>


            <h1 className="mt-5 text-3xl font-bold tracking-tight sm:text-4xl">

              Platform Command Center

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/70 sm:text-base">

              Monitor studios, subscriptions, growth, revenue and platform activity from one place.

            </p>

          </div>


          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">

            <div className="rounded-2xl border border-white/10 bg-white/10 px-5 py-3 backdrop-blur">

              <p className="text-xs font-medium uppercase tracking-[0.16em] text-white/50">

                Last generated

              </p>


              <p className="mt-1 text-sm font-semibold text-white">

                {
                  formatDate(
                    data.generated_at,
                  )
                }

              </p>

            </div>


            <button
              type="button"
              onClick={() => void reload()}
              disabled={refreshing}
              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white px-5 py-3 text-sm font-bold text-[#0A3F61] shadow-lg transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing
                    ? "animate-spin"
                    : ""
                }`}
              />

              Refresh

            </button>

          </div>

        </div>

      </section>


      {/* Platform Overview */}

      <section>

        <div className="mb-5 flex items-end justify-between gap-4">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A3F61]">

              Platform overview

            </p>


            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">

              Business at a glance

            </h2>

          </div>

        </div>


        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">

          <StatCard
            title="Total Studios"
            value={
              formatNumber(
                data.overview.total_studios,
              )
            }
            description="All registered workspaces"
            icon={Building2}
          />


          <StatCard
            title="Total Users"
            value={
              formatNumber(
                data.overview.total_users,
              )
            }
            description="Registered platform users"
            icon={Users}
          />


          <StatCard
            title="Active Studios"
            value={
              formatNumber(
                data.overview.active_studios,
              )
            }
            description="Currently active subscriptions"
            icon={CheckCircle2}
          />


          <StatCard
            title="Trial Studios"
            value={
              formatNumber(
                data.overview.trial_studios,
              )
            }
            description="Studios currently evaluating"
            icon={Clock3}
          />

        </div>

      </section>


      {/* Revenue + Growth */}

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-start justify-between gap-4">

            <div>

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <CircleDollarSign className="h-6 w-6" />

              </div>


              <h2 className="mt-5 text-xl font-bold text-slate-950">

                Revenue Snapshot

              </h2>


              <p className="mt-2 text-sm text-slate-500">

                Current recurring revenue position

              </p>

            </div>


            <TrendingUp className="h-6 w-6 text-emerald-500" />

          </div>


          <div className="mt-8 grid gap-5 sm:grid-cols-2">

            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm font-medium text-slate-500">

                Monthly Recurring Revenue

              </p>


              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">

                {
                  formatCurrency(
                    data.revenue.monthly_recurring_revenue,
                  )
                }

              </p>

            </div>


            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">

              <p className="text-sm font-medium text-slate-500">

                Annual Recurring Revenue

              </p>


              <p className="mt-3 text-3xl font-bold tracking-tight text-slate-950">

                {
                  formatCurrency(
                    data.revenue.annual_recurring_revenue,
                  )
                }

              </p>

            </div>

          </div>

        </div>


        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">

          <div className="flex items-center justify-between">

            <div>

              <h2 className="text-xl font-bold text-slate-950">

                Growth

              </h2>


              <p className="mt-2 text-sm text-slate-500">

                New platform registrations

              </p>

            </div>


            <Activity className="h-5 w-5 text-[#0A3F61]" />

          </div>


          <div className="mt-7 space-y-4">

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">

              <span className="text-sm font-medium text-slate-600">

                Today

              </span>


              <span className="text-xl font-bold text-slate-950">

                {
                  formatNumber(
                    data.marketing.today_signups,
                  )
                }

              </span>

            </div>


            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">

              <span className="text-sm font-medium text-slate-600">

                This Week

              </span>


              <span className="text-xl font-bold text-slate-950">

                {
                  formatNumber(
                    data.marketing.week_signups,
                  )
                }

              </span>

            </div>


            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-5 py-4">

              <span className="text-sm font-medium text-slate-600">

                This Month

              </span>


              <span className="text-xl font-bold text-slate-950">

                {
                  formatNumber(
                    data.marketing.month_signups,
                  )
                }

              </span>

            </div>

          </div>

        </div>

      </section>


      {/* Alerts */}

      <section className="rounded-[30px] border border-slate-200 bg-white p-7 shadow-sm">

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <div>

            <p className="text-xs font-bold uppercase tracking-[0.18em] text-amber-600">

              Attention required

            </p>


            <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">

              Platform Alerts

            </h2>

          </div>


          <CalendarClock className="h-6 w-6 text-slate-400" />

        </div>


        <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">

          <AlertCard
            title="Trial Expiring"
            value={
              data.alerts.trial_expiring
            }
            description="Trials approaching expiry"
          />


          <AlertCard
            title="Trial Expired"
            value={
              data.alerts.trial_expired
            }
            description="Trials requiring action"
            danger
          />


          <AlertCard
            title="Renewal Due"
            value={
              data.alerts.renewal_due
            }
            description="Upcoming renewals"
          />


          <AlertCard
            title="Renewal Overdue"
            value={
              data.alerts.renewal_overdue
            }
            description="Renewals past due"
            danger
          />


          <AlertCard
            title="Subscription Expiring"
            value={
              data.alerts.subscription_expiring
            }
            description="Subscriptions nearing expiry"
          />

        </div>

      </section>


      {/* Quick Health */}

      <section className="grid gap-6 lg:grid-cols-2">

        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">

          <p className="text-sm font-medium text-slate-500">

            Trial Conversion Rate

          </p>


          <div className="mt-5 flex items-end justify-between gap-5">

            <p className="text-5xl font-bold tracking-tight text-slate-950">

              {
                data.quick_stats.trial_conversion_rate
              }%

            </p>


            <TrendingUp className="mb-2 h-7 w-7 text-emerald-500" />

          </div>


          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-[#0A3F61]"
              style={{
                width:
                  `${Math.min(
                    Math.max(
                      data.quick_stats.trial_conversion_rate,
                      0,
                    ),
                    100,
                  )}%`,
              }}
            />

          </div>

        </div>


        <div className="rounded-[28px] border border-slate-200 bg-white p-7 shadow-sm">

          <p className="text-sm font-medium text-slate-500">

            Active Subscription Rate

          </p>


          <div className="mt-5 flex items-end justify-between gap-5">

            <p className="text-5xl font-bold tracking-tight text-slate-950">

              {
                data.quick_stats.active_subscription_rate
              }%

            </p>


            <CheckCircle2 className="mb-2 h-7 w-7 text-emerald-500" />

          </div>


          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">

            <div
              className="h-full rounded-full bg-emerald-500"
              style={{
                width:
                  `${Math.min(
                    Math.max(
                      data.quick_stats.active_subscription_rate,
                      0,
                    ),
                    100,
                  )}%`,
              }}
            />

          </div>

        </div>

      </section>


      {/* Latest Activity */}

      <section className="grid gap-6 xl:grid-cols-3">

        <LatestStudios
          studios={
            data.latest_studios
          }
        />


        <LatestSignups
          signups={
            data.latest_signups
          }
        />


        <LatestSubscriptions
          subscriptions={
            data.latest_subscriptions
          }
        />

      </section>

    </main>
  );

}
