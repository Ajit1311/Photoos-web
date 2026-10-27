"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  Activity,
  ArrowUpRight,
  BarChart3,
  Megaphone,
  QrCode,
  RefreshCcw,
  TrendingUp,
  UserPlus,
  Users,
  Camera,
  Target,
  Loader2,
} from "lucide-react";

import {
  getPlatformMarketingDashboard,
  type PlatformMarketingDashboard,
} from "@/lib/api/platform-admin";

function number(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

type KpiProps = {
  title: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
};

function KpiCard({
  title,
  value,
  detail,
  icon: Icon,
}: KpiProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="flex items-start justify-between">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61]/8 text-[#0A3F61]">
          <Icon className="h-5 w-5" />
        </div>

        <span className="flex items-center gap-1 text-[11px] font-medium text-emerald-600">
          <Activity className="h-3.5 w-3.5" />
          Live
        </span>
      </div>

      <div className="mt-5">
        <div className="text-xs font-medium text-slate-500">
          {title}
        </div>

        <div className="mt-1 text-2xl font-bold tracking-tight text-slate-950">
          {value}
        </div>

        <div className="mt-1 text-xs text-slate-400">
          {detail}
        </div>
      </div>
    </div>
  );
}

function ProgressRow({
  label,
  value,
  total,
}: {
  label: string;
  value: number;
  total: number;
}) {
  const percent =
    total > 0
      ? Math.min(100, Math.round((value / total) * 100))
      : 0;

  return (
    <div>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">
          {label}
        </span>
        <span className="text-slate-500">
          {number(value)}
        </span>
      </div>

      <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-[#0A3F61]"
          style={{ width: `${Math.max(percent, value > 0 ? 4 : 0)}%` }}
        />
      </div>
    </div>
  );
}

export default function MarketingDashboardPage() {
  const [data, setData] =
    useState<PlatformMarketingDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    try {
      if (refresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const result =
        await getPlatformMarketingDashboard();

      setData(result);
    } catch (err) {
      console.error(
        "MARKETING DASHBOARD LOAD ERROR:",
        err,
      );

      setError(
        err instanceof Error
          ? err.message
          : "Unable to load marketing dashboard.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-white shadow-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
          </div>

          <div className="mt-4 text-sm font-semibold text-slate-800">
            Loading marketing data
          </div>

          <div className="mt-1 text-xs text-slate-400">
            Preparing the marketing command center...
          </div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6 lg:p-8">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
          <div className="text-sm font-semibold text-red-800">
            Marketing data unavailable
          </div>

          <div className="mt-1 text-sm text-red-600">
            {error ?? "No marketing data returned."}
          </div>

          <button
            type="button"
            onClick={() => void load(true)}
            className="mt-4 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-medium text-white"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { overview, trial_conversion, campaigns } =
    data.data;

  return (
    <div className="p-6 lg:p-8">
      {/* Header */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61]/8 text-[#0A3F61]">
              <Megaphone className="h-5 w-5" />
            </div>

            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-950">
                Marketing
              </h1>

              <p className="mt-0.5 text-sm text-slate-500">
                Growth, acquisition and conversion command center
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void load(true)}
          disabled={refreshing}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:opacity-60"
        >
          <RefreshCcw
            className={`h-4 w-4 ${
              refreshing ? "animate-spin" : ""
            }`}
          />
          Refresh
        </button>
      </div>

      {/* KPIs */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          title="Total Signups"
          value={number(overview.total_signups)}
          detail="All platform signups"
          icon={UserPlus}
        />

        <KpiCard
          title="Studio Signups"
          value={number(overview.studio_signups)}
          detail="Studio owners and admins"
          icon={Users}
        />

        <KpiCard
          title="Client Signups"
          value={number(overview.client_signups)}
          detail="Client accounts"
          icon={Users}
        />

        <KpiCard
          title="Total Leads"
          value={number(overview.total_leads)}
          detail="All recorded leads"
          icon={Target}
        />

        <KpiCard
          title="QR Scans"
          value={number(overview.qr_scans)}
          detail="QR gallery access activity"
          icon={QrCode}
        />

        <KpiCard
          title="Selfie / Face Scans"
          value={number(overview.selfie_scans)}
          detail="Marketing attribution activity"
          icon={Camera}
        />

        <KpiCard
          title="Converted Leads"
          value={number(overview.converted_leads)}
          detail={`${overview.lead_conversion_percent}% lead conversion`}
          icon={TrendingUp}
        />

        <KpiCard
          title="Trial → Paid"
          value={`${trial_conversion.conversion_percent}%`}
          detail={`${number(trial_conversion.trial_converted)} of ${number(trial_conversion.trial_signups)} trials converted`}
          icon={BarChart3}
        />
      </div>

      {/* Analytics */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] xl:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-950">
                Acquisition Overview
              </h2>

              <p className="mt-1 text-xs text-slate-400">
                Current platform acquisition signals
              </p>
            </div>

            <BarChart3 className="h-5 w-5 text-slate-400" />
          </div>

          <div className="mt-7 space-y-6">
            <ProgressRow
              label="Studio Signups"
              value={overview.studio_signups}
              total={overview.total_signups}
            />

            <ProgressRow
              label="Client Signups"
              value={overview.client_signups}
              total={overview.total_signups}
            />

            <ProgressRow
              label="Converted Leads"
              value={overview.converted_leads}
              total={overview.total_leads}
            />

            <ProgressRow
              label="Trial → Paid"
              value={trial_conversion.trial_converted}
              total={trial_conversion.trial_signups}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
          <h2 className="text-base font-semibold text-slate-950">
            Campaigns
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Existing marketing campaign activity
          </p>

          <div className="mt-6 space-y-4">
            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                Total Campaigns
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-950">
                {number(campaigns.total)}
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-xs text-slate-500">
                Sent Campaigns
              </div>

              <div className="mt-1 text-2xl font-bold text-slate-950">
                {number(campaigns.sent)}
              </div>
            </div>

            <Link
              href="/admin/marketing/campaigns"
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3 text-sm font-medium text-[#0A3F61] transition hover:bg-slate-50"
            >
              Manage campaigns
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>

      {/* Funnel */}
      <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <div>
          <h2 className="text-base font-semibold text-slate-950">
            Growth Funnel
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            QR → Selfie → Signup → Conversion signals from real data
          </p>
        </div>

        <div className="mt-6 grid gap-3 md:grid-cols-4">
          {[
            ["QR Scans", overview.qr_scans, QrCode],
            ["Selfie Scans", overview.selfie_scans, Camera],
            ["Signups", overview.total_signups, UserPlus],
            ["Converted Leads", overview.converted_leads, TrendingUp],
          ].map(([label, value, Icon]) => {
            const funnelLabel = String(label);
            const funnelValue = Number(value);
            const FunnelIcon =
              Icon as React.ComponentType<{ className?: string }>;

            return (
              <div
                key={String(label)}
                className="rounded-xl border border-slate-100 bg-slate-50 p-4"
              >
                <div className="flex items-center gap-2 text-slate-500">
                  <FunnelIcon className="h-4 w-4" />
                  <span className="text-xs font-medium">
                    {funnelLabel}
                  </span>
                </div>

                <div className="mt-2 text-xl font-bold text-slate-950">
                  {number(funnelValue)}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          {
            href: "/admin/marketing/leads",
            title: "Leads",
            detail: "All marketing and CRM leads",
            icon: Target,
          },
          {
            href: "/admin/marketing/signups",
            title: "Signups",
            detail: "Client, studio, QR and selfie attribution",
            icon: UserPlus,
          },
          {
            href: "/admin/marketing/trial-conversion",
            title: "Trial Conversion",
            detail: "Trial-to-paid performance",
            icon: TrendingUp,
          },
          {
            href: "/admin/marketing/growth",
            title: "Growth Analytics",
            detail: "Acquisition and conversion trends",
            icon: BarChart3,
          },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-slate-300"
            >
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61]/8 text-[#0A3F61]">
                  <Icon className="h-5 w-5" />
                </div>

                <ArrowUpRight className="h-4 w-4 text-slate-300 transition group-hover:text-[#0A3F61]" />
              </div>

              <div className="mt-5 text-sm font-semibold text-slate-950">
                {item.title}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                {item.detail}
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
