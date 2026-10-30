"use client";

import {
  ArrowLeft,
  CheckCircle2,
  Clock3,
  Share2,
  Filter,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  UserPlus,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformMarketingGrowthAnalytics,
  type PlatformMarketingGrowthAnalytics,
} from "@/lib/api/platform-admin";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const normalized = String(value).trim();
  const date = new Date(
    /^\d{4}-\d{2}-\d{2}$/.test(normalized)
      ? `${normalized}T00:00:00`
      : normalized,
  );

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

export default function MarketingGrowthPage() {
  const [data, setData] =
    useState<PlatformMarketingGrowthAnalytics | null>(null);

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAnalytics = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response =
        await getPlatformMarketingGrowthAnalytics({
          from: from || undefined,
          to: to || undefined,
        });

      setData(response.data);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load growth analytics.",
      );
    } finally {
      setLoading(false);
    }
  }, [from, to]);

  useEffect(() => {
    void loadAnalytics();
  }, [loadAnalytics]);

  const funnel = data?.funnel;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/ops-console/marketing"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Marketing
              </Link>
              <span>/</span>
              <span>Growth Analytics</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Growth Analytics
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Track signup growth, acquisition funnel and marketing conversion.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadAnalytics()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 md:flex-row md:items-end">
            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                From
              </label>
              <input
                type="date"
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium text-slate-500">
                To
              </label>
              <input
                type="date"
                value={to}
                onChange={(event) => setTo(event.target.value)}
                className="h-10 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <button
              type="button"
              onClick={() => void loadAnalytics()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Filter className="h-4 w-4" />
              Apply
            </button>

            {data && (
              <div className="text-sm text-slate-500 md:ml-auto">
                {formatDate(data.period.from)} –{" "}
                {formatDate(data.period.to)}
              </div>
            )}
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<UserPlus className="h-5 w-5" />}
            label="Signups"
            value={formatNumber(
              data?.funnel.signups ?? 0,
            )}
          />

          <MetricCard
            icon={<Users className="h-5 w-5" />}
            label="QR Scans"
            value={formatNumber(
              data?.funnel.qr_scans ?? 0,
            )}
          />

          <MetricCard
            icon={<Search className="h-5 w-5" />}
            label="Selfie Scans"
            value={formatNumber(
              data?.funnel.selfie_scans ?? 0,
            )}
          />

          <MetricCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Trial → Paid"
            value={`${Number(
              data?.trial_conversion.conversion_percent ?? 0,
            ).toFixed(1)}%`}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">
                Signup Trend
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Daily signup activity from the selected period.
              </p>
            </div>

            <div className="p-5">
              {loading ? (
                <EmptyState text="Loading signup trend..." />
              ) : !data?.signup_trend?.length ? (
                <EmptyState text="No signup data available." />
              ) : (
                <div className="space-y-3">
                  {data.signup_trend
                    .filter((row) => row.total > 0)
                    .map((row) => (
                      <div
                        key={row.date}
                        className="flex items-center gap-4"
                      >
                        <div className="w-24 text-sm text-slate-500">
                          {formatDate(row.date)}
                        </div>

                        <div className="h-8 flex-1 overflow-hidden rounded-lg bg-slate-100">
                          <div
                            className="flex h-full items-center rounded-lg bg-slate-800 px-3 text-xs font-medium text-white"
                            style={{
                              width: `${Math.max(
                                20,
                                Math.min(100, row.total * 20),
                              )}%`,
                            }}
                          >
                            {row.total}
                          </div>
                        </div>

                        <div className="w-24 text-right text-xs text-slate-500">
                          {row.studio} studio · {row.client} client
                        </div>
                      </div>
                    ))}

                  {!data.signup_trend.some(
                    (row) => row.total > 0,
                  ) && (
                    <EmptyState text="No signup activity in this period." />
                  )}
                </div>
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">
                Acquisition Funnel
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                QR → Selfie → Signup → Converted Lead.
              </p>
            </div>

            <div className="space-y-3 p-5">
              <FunnelRow
                label="QR Scans"
                value={funnel?.qr_scans ?? 0}
                icon={<Users className="h-4 w-4" />}
              />

              <FunnelRow
                label="Selfie Scans"
                value={funnel?.selfie_scans ?? 0}
                icon={<Search className="h-4 w-4" />}
              />

              <FunnelRow
                label="Signups"
                value={funnel?.signups ?? 0}
                icon={<UserPlus className="h-4 w-4" />}
              />

              <FunnelRow
                label="Converted Leads"
                value={funnel?.converted_leads ?? 0}
                icon={<CheckCircle2 className="h-4 w-4" />}
              />
            </div>
          </section>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">
                Signup Mix
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Client and studio signup distribution.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {data?.signup_type?.length ? (
                data.signup_type.map((item) => (
                  <div
                    key={item.type}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                  >
                    <span className="text-sm font-medium capitalize text-slate-700">
                      {item.type}
                    </span>
                    <span className="text-lg font-semibold text-slate-900">
                      {formatNumber(item.count)}
                    </span>
                  </div>
                ))
              ) : (
                <EmptyState text="No signup mix data." />
              )}
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-200 p-5">
              <h2 className="font-semibold text-slate-900">
                Social Sources
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Lead acquisition sources recorded in the system.
              </p>
            </div>

            <div className="space-y-3 p-5">
              {data?.social_sources?.length ? (
                data.social_sources.map((item) => (
                  <div
                    key={item.source}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <Share2 className="h-4 w-4 text-slate-500" />
                      <span className="text-sm font-medium text-slate-700">
                        {item.source}
                      </span>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900">
                        {formatNumber(item.leads)} leads
                      </div>
                      <div className="text-xs text-slate-500">
                        {formatNumber(item.converted)} converted
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <EmptyState text="No social lead data." />
              )}
            </div>
          </section>
        </div>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Campaign Performance
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Actual campaign delivery performance.
            </p>
          </div>

          <div className="overflow-x-auto">
            {data?.campaign_performance?.length ? (
              <table className="min-w-[850px] w-full">
                <thead className="bg-slate-50">
                  <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <th className="px-5 py-4">Campaign</th>
                    <th className="px-5 py-4">Status</th>
                    <th className="px-5 py-4">Recipients</th>
                    <th className="px-5 py-4">Sent</th>
                    <th className="px-5 py-4">Failed</th>
                    <th className="px-5 py-4">Delivery</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {data.campaign_performance.map((item) => (
                    <tr key={item.campaign_id}>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {item.title ?? "Untitled Campaign"}
                      </td>
                      <td className="px-5 py-4 text-sm capitalize text-slate-600">
                        {item.status}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatNumber(item.recipients)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatNumber(item.sent)}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatNumber(item.failed)}
                      </td>
                      <td className="px-5 py-4 text-sm font-medium text-slate-900">
                        {Number(item.delivery_percent).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <EmptyState text="No campaign activity in this period." />
            )}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 p-5">
            <h2 className="font-semibold text-slate-900">
              Trial Conversion
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Trial accounts converted to paid subscriptions.
            </p>
          </div>

          <div className="grid gap-4 p-5 sm:grid-cols-3">
            <SummaryBox
              icon={<Clock3 className="h-5 w-5" />}
              label="Trials"
              value={data?.trial_conversion.trials ?? 0}
            />

            <SummaryBox
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Converted"
              value={data?.trial_conversion.converted ?? 0}
            />

            <SummaryBox
              icon={<TrendingUp className="h-5 w-5" />}
              label="Conversion Rate"
              value={`${Number(
                data?.trial_conversion.conversion_percent ?? 0,
              ).toFixed(1)}%`}
            />
          </div>
        </section>
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function FunnelRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-100 p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
        <span className="text-sm font-medium text-slate-700">
          {label}
        </span>
      </div>

      <span className="text-lg font-semibold text-slate-900">
        {formatNumber(value)}
      </span>
    </div>
  );
}

function SummaryBox({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-2 text-xl font-semibold text-slate-900">
        {value}
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="py-8 text-center text-sm text-slate-500">
      {text}
    </div>
  );
}
