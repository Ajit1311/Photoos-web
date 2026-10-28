"use client";

import Link from "next/link";

import {
  CalendarDays,
  Check,
  ChevronRight,
  FolderKanban,
  Image,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Workflow,
  UserRoundPlus,
} from "lucide-react";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useDashboardContext,
} from "@/context/DashboardContext";

import PendingPayments from "@/components/dashboard/finance/PendingPayments";
import MarketplaceLeads from "@/components/dashboard/marketplace/MarketplaceLeads";

import {
  usePlanAccess,
} from "@/hooks/usePlanAccess";

import {
  useSubscriptionUsage,
} from "@/hooks/useSubscriptionUsage";


import TodaysFocus from "@/components/dashboard/overview/TodaysFocus";
import ActiveProjects from "@/components/dashboard/overview/ActiveProjects";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";


function getGreeting() {

  const indiaHour =
    Number(
      new Intl.DateTimeFormat(
        "en-IN",
        {
          timeZone:
            "Asia/Kolkata",
          hour:
            "2-digit",
          hour12:
            false,
        },
      ).format(
        new Date(),
      ),
    );


  if (
    indiaHour >= 5 &&
    indiaHour < 12
  ) {
    return "Good morning";
  }


  if (
    indiaHour >= 12 &&
    indiaHour < 17
  ) {
    return "Good afternoon";
  }


  if (
    indiaHour >= 17 &&
    indiaHour < 21
  ) {
    return "Good evening";
  }


  return "Good evening";

}

function getTodayLabel() {

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
    },
  ).format(
    new Date(),
  );

}


