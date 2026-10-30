"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  Bell,
  Boxes,
  CheckCircle2,
  Database,
  Flag,
  RefreshCw,
  Server,
  Settings2,
  Sparkles,
  Users,
  XCircle,
  Zap,
} from "lucide-react";

import { getPlatformAdminSystemHealth } from "@/lib/api/platform-admin";

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
}

function StatusBadge({ enabled }: { enabled: boolean }) {
  return enabled ? (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-700">
      <CheckCircle2 className="h-3.5 w-3.5" />
      Enabled
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700">
      <XCircle className="h-3.5 w-3.5" />
      Disabled
    </span>
  );
}

function KpiCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Activity;
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="rounded-xl bg-slate-100 p-2.5">
          <Icon className="h-5 w-5 text-slate-700" />
        </div>
      </div>

      <p className="mt-4 text-sm text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </p>

      {detail ? (
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      ) : null}
    </div>
  );
}

export default function SystemHealthPage() {
  const query = useQuery({
    queryKey: ["platform-admin-system-health"],
    queryFn: getPlatformAdminSystemHealth,
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  const platformFeatures = data?.platform_features ?? [];
  const customFeatures = data?.custom_features ?? [];
  const configurations = data?.platform_configurations ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            System Health
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Platform health, feature flags and runtime configuration.
          </p>
        </div>

        <button
          type="button"
          onClick={() => query.refetch()}
          className="inline-flex items-center justify-center gap-2 rounded-lg border bg-white px-4 py-2 text-sm font-medium hover:bg-slate-50"
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </button>
      </div>

      {query.isLoading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading system health...
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load system health."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <KpiCard
              icon={Server}
              label="Studios"
              value={formatNumber(summary?.studios ?? 0)}
            />
            <KpiCard
              icon={Boxes}
              label="Assets"
              value={formatNumber(summary?.assets ?? 0)}
            />
            <KpiCard
              icon={Sparkles}
              label="AI Jobs"
              value={formatNumber(summary?.ai_jobs ?? 0)}
            />
            <KpiCard
              icon={Bell}
              label="Notifications"
              value={formatNumber(summary?.notifications ?? 0)}
            />
            <KpiCard
              icon={Flag}
              label="Platform Features"
              value={`${formatNumber(
                summary?.enabled_platform_feature_flags ?? 0,
              )}/${formatNumber(
                summary?.platform_feature_flags ?? 0,
              )}`}
              detail="enabled"
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-3">
            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-emerald-50 p-2.5">
                  <Activity className="h-5 w-5 text-emerald-600" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Platform Health
                  </h2>
                  <p className="text-xs text-slate-500">
                    Current system snapshot
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {[
                  ["Studios", summary?.studios ?? 0],
                  ["Assets", summary?.assets ?? 0],
                  ["AI Jobs", summary?.ai_jobs ?? 0],
                  ["Notifications", summary?.notifications ?? 0],
                  [
                    "Enabled Features",
                    summary?.enabled_features ?? 0,
                  ],
                ].map(([label, value]) => (
                  <div
                    key={String(label)}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <span className="text-sm text-slate-600">
                      {label}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {formatNumber(Number(value))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Feature Flags
                  </h2>
                  <p className="text-xs text-slate-500">
                    Platform and custom flags
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">
                    Platform Flags
                  </span>
                  <span className="font-semibold">
                    {formatNumber(
                      summary?.platform_feature_flags ?? 0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">
                    Enabled
                  </span>
                  <span className="font-semibold text-emerald-600">
                    {formatNumber(
                      summary?.enabled_platform_feature_flags ?? 0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between border-b pb-3">
                  <span className="text-sm text-slate-600">
                    Disabled
                  </span>
                  <span className="font-semibold text-red-600">
                    {formatNumber(
                      summary?.disabled_platform_feature_flags ?? 0,
                    )}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-sm text-slate-600">
                    Custom Flags
                  </span>
                  <span className="font-semibold">
                    {formatNumber(
                      summary?.custom_feature_flags ?? 0,
                    )}
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-xl bg-slate-100 p-2.5">
                  <Settings2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Platform Configuration
                  </h2>
                  <p className="text-xs text-slate-500">
                    Active configuration registry
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {configurations.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    No platform configurations found.
                  </p>
                ) : (
                  configurations.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 border-b pb-3 last:border-0"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-slate-900">
                          {item.key}
                        </p>
                        <p className="text-xs text-slate-500">
                          {item.description ?? "No description"}
                        </p>
                      </div>

                      <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700">
                        {item.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <div className="flex items-center gap-3">
                <Flag className="h-5 w-5" />
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Platform Feature Flags
                  </h2>
                  <p className="text-xs text-slate-500">
                    {formatNumber(platformFeatures.length)} recorded
                    platform features
                  </p>
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Feature</th>
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {platformFeatures.map((feature) => (
                    <tr key={feature.id} className="border-b">
                      <td className="px-5 py-3 font-medium text-slate-900">
                        {feature.name}
                      </td>
                      <td className="px-5 py-3 font-mono text-xs text-slate-600">
                        {feature.key}
                      </td>
                      <td className="px-5 py-3">
                        <StatusBadge enabled={feature.enabled} />
                      </td>
                      <td className="px-5 py-3 text-slate-600">
                        {feature.description ?? "—"}
                      </td>
                    </tr>
                  ))}

                  {platformFeatures.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No platform feature flags found.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="border-b p-5">
              <h2 className="font-semibold text-slate-900">
                Custom Feature Flags
              </h2>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b bg-slate-50 text-left text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Feature</th>
                    <th className="px-5 py-3">Key</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Rollout</th>
                  </tr>
                </thead>
                <tbody>
                  {customFeatures.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-slate-500"
                      >
                        No custom feature flags recorded.
                      </td>
                    </tr>
                  ) : (
                    customFeatures.map((feature) => (
                      <tr key={feature.id} className="border-b">
                        <td className="px-5 py-3 font-medium">
                          {feature.feature_name}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">
                          {feature.feature_key}
                        </td>
                        <td className="px-5 py-3">{feature.status}</td>
                        <td className="px-5 py-3">
                          {feature.rollout_percentage ?? 0}%
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>

          <div className="rounded-2xl border bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Database className="h-4 w-4" />
              Health reporting boundary
            </div>
            <p className="mt-2">
              System Health reports the existing PhotoOS health snapshot,
              platform feature flags and platform configuration registry.
              It does not infer infrastructure health that is not recorded
              by the current backend.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Users className="h-3.5 w-3.5" />
            Generated:{" "}
            {data?.generated_at
              ? new Date(data.generated_at).toLocaleString("en-IN")
              : "—"}
          </div>
        </>
      )}
    </div>
  );
}
