"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  BarChart3,
  Bot,
  Database,
  Download,
  FileStack,
  KeyRound,
  RefreshCw,
  Server,
  Upload,
  Users,
  Zap,
} from "lucide-react";
import { useState } from "react";

import { getPlatformAdminSoftwareUsage } from "@/lib/api/platform-admin";

function formatBytes(bytes: number) {
  if (!bytes) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];
  const index = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    units.length - 1,
  );

  return `${(bytes / 1024 ** index).toFixed(index === 0 ? 0 : 2)} ${
    units[index]
  }`;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value || 0);
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
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
      {detail ? (
        <p className="mt-1 text-xs text-slate-500">{detail}</p>
      ) : null}
    </div>
  );
}

export default function SoftwareUsagePage() {
  const today = new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(
    new Date(Date.now() - 29 * 86400000)
      .toISOString()
      .slice(0, 10),
  );
  const [dateTo, setDateTo] = useState(today);

  const query = useQuery({
    queryKey: ["platform-admin-software-usage", dateFrom, dateTo],
    queryFn: () =>
      getPlatformAdminSoftwareUsage({
        dateFrom,
        dateTo,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  const subscriptionUsage = data?.subscription_usage ?? [];
  const storageUsage = data?.storage_usage ?? [];
  const apiUsage = data?.api_usage ?? [];
  const aiUsage = data?.ai_usage ?? [];
  const analyticsUsage = data?.analytics_usage ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Software Usage
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Monitor recorded platform, storage, API, AI and analytics usage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(event) => setDateFrom(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={dateTo}
            onChange={(event) => setDateTo(event.target.value)}
            className="rounded-lg border px-3 py-2 text-sm"
          />
          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm font-medium hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      {query.isLoading ? (
        <div className="rounded-2xl border bg-white p-10 text-center text-sm text-slate-500">
          Loading software usage...
        </div>
      ) : query.isError ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
          {query.error instanceof Error
            ? query.error.message
            : "Failed to load software usage."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <KpiCard
              icon={Zap}
              label="Subscription Usage"
              value={formatNumber(summary?.subscription_usage_total ?? 0)}
              detail={`${summary?.subscription_usage_rows ?? 0} records`}
            />
            <KpiCard
              icon={Database}
              label="Storage Used"
              value={formatBytes(summary?.storage_bytes ?? 0)}
              detail={`${formatNumber(summary?.storage_file_count ?? 0)} files`}
            />
            <KpiCard
              icon={KeyRound}
              label="API Keys"
              value={formatNumber(summary?.api_keys_total ?? 0)}
              detail={`${formatNumber(summary?.api_keys_active ?? 0)} active`}
            />
            <KpiCard
              icon={Bot}
              label="AI Requests"
              value={formatNumber(summary?.ai_requests ?? 0)}
              detail={`${formatNumber(summary?.ai_total_tokens ?? 0)} tokens`}
            />
            <KpiCard
              icon={Upload}
              label="Uploads"
              value={formatNumber(summary?.analytics_uploads ?? 0)}
            />
            <KpiCard
              icon={Download}
              label="Downloads"
              value={formatNumber(summary?.analytics_downloads ?? 0)}
            />
            <KpiCard
              icon={FileStack}
              label="Assets"
              value={formatNumber(summary?.analytics_asset_count ?? 0)}
            />
            <KpiCard
              icon={Users}
              label="Active Clients"
              value={formatNumber(summary?.analytics_active_clients ?? 0)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-semibold text-slate-900">
                  Subscription Feature Usage
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Feature</th>
                      <th className="px-5 py-3">Used</th>
                      <th className="px-5 py-3">Limit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subscriptionUsage.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No subscription usage recorded.
                        </td>
                      </tr>
                    ) : (
                      subscriptionUsage.map((item) => (
                        <tr key={item.feature_key} className="border-b">
                          <td className="px-5 py-3 font-medium">
                            {item.feature_key}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.used_count)}
                          </td>
                          <td className="px-5 py-3">
                            {item.limit_count === null
                              ? "Unlimited"
                              : formatNumber(item.limit_count)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-semibold text-slate-900">
                  API Usage
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Studio</th>
                      <th className="px-5 py-3">Total</th>
                      <th className="px-5 py-3">Active</th>
                      <th className="px-5 py-3">Revoked</th>
                    </tr>
                  </thead>
                  <tbody>
                    {apiUsage.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No API usage recorded.
                        </td>
                      </tr>
                    ) : (
                      apiUsage.map((item) => (
                        <tr
                          key={item.studio_id ?? "unknown"}
                          className="border-b"
                        >
                          <td className="px-5 py-3">
                            {item.studio_id ?? "—"}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.total_api_keys)}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.active_api_keys)}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.revoked_api_keys)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <section className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-semibold text-slate-900">
                  AI Provider Usage
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Job Type</th>
                      <th className="px-5 py-3">Requests</th>
                      <th className="px-5 py-3">Tokens</th>
                      <th className="px-5 py-3">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {aiUsage.length === 0 ? (
                      <tr>
                        <td
                          colSpan={4}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No AI usage recorded.
                        </td>
                      </tr>
                    ) : (
                      aiUsage.map((item, index) => (
                        <tr
                          key={`${item.provider_id}-${item.model_id}-${item.job_type}-${index}`}
                          className="border-b"
                        >
                          <td className="px-5 py-3 font-medium">
                            {item.job_type}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.request_count)}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.total_tokens)}
                          </td>
                          <td className="px-5 py-3">
                            {data?.currency ?? "INR"}{" "}
                            {Number(item.estimated_cost ?? 0).toFixed(2)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-2xl border bg-white shadow-sm">
              <div className="border-b p-5">
                <h2 className="font-semibold text-slate-900">
                  Storage Usage
                </h2>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Studio</th>
                      <th className="px-5 py-3">Storage</th>
                      <th className="px-5 py-3">Files</th>
                    </tr>
                  </thead>
                  <tbody>
                    {storageUsage.length === 0 ? (
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-8 text-center text-slate-500"
                        >
                          No storage usage recorded.
                        </td>
                      </tr>
                    ) : (
                      storageUsage.map((item) => (
                        <tr key={item.studio_id} className="border-b">
                          <td className="px-5 py-3">{item.studio_id}</td>
                          <td className="px-5 py-3">
                            {formatBytes(item.used_bytes)}
                          </td>
                          <td className="px-5 py-3">
                            {formatNumber(item.file_count)}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          <section className="rounded-2xl border bg-white shadow-sm">
            <div className="flex items-center gap-2 border-b p-5">
              <BarChart3 className="h-5 w-5" />
              <div>
                <h2 className="font-semibold text-slate-900">
                  Analytics Usage Trend
                </h2>
                <p className="text-xs text-slate-500">
                  Recorded daily usage for the selected period.
                </p>
              </div>
            </div>

            {analyticsUsage.length === 0 ? (
              <div className="p-10 text-center text-sm text-slate-500">
                No analytics usage recorded.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b bg-slate-50 text-left text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Date</th>
                      <th className="px-5 py-3">Uploads</th>
                      <th className="px-5 py-3">Downloads</th>
                      <th className="px-5 py-3">Assets</th>
                      <th className="px-5 py-3">Gallery Views</th>
                      <th className="px-5 py-3">AI Seconds</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analyticsUsage.map((item) => (
                      <tr key={item.usage_date} className="border-b">
                        <td className="px-5 py-3">{item.usage_date}</td>
                        <td className="px-5 py-3">
                          {formatNumber(item.upload_count)}
                        </td>
                        <td className="px-5 py-3">
                          {formatNumber(item.download_count)}
                        </td>
                        <td className="px-5 py-3">
                          {formatNumber(item.asset_count)}
                        </td>
                        <td className="px-5 py-3">
                          {formatNumber(item.gallery_view_count)}
                        </td>
                        <td className="px-5 py-3">
                          {Number(
                            item.ai_processing_seconds ?? 0,
                          ).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <section className="rounded-2xl border bg-slate-50 p-5 text-sm text-slate-600">
            <div className="flex items-center gap-2 font-medium text-slate-800">
              <Server className="h-4 w-4" />
              Usage reporting boundary
            </div>
            <p className="mt-2">
              This dashboard reports usage recorded in the existing
              PhotoOS usage tables. It does not infer usage from unrelated
              business records.
            </p>
          </section>
        </>
      )}
    </div>
  );
}