function MetricCard({
  icon,
  label,
  value,
  description,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  description: string;
}) {

  return (

    <div className="group relative overflow-hidden rounded-2xl border border-[#3495A1]/20 bg-gradient-to-br from-card via-card to-[#3495A1]/[0.08] p-5 shadow-[0_4px_20px_rgba(10,63,97,0.04)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3495A1]/35 hover:shadow-[0_10px_28px_rgba(10,63,97,0.09)]">

      <div className="flex items-start justify-between">

        <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[#1F70B8]/20 bg-gradient-to-br from-[#1F70B8]/15 to-[#3495A1]/15 text-[#1F70B8] transition-colors">

          {
            icon
          }

        </div>

      </div>


      <p className="mt-5 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">

        {
          value
        }

      </p>


      <p className="mt-1.5 text-sm font-semibold text-foreground">

        {
          label
        }

      </p>


      <p className="mt-1 text-xs leading-5 text-muted-foreground">

        {
          description
        }

      </p>

    </div>

  );

}


export default function DashboardPage() {

  const bootstrap =
    useBootstrapContext();


  const dashboard =
    useDashboardContext();


  const planAccess =
    usePlanAccess();


  const subscriptionUsage =
    useSubscriptionUsage();



  const profile =
    bootstrap.data?.profile ??
    null;


  const workspace =
    bootstrap.data?.workspace ??
    null;


  const metrics =
    dashboard.data?.metrics ??
    null;


  const displayName =
    profile?.first_name ??
    profile?.full_name ??
    "there";


  const studioName =
    workspace?.studio?.name ??
    "Your Studio";



  async function handleRefresh() {

    await Promise.all(
      [
        bootstrap.reload(),
        dashboard.reload(),
      ],
    );

  }


  if (
    bootstrap.loading ||
    dashboard.loading
  ) {
    return (
      <main className="mx-auto max-w-[1600px] space-y-6 pb-10 animate-pulse">
        {/* Header Skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2.5">
            <div className="h-4 w-36 rounded-md bg-muted/80" />
            <div className="h-9 w-64 rounded-xl bg-muted" />
            <div className="h-4 w-48 rounded-md bg-muted/60" />
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-44 rounded-xl bg-muted" />
            <div className="h-10 w-36 rounded-xl bg-muted" />
            <div className="h-10 w-24 rounded-xl bg-muted" />
          </div>
        </div>

        {/* Metric Cards Skeleton */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-32 rounded-2xl border border-border/60 bg-card/60 p-5 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="h-3.5 w-24 rounded bg-muted/80" />
                <div className="h-8 w-8 rounded-lg bg-muted" />
              </div>
              <div className="h-7 w-20 rounded-md bg-muted" />
              <div className="h-3 w-32 rounded bg-muted/60" />
            </div>
          ))}
        </div>

        {/* Main Content Columns Skeleton */}
        <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="space-y-6">
            <div className="h-72 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xs" />
            <div className="h-80 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xs" />
          </div>
          <div className="space-y-6">
            <div className="h-64 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xs" />
            <div className="h-80 rounded-2xl border border-border/60 bg-card/60 p-6 shadow-2xs" />
          </div>
        </div>
      </main>
    );
  }


  if (bootstrap.error && !bootstrap.data) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="max-w-md w-full rounded-[28px] border border-border/80 bg-card p-8 text-center shadow-lg space-y-4">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-500">
            <RefreshCw className="h-6 w-6" />
          </div>
          <h1 className="text-lg font-bold text-foreground">
            Unable to connect to workspace
          </h1>
          <p className="text-xs leading-5 text-muted-foreground">
            {bootstrap.error?.message || "A temporary connection error occurred while loading your studio."}
          </p>
          <div className="pt-2 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={handleRefresh}
              className="flex-1 rounded-xl bg-primary px-4 py-2.5 text-xs font-semibold text-white shadow-sm transition hover:bg-primary/90"
            >
              Try Again
            </button>
            <Link
              href="/login"
              className="flex-1 rounded-xl border border-border bg-muted/40 px-4 py-2.5 text-xs font-semibold text-foreground transition hover:bg-muted"
            >
              Return to Login
            </Link>
          </div>
        </div>
      </main>
    );
  }


  return (

    <main className="mx-auto max-w-[1600px] space-y-6 pb-10">

      <section className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

        <div>

          <div className="flex items-center gap-2 text-sm text-muted-foreground">

            <span>
              {studioName}
            </span>

            <span className="h-1 w-1 rounded-full bg-slate-300" />

            <span>
              {getTodayLabel()}
            </span>

          </div>


          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">

            {getGreeting()}, {displayName}

          </h1>


          <p className="mt-2 text-sm text-muted-foreground">

            Here is what needs your attention today.

          </p>

        </div>


        <div className="flex flex-wrap items-center gap-3">

          <Link
            href="/dashboard/marketplace/availability"
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-primary/90"
          >
            <CalendarDays size={16} />
            Availability Calendar
          </Link>

          <Link
            href="/dashboard/marketplace/freelancers"
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:-translate-y-0.5 hover:bg-muted"
          >
            <UserRoundPlus size={16} />
            Hire Freelancer
          </Link>

          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground shadow-sm transition hover:border-slate-300 hover:bg-muted"
          >

            <RefreshCw
              size={16}
            />

            Refresh

          </button>

        </div>

      </section>


      {/* ============================================================
          QUICK ACTIONS
          ============================================================ */}


      <section className="rounded-2xl border border-border/80 bg-card p-5 shadow-[0_4px_24px_rgba(10,63,97,0.045)] sm:p-6">

        <div>

          <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-primary">
            Quick Actions
          </p>

          <h2 className="mt-1 text-xl font-semibold tracking-tight text-foreground">
            Get things done
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Jump directly into the most common studio workflows.
          </p>

        </div>


        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">

          {[
            {
              label: "Create Client",
              description: "Add a new client",
              href: "/dashboard/clients/create",
              icon: Plus,
            },
            {
              label: "Create Project",
              description: "Start a new project",
              href: "/dashboard/projects/create",
              icon: FolderKanban,
            },
            {
              label: "Create Event",
              description: "Schedule a new event",
              href: "/dashboard/events/create",
              icon: CalendarDays,
            },
            {
              label: "View Albums",
              description: "Manage your albums",
              href: "/dashboard/albums",
              icon: Image,
            },
          ].map(
            (action) => {

              const Icon =
                action.icon;

              return (
                <button
                  key={action.href}
                  type="button"
                  onClick={() => {
                    window.location.href =
                      action.href;
                  }}
                  className="group flex min-h-[76px] items-center gap-3 rounded-2xl border border-[#3495A1]/15 bg-gradient-to-r from-[#F7FAFC] via-card to-[#3495A1]/[0.06] p-3.5 text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3495A1]/40 hover:shadow-[0_10px_24px_rgba(10,63,97,0.09)] sm:gap-4 sm:p-4"
                >

                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#1F70B8]/20 bg-gradient-to-br from-[#1F70B8]/15 to-[#3495A1]/15 text-[#1F70B8] transition-all duration-200 group-hover:scale-105 group-hover:border-[#3495A1]/40 sm:h-12 sm:w-12">

                    <Icon
                      size={19}
                    />

                  </div>


                  <div className="min-w-0">

                    <p className="text-sm font-semibold text-foreground">
                      {action.label}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {action.description}
                    </p>

                  </div>

                </button>
              );

            },
          )}

        </div>

      </section>


      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

        <MetricCard
          icon={
            <FolderKanban
              size={19}
            />
          }
          label="Active Projects"
          value={
            metrics?.activeProjects ??
            0
          }
          description="Projects currently in progress"
        />


        <MetricCard
          icon={
            <CalendarDays
              size={19}
            />
          }
          label="Today's Events"
          value={
            metrics?.todayEvents ??
            0
          }
          description="Events scheduled for today"
        />


        <MetricCard
          icon={
            <Image
              size={19}
            />
          }
          label="Pending Deliveries"
          value={
            metrics?.pendingDeliveries ??
            0
          }
          description="Deliverables waiting to go out"
        />


        <MetricCard
          icon={
            <Workflow
              size={19}
            />
          }
          label="Processing Jobs"
          value={
            metrics?.pendingProcessingJobs ??
            0
          }
          description="Media jobs currently running"
        />

      </section>





      {/* ============================================================
          SUBSCRIPTION USAGE
          ============================================================ */}

      <section className="mt-6 rounded-[28px] border border-border bg-card p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">

        <div>

          <p className="text-xs font-black uppercase tracking-[0.16em] text-primary">
            Subscription Usage
          </p>

          <h2 className="mt-1 text-xl font-black tracking-tight text-foreground">
            Current usage
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            See how much of your current plan capacity your studio is using.
          </p>

        </div>


        {subscriptionUsage.loading ? (

          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">

            {[1, 2, 3].map(
              (item) => (

                <div
                  key={item}
                  className="h-32 animate-pulse rounded-xl border border-border/60 bg-muted/70"
                />

              ),
            )}

          </div>

        ) : subscriptionUsage.error ? (

          <div className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/70 px-4 py-4 dark:border-amber-900/50 dark:bg-amber-950/20">

            <p className="text-sm font-bold text-amber-800">
              Usage data is currently unavailable.
            </p>

            <p className="mt-1 text-xs text-amber-700">
              Your plan limits are still available above.
            </p>

          </div>

        ) : subscriptionUsage.data ? (

          <div className="mt-6 grid gap-4 sm:grid-cols-3">

            {[
              {
                label: "Team members",
                used:
                  subscriptionUsage.data.users.used,
                limit:
                  subscriptionUsage.data.users.limit,
                remaining:
                  subscriptionUsage.data.users.remaining,
                percentage:
                  subscriptionUsage.data.users.percentage,
              },
              {
                label: "Events / month",
                used:
                  subscriptionUsage.data.events.used_this_month,
                limit:
                  subscriptionUsage.data.events.limit,
                remaining:
                  subscriptionUsage.data.events.remaining,
                percentage:
                  subscriptionUsage.data.events.percentage,
              },
              {
                label: "Storage",
                used:
                  subscriptionUsage.data.storage.used_bytes /
                  (1024 * 1024 * 1024),
                limit:
                  subscriptionUsage.data.storage.limit_gb,
                remaining:
                  subscriptionUsage.data.storage.remaining_bytes === null
                    ? null
                    : subscriptionUsage.data.storage.remaining_bytes /
                      (1024 * 1024 * 1024),
                percentage:
                  subscriptionUsage.data.storage.percentage,
              },
            ].map(
              (item) => {

                const unlimited =
                  item.limit === -1;

                const percentage =
                  item.percentage === null
                    ? 0
                    : Math.min(
                        100,
                        Math.max(
                          0,
                          item.percentage,
                        ),
                      );

                const usedLabel =
                  item.label === "Storage"
                    ? `${item.used.toLocaleString("en-IN", {
                        maximumFractionDigits: 2,
                      })} GB`
                    : item.used.toLocaleString(
                        "en-IN",
                      );

                const limitLabel =
                  unlimited
                    ? "Unlimited"
                    : item.limit === null
                      ? "Not available"
                      : item.label === "Storage"
                        ? `${item.limit.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })} GB`
                        : item.limit.toLocaleString(
                            "en-IN",
                          );

                const remainingLabel =
                  unlimited
                    ? "Unlimited capacity"
                    : item.remaining === null
                      ? "Not available"
                      : item.label === "Storage"
                        ? `${item.remaining.toLocaleString("en-IN", {
                            maximumFractionDigits: 2,
                          })} GB remaining`
                        : `${item.remaining.toLocaleString(
                            "en-IN",
                          )} remaining`;

                return (

                  <div
                    key={item.label}
                    className="rounded-2xl border border-[#3495A1]/20 bg-gradient-to-br from-[#3495A1]/[0.08] via-card to-card p-4 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#3495A1]/35 hover:shadow-sm sm:p-5"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <div>

                        <p className="text-xs font-semibold text-muted-foreground">
                          {item.label}
                        </p>

                        <p className="mt-1 text-xl font-black text-foreground">
                          {usedLabel}
                          <span className="ml-1 text-sm font-bold text-muted-foreground">
                            / {limitLabel}
                          </span>
                        </p>

                      </div>

                      <span className="rounded-full border border-primary/10 bg-primary/5 px-2.5 py-1 text-[10px] font-bold text-primary">
                        {unlimited
                          ? "Unlimited"
                          : `${Math.round(percentage)}%`}
                      </span>

                    </div>


                    {!unlimited && (

                      <div className="mt-4 h-2 overflow-hidden rounded-full bg-muted ring-1 ring-inset ring-border/60">

                        <div
                          className="h-full rounded-full bg-gradient-to-r from-[#0A3F61] via-[#1F70B8] to-[#3495A1] transition-all duration-500"
                          style={{
                            width: `${percentage}%`,
                          }}
                        />

                      </div>

                    )}


                    <p className="mt-3 text-xs font-medium text-muted-foreground">
                      {remainingLabel}
                    </p>

                  </div>

                );

              },
            )}

          </div>

        ) : (

          <div className="mt-6 rounded-2xl bg-muted px-4 py-4">

            <p className="text-sm font-bold text-foreground">
              No subscription usage data available.
            </p>

          </div>

        )}

      </section>


      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        <TodaysFocus />

        <ActiveProjects />

      </section>


      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">

        <RecentActivity />


        <div className="rounded-[28px] border border-border bg-gradient-to-br from-[#0A3F61] to-[#06283D] p-7 text-white shadow-[0_10px_35px_rgba(10,63,97,0.16)]">

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10">

            <Sparkles
              size={20}
            />

          </div>


          <h2 className="mt-6 text-xl font-semibold">

            Studio intelligence

          </h2>


          <p className="mt-2 max-w-md text-sm leading-6 text-white/70">

            Your dashboard is now focused on active work, payments,
            marketplace opportunities and the things that need attention.

          </p>


          <div className="mt-8 grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-2xl font-bold">

                {
                  metrics?.activeAlbums ??
                  0
                }

              </p>

              <p className="mt-1 text-xs text-white/60">

                Active Albums

              </p>

            </div>


            <div className="rounded-2xl bg-white/10 p-4">

              <p className="text-2xl font-bold">

                {
                  metrics?.totalAssets ??
                  0
                }

              </p>

              <p className="mt-1 text-xs text-white/60">

                Total Assets

              </p>

            </div>

          </div>

        </div>

      </section>

    </main>

  );

}
