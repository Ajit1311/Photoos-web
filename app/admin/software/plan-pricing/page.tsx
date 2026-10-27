"use client";

import { useEffect, useState } from "react";
import {
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  RefreshCw,
  Tag,
  TrendingDown,
} from "lucide-react";

import {
  getPlatformAdminSoftwarePlanPricing,
  PlatformAdminSoftwarePlanPricing,
} from "@/lib/api/platform-admin";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SoftwarePlanPricingPage() {
  const [data, setData] =
    useState<PlatformAdminSoftwarePlanPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const result = await getPlatformAdminSoftwarePlanPricing();
      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load plan pricing.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = data?.summary;

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            SOFTWARE
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">
            Plan Pricing
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Authoritative pricing, billing cycles and commercial metadata
            for PhotoOS software plans.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium hover:bg-muted disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-6">
        <Stat
          icon={<Tag className="h-5 w-5" />}
          label="Total Plans"
          value={summary?.total_plans ?? 0}
        />
        <Stat
          icon={<CheckCircle2 className="h-5 w-5" />}
          label="Active"
          value={summary?.active_plans ?? 0}
        />
        <Stat
          icon={<Clock3 className="h-5 w-5" />}
          label="Monthly"
          value={summary?.monthly_plans ?? 0}
        />
        <Stat
          icon={<TrendingDown className="h-5 w-5" />}
          label="Yearly"
          value={summary?.yearly_plans ?? 0}
        />
        <Stat
          icon={<BadgeIndianRupee className="h-5 w-5" />}
          label="Min Price"
          value={money(summary?.min_price ?? 0, data?.currency ?? "INR")}
        />
        <Stat
          icon={<BadgeIndianRupee className="h-5 w-5" />}
          label="Max Price"
          value={money(summary?.max_price ?? 0, data?.currency ?? "INR")}
        />
      </div>

      <div className="rounded-2xl border bg-card">
        <div className="border-b px-5 py-4">
          <h2 className="font-semibold">Software Pricing Matrix</h2>
          <p className="text-sm text-muted-foreground">
            Current prices and billing configuration from the platform
            pricing source.
          </p>
        </div>

        <div className="grid gap-5 p-5 md:grid-cols-2 xl:grid-cols-3">
          {(data?.plans ?? []).map((plan) => (
            <div
              key={plan.id}
              className="rounded-2xl border p-5 transition-shadow hover:shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold">{plan.name}</h3>
                    {plan.popular && (
                      <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Popular
                      </span>
                    )}
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.plan_code}
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                    plan.is_active
                      ? "bg-emerald-500/10 text-emerald-700"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {plan.is_active ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-5 flex items-end gap-2">
                <span className="text-3xl font-bold">
                  {money(plan.price, plan.currency)}
                </span>
                <span className="pb-1 text-sm text-muted-foreground">
                  / {plan.billing_cycle}
                </span>
              </div>

              {plan.description && (
                <p className="mt-3 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3">
                <Metric
                  label="Subscriptions"
                  value={plan.subscription_count}
                />
                <Metric
                  label="Active"
                  value={plan.active_subscription_count}
                />
                <Metric
                  label="Trial"
                  value={plan.trial_subscription_count ?? 0}
                />
                <Metric
                  label="Revenue"
                  value={money(plan.revenue ?? 0, plan.currency)}
                />
              </div>

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full bg-muted px-2.5 py-1 text-xs">
                  {plan.billing_cycle}
                </span>

                {plan.trial_days > 0 && (
                  <span className="rounded-full bg-blue-500/10 px-2.5 py-1 text-xs text-blue-700">
                    {plan.trial_days}-day trial
                  </span>
                )}

                {(plan.yearly_savings ?? 0) > 0 && (
                  <span className="rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs text-emerald-700">
                    Save {money(plan.yearly_savings ?? 0, plan.currency)}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {data && (
        <p className="text-right text-xs text-muted-foreground">
          Updated {new Date(data.generated_at).toLocaleString("en-IN")}
        </p>
      )}
    </div>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-2xl border bg-card p-4">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <div className="mt-3 text-2xl font-bold">{value}</div>
    </div>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-xl bg-muted/50 p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}
