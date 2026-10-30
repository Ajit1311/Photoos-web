"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Smartphone,
  RefreshCcw,
} from "lucide-react";

import {
  getPlatformAdminAppAnalytics,
  type PlatformAdminAppAnalytics,
} from "@/lib/api/platform-admin";

export default function Page() {
  const [data, setData] = useState<PlatformAdminAppAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

      setData(result);
    } catch {
      setError("Unable to load installation tracking status.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const Icon = Smartphone;

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-sm font-medium text-slate-500">
          Loading tracking status...
        </div>
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">
              Uninstalls
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Client App uninstall tracking from GA4.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-800">
            Unable to load tracking status
          </div>

          <div className="mt-1 text-sm text-red-600">
            {error}
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-4 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-semibold text-white"
          >
            Retry
          </button>
        </div>
      ) : (
        <div className="mt-8 max-w-3xl">
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white text-amber-600 shadow-sm">
                <Activity className="h-5 w-5" />
              </div>

              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-lg font-bold text-slate-950">
                    Uninstalls data is not available yet
                  </h2>

                  <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">
                    GA4 Pending
                  </span>
                </div>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Uninstall tracking is not available until GA4/app tracking is connected.
                </p>

                <div className="mt-5 rounded-xl border border-amber-200 bg-white/70 p-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                    Current backend status
                  </div>

                  <div className="mt-1 text-sm font-semibold text-slate-900">
                    {data?.tracking_status ?? "ga4_pending"}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
