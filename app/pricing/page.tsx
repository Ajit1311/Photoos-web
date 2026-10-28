"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  ShieldCheck,
  Sparkles,
  PauseCircle,
  ArrowRight,
  Layers,
  Database,
  CloudRain,
  Zap,
} from "lucide-react";
import { getSubscriptionPlans } from "@/lib/api/subscription/plans";
import type { SubscriptionPlan } from "@/types/subscription/plan";

type PricingTab = "monthly" | "yearly" | "vault" | "addons";

function formatPrice(price: number, currency: string) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency || "INR",
    maximumFractionDigits: 0,
  }).format(price);
}

const isAddonPlan = (plan: SubscriptionPlan) => {
  return (
    plan.plan_type === "addon" ||
    plan.plan_type === "marketplace" ||
    plan.plan_code.toLowerCase().startsWith("addon_") ||
    Boolean(plan.metadata?.is_addon)
  );
};

const isVaultPlan = (plan: SubscriptionPlan) => {
  return (
    plan.plan_code.toLowerCase().includes("vault") ||
    Boolean(plan.metadata?.is_vault)
  );
};

export default function PricingPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<PricingTab>("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadPlans() {
      try {
        const result = await getSubscriptionPlans();
        setPlans(result.filter((plan) => plan.is_active));
      } catch (err) {
        console.error("PRICING LOAD ERROR:", err);
        setError(err instanceof Error ? err.message : "Unable to load pricing.");
      } finally {
        setLoading(false);
      }
    }

    void loadPlans();
  }, []);

  const visiblePlans = useMemo(() => {
    if (activeTab === "vault") {
      return plans.filter(isVaultPlan);
    }
    if (activeTab === "addons") {
      return plans.filter(isAddonPlan);
    }
    if (activeTab === "yearly") {
      return plans.filter(
        (p) =>
          !isVaultPlan(p) &&
          !isAddonPlan(p) &&
          p.billing_cycle === "yearly" &&
          p.price > 0,
      );
    }
    // monthly
    return plans.filter(
      (p) =>
        !isVaultPlan(p) &&
        !isAddonPlan(p) &&
        p.billing_cycle === "monthly" &&
        p.price > 0,
    );
  }, [activeTab, plans]);

  const trialPlan = useMemo(() => {
    return plans.find((p) => p.price === 0 && p.trial_days > 0);
  }, [plans]);

  return (
    <main className="min-h-screen bg-slate-50/60 px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0A3F61]">
            <Sparkles className="h-3.5 w-3.5" />
            PhotoOS Pricing &amp; Retention Architecture
          </div>

          <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Predictable Pricing for Photography Studios
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Scale during peak wedding months with high-margin add-ons, protect your margins during off-season with <strong>Studio Vault</strong>, or lock in 13 months with <strong>Annual Shield</strong>.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-10 inline-flex flex-wrap justify-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "monthly"
                  ? "bg-[#0A3F61] text-white shadow-md shadow-[#0A3F61]/20"
                  : "text-slate-600 hover:text-[#0A3F61] hover:bg-slate-50"
              }`}
            >
              Monthly Plans
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("yearly")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "yearly"
                  ? "bg-[#0A3F61] text-white shadow-md shadow-[#0A3F61]/20"
                  : "text-slate-600 hover:text-[#0A3F61] hover:bg-slate-50"
              }`}
            >
              Annual Shield (13 Mo)
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                  activeTab === "yearly"
                    ? "bg-white/20 text-white"
                    : "bg-[#0A3F61]/10 text-[#0A3F61]"
                }`}
              >
                Save 2 Mo + 1 Free
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "vault"
                  ? "bg-[#0A3F61] text-white shadow-md shadow-[#0A3F61]/20"
                  : "text-slate-600 hover:text-[#0A3F61] hover:bg-slate-50"
              }`}
            >
              <CloudRain className="h-4 w-4" />
              Studio Vault (Off-Season)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addons")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition-all ${
                activeTab === "addons"
                  ? "bg-[#0A3F61] text-white shadow-md shadow-[#0A3F61]/20"
                  : "text-slate-600 hover:text-[#0A3F61] hover:bg-slate-50"
              }`}
            >
              <Zap className="h-4 w-4" />
              Modular Add-Ons
            </button>
          </div>
        </div>

        {/* Studio Vault Overview Banner */}
        {activeTab === "vault" && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100 border border-white/20 backdrop-blur-md">
                Monsoon Retention &amp; Pause Architecture (&quot;Studio Vault&quot;)
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Pause Subscriptions in Monsoon &bull; Keep Client Galleries 100% Live
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                Engineered specifically to solve off-season churn (June to September) when Indian wedding shoots pause. Keep all existing QR codes and galleries online without paying full tier pricing.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/15 pt-6 text-xs">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>🔒</span> 100% Client &amp; Guest Access
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Guests scan QR codes, download photos, run AI face searches, and leave comments.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>⏸️</span> Upload Pipeline Paused
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  0 new event creations; shoot pipeline safely suspended while keeping budget low.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>🛡️</span> Zero Data Pruning Guarantee
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Cloudflare R2 assets remain permanently protected with zero deletion risk.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>⚡</span> 1-Click Reactivation
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Restore Studio Pro/Starter features instantly when wedding season restarts in October.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Annual Shield Banner */}
        {activeTab === "yearly" && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100 border border-white/20 backdrop-blur-md">
              Option 2: Annual Shield
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              13 Months Total: Complete Off-Season Monsoon Coverage
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              All yearly subscribers automatically bypass off-season churn with <strong>2 Months Free + 1 Extra Bonus Month (13 months total)</strong>. Full coverage across the entire monsoon with zero additional charges or gallery downtime.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-3 border-t border-white/15 pt-6 text-xs">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm">🎁 13 Months for the Price of 10</div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Maximum savings on your studio budget with 3 full months included complimentary.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm">🌧️ Zero Monsoon Interruption</div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Keep all client galleries, AI face searches, and portfolio active all summer and monsoon.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm">⚡ Peak Season Ready</div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Start the upcoming autumn wedding rush at full capacity with zero reactivations needed.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Modular Add-Ons Banner */}
        {activeTab === "addons" && (
          <div className="mt-10 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100 border border-white/20 backdrop-blur-md">
              Peak Season Expansion
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              Modular High-Margin Add-Ons
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              Studios can expand limits dynamically during peak wedding months without forcing an entire tier upgrade. Add extra event passes or boost Cloudflare R2 storage on demand.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 border-t border-white/15 pt-6 text-xs">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>🎟️</span> Extra Event Pass (₹149 / event)
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Includes 1 extra wedding event, up to 2,500 photos, full QR delivery, and AI face recognition.
                </p>
              </div>
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md">
                <div className="font-bold text-white text-sm flex items-center gap-2">
                  <span>💾</span> Cloudflare R2 Storage Boosters
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Instant allocation (+50 GB for ₹99/mo or +100 GB for ₹179/mo) with zero upload downtime.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div className="mt-16 text-center text-sm font-medium text-slate-500">
            Loading subscription plans...
          </div>
        )}

        {error && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-200 bg-red-50/50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && visiblePlans.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visiblePlans.map((plan) => {
              const isVault = isVaultPlan(plan);
              const isAddon = isAddonPlan(plan);
              const isPopular = Boolean(plan.metadata?.popular);

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#0A3F61]/40 ${
                    isPopular
                      ? "border-2 border-[#0A3F61] ring-4 ring-[#0A3F61]/10 relative"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                        {plan.plan_code}
                      </span>
                      {isPopular && (
                        <span className="rounded-full bg-[#0A3F61] px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-white shadow-sm">
                          Most Popular
                        </span>
                      )}
                      {Boolean(plan.metadata?.badge) && !isPopular && (
                        <span className="rounded-full bg-[#0A3F61]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A3F61]">
                          {String(plan.metadata?.badge)}
                        </span>
                      )}
                      {Boolean(plan.metadata?.annual_shield) && (
                        <span className="rounded-full bg-[#0A3F61]/10 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A3F61]">
                          13 Months
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-black text-slate-900 tracking-tight">
                      {plan.name}
                    </h2>

                    {plan.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-600 min-h-12">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        / {isAddon ? "pass or month" : plan.billing_cycle}
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Key Features &amp; Limits
                      </h4>
                      <ul className="mt-4 space-y-3 text-sm text-slate-700 font-medium">
                        {isVault ? (
                          <>
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>100% active client galleries &amp; downloads</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>AI face matching &amp; QR scanning live</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>Zero data pruning; Cloudflare R2 protected</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>1-Click Reactivation when wedding season begins</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-slate-400">
                              <PauseCircle className="h-4 w-4 shrink-0 text-slate-400" />
                              <span>New uploads paused (0 new events)</span>
                            </li>
                          </>
                        ) : isAddon ? (
                          <>
                            {plan.plan_code.includes("extra_event") && (
                              <>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>+1 Event Pass for peak wedding season</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>Up to 2,500 photos included</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>Standard Cloudflare R2 allocation</span>
                                </li>
                              </>
                            )}
                            {plan.plan_code.includes("storage") && (
                              <>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>Instant Cloudflare R2 storage boost</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>Zero downtime or upload compression</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>Monthly cancel or expand flexibility</span>
                                </li>
                              </>
                            )}
                          </>
                        ) : (
                          <>
                            {plan.limits && typeof plan.limits === "object" && (
                              <>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>
                                    <strong>{String((plan.limits as Record<string, unknown>).events_per_month ?? "2")}</strong> Events per month
                                  </span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                    <Check className="h-3 w-3 stroke-[2.5]" />
                                  </span>
                                  <span>
                                    <strong>{String((plan.limits as Record<string, unknown>).storage_gb ?? "50")} GB</strong> Cloudflare R2 Storage
                                  </span>
                                </li>
                              </>
                            )}
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>QR Code sharing &amp; Client selfie upload</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>AI Face Matching &amp; Matched delivery</span>
                            </li>
                            {Boolean(plan.features && (plan.features as Record<string, unknown>).whatsapp) && (
                              <li className="flex items-center gap-2.5">
                                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                  <Check className="h-3 w-3 stroke-[2.5]" />
                                </span>
                                <span>WhatsApp Integration &amp; Automation</span>
                              </li>
                            )}
                          </>
                        )}
                      </ul>
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="mt-8 pt-4">
                    <Link
                      href={`/onboarding/studio?planId=${encodeURIComponent(
                        plan.id,
                      )}&planCode=${encodeURIComponent(
                        plan.plan_code,
                      )}&billingCycle=${encodeURIComponent(
                        plan.billing_cycle,
                      )}`}
                      className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0A3F61]/20 transition-all hover:bg-[#07324D] hover:shadow-lg"
                    >
                      {isVault
                        ? "Choose Studio Vault"
                        : isAddon
                          ? "Get Add-On Pass"
                          : "Choose Plan"}
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Free Trial Banner */}
        {trialPlan && (
          <div className="mx-auto mt-16 max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0A3F61]">
              <Sparkles className="h-3.5 w-3.5" />
              7-Day Risk-Free Trial
            </span>

            <h3 className="mt-3 text-2xl font-black text-slate-900 tracking-tight">
              Start with the 7-Day Free Trial
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-600">
              Explore PhotoOS studio management with 1 event, up to 500 photos, AI face match search, and full client galleries. No credit card required.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href={`/onboarding/studio?planId=${encodeURIComponent(
                  trialPlan.id,
                )}&planCode=${encodeURIComponent(
                  trialPlan.plan_code,
                )}&billingCycle=monthly&mode=trial`}
                className="inline-flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-8 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0A3F61]/20 transition-all hover:bg-[#07324D] hover:shadow-lg"
              >
                Start 7-Day Free Trial
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}

        {/* Footer Navigation */}
        <div className="mt-16 text-center text-sm text-slate-500">
          Already have an active studio?{" "}
          <Link href="/login" className="font-semibold text-[#0A3F61] hover:underline">
            Login to your dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
