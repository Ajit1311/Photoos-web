"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  CheckCircle2,
  Layers3,
  RefreshCw,
  ToggleLeft,
  Users,
  Zap,
} from "lucide-react";
import {
  getPlatformAdminSoftwareFeatures,
  PlatformAdminSoftwareFeatures,
} from "@/lib/api/platform-admin";

function formatDate(value: string | null) {
  if (!value) return "Never used";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

export default function SoftwareFeaturesPage() {
  const [data, setData] = useState<PlatformAdminSoftwareFeatures | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(refresh = false) {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      setData(await getPlatformAdminSoftwareFeatures());
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load software features.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const features = data?.features ?? [];

  const maxUsage = useMemo(
    () => Math.max(...features.map((feature) => feature.usage_count), 1),
    [features],
  );

  const summary = data?.summary;

  const cards = [
    {
      label: "Total Features",
      value: summary?.total_features ?? 0,
      icon: Layers3,
    },
    {
      label: "Enabled",
      value: summary?.enabled_features ?? 0,
      icon: CheckCircle2,
    },
    {
      label: "Disabled",
      value: summary?.disabled_features ?? 0,
      icon: ToggleLeft,
    },
    {
      label: "Total Usage",
      value: summary?.total_usage ?? 0,
      icon: Activity,
    },
    {
      label: "Studios Using Features",
      value: summary?.studios_using_features ?? 0,
      icon: Users,
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Software Features
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Monitor every PhotoOS feature, availability and real usage.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={loading || refreshing}
          className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {cards.map((card) => {
          const Icon = card.icon;

          return (
            <div
              key={card.label}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">
                  {card.label}
                </span>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </div>

              <div className="mt-3 text-2xl font-semibold">
                {loading ? "—" : card.value}
              </div>
            </div>
          );
        })}
      </div>

      <section className="rounded-xl border bg-card shadow-sm">
        <div className="border-b p-5">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            <h2 className="font-semibold">All Software Features</h2>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Usage is based only on recorded PhotoOS subscription usage data.
          </p>
        </div>

        <div className="divide-y">
          {features.map((feature) => {
            const usageWidth =
              feature.usage_count > 0
                ? Math.max((feature.usage_count / maxUsage) * 100, 4)
                : 0;

            return (
              <div
                key={`${feature.feature_type}-${feature.id}`}
                className="p-5"
              >
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-medium">{feature.feature_name}</h3>

                      <span className="rounded-full border px-2 py-0.5 text-[11px]">
                        {feature.feature_type === "platform_feature"
                          ? "Platform"
                          : "Feature Flag"}
                      </span>

                      <span
                        className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                          feature.enabled
                            ? "bg-emerald-500/10 text-emerald-600"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {feature.enabled ? "Enabled" : "Disabled"}
                      </span>
                    </div>

                    <p className="mt-1 text-xs text-muted-foreground">
                      {feature.feature_key}
                    </p>

                    {feature.description && (
                      <p className="mt-2 text-sm text-muted-foreground">
                        {feature.description}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-3 gap-6 lg:min-w-[430px]">
                    <div>
                      <p className="text-xs text-muted-foreground">Usage</p>
                      <p className="mt-1 font-semibold">
                        {feature.usage_count.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Studios
                      </p>
                      <p className="mt-1 font-semibold">
                        {feature.studio_count.toLocaleString("en-IN")}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-muted-foreground">
                        Rollout
                      </p>
                      <p className="mt-1 font-semibold">
                        {feature.rollout_percentage == null
                          ? "100%"
                          : `${feature.rollout_percentage}%`}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="mb-1 flex justify-between text-[11px] text-muted-foreground">
                    <span>Usage intensity</span>
                    <span>
                      {feature.usage_count.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="h-2 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground transition-all"
                      style={{ width: `${usageWidth}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <Activity className="h-3.5 w-3.5" />
                  Last used: {formatDate(feature.last_used_at)}
                </div>
              </div>
            );
          })}

          {!loading && features.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No software features found.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
