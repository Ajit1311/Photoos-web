"use client";

import { useEffect, useState } from "react";
import {
  getPlatformAdminAppAnalytics,
  type PlatformAdminAppAnalytics,
} from "@/lib/api/platform-admin";
import {
  Activity,
  CalendarCheck2,
  Download,
  QrCode,
  RefreshCcw,
  Smartphone,
  UserPlus,
  Users,
} from "lucide-react";

function formatNumber(value: number | null) {
  if (value === null || value === undefined) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN").format(value);
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61]/8 text-[#0A3F61]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-slate-500">
          {title}
        </div>

        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          {description}
        </div>
      </div>
    </div>
  );
}

export default function AppAnalyticsPage() {
  const [analytics, setAnalytics] =
    useState<PlatformAdminAppAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  async function load(refresh = false) {
    setError(null);

    if (refresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const result =
        await getPlatformAdminAppAnalytics<PlatformAdminAppAnalytics>(
          "overview",
        );

      setAnalytics(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err
          : new Error("Unable to load app analytics."),
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const reload = async () => {
    await load(true);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading app analytics...
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="mx-auto max-w-7xl p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-800">
            Unable to load app analytics
          </div>

          <div className="mt-1 text-sm text-red-600">
            {error?.message ?? "No analytics data returned."}
          </div>

          <button
            type="button"
            onClick={() => void reload()}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-semibold text-white"
          >
            <RefreshCcw className="h-4 w-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white">
              <Smartphone className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                App Analytics
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Client App usage, users, bookings and installation tracking.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void reload()}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            User & Growth
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Registered Users"
            value={formatNumber(analytics.registered_users)}
            description="Total registered client users"
            icon={Users}
          />

          <MetricCard
            title="Sign-ups"
            value={formatNumber(analytics.signups_30d)}
            description="New users in last 30 days"
            icon={UserPlus}
          />

          <MetricCard
            title="Active Users"
            value={formatNumber(analytics.active_users_30d)}
            description="Active users in last 30 days"
            icon={Activity}
          />

          <MetricCard
            title="Total Bookings"
            value={formatNumber(analytics.total_bookings)}
            description="All recorded bookings"
            icon={CalendarCheck2}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
            Booking Activity
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            title="Bookings (30d)"
            value={formatNumber(analytics.bookings_30d)}
            description="Bookings in last 30 days"
            icon={CalendarCheck2}
          />
        </div>
      </div>

      <div className="mt-8">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500">
              Installation Tracking
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              Install metrics will populate after GA4/app tracking integration.
            </p>
          </div>

          <span className="inline-flex w-fit items-center rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
            {analytics.tracking_status === "ga4_pending"
              ? "GA4 Pending"
              : analytics.tracking_status}
          </span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <MetricCard
            title="App Installs"
            value={formatNumber(analytics.installs)}
            description="GA4 tracking pending"
            icon={Download}
          />

          <MetricCard
            title="Uninstalls"
            value={formatNumber(analytics.uninstalls)}
            description="GA4 tracking pending"
            icon={Smartphone}
          />

          <MetricCard
            title="QR Installs"
            value={formatNumber(analytics.qr_installs)}
            description="QR attribution tracking pending"
            icon={QrCode}
          />
        </div>
      </div>

      <div className="mt-8 rounded-2xl border border-slate-200 bg-white p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Activity className="h-4 w-4" />
          </div>

          <div>
            <div className="text-sm font-semibold text-slate-900">
              Tracking Status
            </div>

            <div className="mt-1 text-xs text-slate-500">
              Current backend status: {analytics.tracking_status}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
