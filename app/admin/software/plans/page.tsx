"use client";

import { useEffect, useState } from "react";
import {
  CheckCircle2,
  CreditCard,
  Layers3,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";
import {
  getPlatformAdminSoftwarePlans,
  PlatformAdminSoftwarePlans,
} from "@/lib/api/platform-admin";

function money(value: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function SoftwarePlansPage() {
  const [data, setData] = useState<PlatformAdminSoftwarePlans | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  async function load(refresh = false) {
    try {
      refresh ? setRefreshing(true) : setLoading(true);
      setError("");
      setData(await getPlatformAdminSoftwarePlans());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Unable to load software plans.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const summary = data?.summary;
  const plans = data?.plans ?? [];

  const cards = [
    ["Total Plans", summary?.total_plans ?? 0, Layers3],
    ["Active Plans", summary?.active_plans ?? 0, CheckCircle2],
    ["Subscriptions", summary?.total_subscriptions ?? 0, Users],
    ["Active", summary?.active_subscriptions ?? 0, Zap],
    ["Revenue", money(summary?.total_revenue ?? 0, summary?.currency ?? "INR"), TrendingUp],
    ["Payments", summary?.total_payments ?? 0, CreditCard],
  ] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Software Plans
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage and monitor PhotoOS software plan catalog and commercial performance.
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map(([label, value, Icon]) => (
          <div key={label} className="rounded-xl border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{label}</span>
              <Icon className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-3 text-2xl font-semibold">
              {loading ? "—" : value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {plans.map((plan) => {
          const users = plan.limits.users;
          const storage = plan.limits.storage_gb;
          const events = plan.limits.events_per_month;
          const watermark = plan.limits.watermark_photos;

          const featureEntries = Object.entries(plan.features);
          const enabledFeatureCount = featureEntries.filter(
            ([, value]) => value === true,
          ).length;

          return (
            <section
              key={plan.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{plan.name}</h2>

                    <span className="rounded-full border px-2 py-0.5 text-[11px]">
                      {plan.billing_cycle}
                    </span>

                    {plan.trial_days > 0 && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-[11px] font-medium text-amber-600">
                        {plan.trial_days}-Day Trial
                      </span>
                    )}

                    <span
                      className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${
                        plan.is_active
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {plan.is_active ? "Active" : "Inactive"}
                    </span>
                  </div>

                  <p className="mt-1 text-xs text-muted-foreground">
                    {plan.plan_code}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xl font-bold">
                    {money(plan.price, plan.currency)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {plan.billing_cycle === "monthly" ? "per month" : "per year"}
                  </p>
                </div>
              </div>

              {plan.description && (
                <p className="mt-4 text-sm text-muted-foreground">
                  {plan.description}
                </p>
              )}

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Users", users === -1 ? "Unlimited" : users],
                  ["Storage", storage === -1 ? "Unlimited" : `${storage} GB`],
                  ["Events", events === -1 ? "Unlimited" : events],
                  ["Watermark", watermark === -1 ? "Unlimited" : watermark],
                ].map(([label, value]) => (
                  <div key={String(label)} className="rounded-lg border p-3">
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="mt-1 font-semibold">{value}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div>
                  <p className="text-xs text-muted-foreground">Subscriptions</p>
                  <p className="mt-1 font-semibold">
                    {plan.subscription_count}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Active</p>
                  <p className="mt-1 font-semibold">
                    {plan.active_subscription_count}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Cancelled</p>
                  <p className="mt-1 font-semibold">
                    {plan.cancelled_subscription_count}
                  </p>
                </div>

                <div>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                  <p className="mt-1 font-semibold">
                    {money(plan.revenue, plan.currency)}
                  </p>
                </div>
              </div>

              <div className="mt-5 border-t pt-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium">Included Features</p>
                  <span className="text-xs text-muted-foreground">
                    {enabledFeatureCount}/{featureEntries.length} enabled
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  {featureEntries.map(([key, value]) => (
                    <span
                      key={key}
                      className={`rounded-full px-2.5 py-1 text-xs ${
                        value === true
                          ? "bg-emerald-500/10 text-emerald-600"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {key.replaceAll("_", " ")}
                    </span>
                  ))}
                </div>
              </div>
            </section>
          );
        })}
      </div>

      {!loading && plans.length === 0 && (
        <div className="rounded-xl border p-10 text-center text-sm text-muted-foreground">
          No software plans found.
        </div>
      )}
    </div>
  );
}
