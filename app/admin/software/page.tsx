"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Cpu,
  Database,
  HardDrive,
  Layers3,
  RefreshCw,
  Server,
  Users,
  Zap,
} from "lucide-react";
import {
  getPlatformAdminSoftwareOverview,
  PlatformAdminSoftwareOverview,
} from "@/lib/api/platform-admin";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(index ? 1 : 0)} ${units[index]}`;
}

export default function SoftwareOverviewPage() {
  const [data, setData] = useState<PlatformAdminSoftwareOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(refresh = false) {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      setData(await getPlatformAdminSoftwareOverview());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load software overview.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = data?.summary;

  const cards = [
    {
      label: "Active Plans",
      value: summary?.active_plans ?? 0,
      icon: Layers3,
    },
    {
      label: "Active Subscriptions",
      value: summary?.active_subscriptions ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Free Trials",
      value: summary?.trial_subscriptions ?? 0,
      icon: Zap,
    },
    {
      label: "Cancelled",
      value: summary?.cancelled_subscriptions ?? 0,
      icon: Activity,
    },
    {
      label: "Platform Features",
      value: `${summary?.enabled_platform_feature_flags ?? 0}/${summary?.platform_feature_flags ?? 0}`,
      icon: Server,
    },
    {
      label: "Studios",
      value: data?.health?.studios ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Software Overview</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            PhotoOS software plans, subscriptions, platform features and system health.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div key={card.label} className="rounded-xl border bg-card p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{card.label}</span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <div className="mt-3 text-2xl font-semibold">
                {loading ? "—" : card.value}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Database className="h-5 w-5" />
            <h2 className="font-semibold">Subscription Plans</h2>
          </div>

          <div className="space-y-3">
            {(data?.plans ?? []).map((plan) => (
              <div
                key={plan.id}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div>
                  <p className="font-medium">{plan.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {plan.plan_code} · {plan.billing_cycle}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">
                    ₹{plan.price.toLocaleString("en-IN")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.trial_days > 0 ? `${plan.trial_days}-day trial` : "Paid"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Cpu className="h-5 w-5" />
            <h2 className="font-semibold">System Health</h2>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Studios", data?.health?.studios ?? 0],
              ["Assets", data?.health?.assets ?? 0],
              ["AI Jobs", data?.health?.ai_jobs ?? 0],
              ["Notifications", data?.health?.notifications ?? 0],
              ["Enabled Features", data?.health?.enabled_features ?? 0],
              ["Feature Flags", summary?.feature_flags ?? 0],
            ].map(([label, value]) => (
              <div key={String(label)} className="rounded-lg border p-3">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-1 text-lg font-semibold">{value}</p>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <HardDrive className="h-5 w-5" />
          <h2 className="font-semibold">Platform Usage</h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Storage</p>
            <p className="mt-1 text-lg font-semibold">
              {formatBytes(data?.usage.storage_bytes ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Bandwidth</p>
            <p className="mt-1 text-lg font-semibold">
              {formatBytes(data?.usage.bandwidth_bytes ?? 0)}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Uploads</p>
            <p className="mt-1 text-lg font-semibold">
              {data?.usage.uploads ?? 0}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Gallery Views</p>
            <p className="mt-1 text-lg font-semibold">
              {data?.usage.gallery_views ?? 0}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Zap className="h-5 w-5" />
          <h2 className="font-semibold">Platform Feature Flags</h2>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data?.platform_feature_flags ?? []).map((flag) => (
            <div key={flag.id} className="rounded-lg border p-3">
              <div className="flex items-center justify-between gap-3">
                <span className="font-medium">{flag.name}</span>
                <span
                  className={`text-xs font-medium ${
                    flag.enabled ? "text-emerald-600" : "text-muted-foreground"
                  }`}
                >
                  {flag.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {flag.description || flag.key}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
