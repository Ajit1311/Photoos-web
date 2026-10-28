"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Check, ShieldCheck, Sparkles, PauseCircle, ArrowRight, Layers, Database } from "lucide-react";
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

    loadPlans();
  }, []);

  const visiblePlans = useMemo(() => {
    if (activeTab === "vault") {
      return plans.filter((p) => p.plan_code.toLowerCase().includes("vault"));
    }
    if (activeTab === "addons") {
      return plans.filter(
        (p) =>
          p.plan_type === "addon" ||
          p.plan_type === "marketplace" ||
          p.plan_code.startsWith("addon_"),
      );
    }
    if (activeTab === "yearly") {
      return plans.filter(
        (p) =>
          !p.plan_code.toLowerCase().includes("vault") &&
          p.billing_cycle === "yearly" &&
          p.plan_type === "studio_software" &&
          p.price > 0,
      );
    }
    // monthly
    return plans.filter(
      (p) =>
        !p.plan_code.toLowerCase().includes("vault") &&
        p.billing_cycle === "monthly" &&
        p.plan_type === "studio_software" &&
        !p.plan_code.startsWith("addon_") &&
        p.price > 0,
    );
  }, [activeTab, plans]);

  const trialPlan = useMemo(() => {
    return plans.find((p) => p.price === 0 && p.trial_days > 0);
  }, [plans]);

  return (
    <main className="min-h-screen bg-[#F6F8FB] px-4 py-16 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#0A3F61]">
            PhotoOS Pricing &amp; Retention Architecture
          </p>

          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">
            Predictable Pricing for Photography Studios
          </h1>

          <p className="mt-4 text-base leading-7 text-slate-600">
            Scale during peak wedding months with high-margin add-ons, protect your margins during off-season with <strong>Studio Vault</strong>, or lock in 13 months with <strong>Annual Shield</strong>.
          </p>

          {/* Navigation Tabs */}
          <div className="mt-10 inline-flex flex-wrap justify-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
            <button
              type="button"
              onClick={() => setActiveTab("monthly")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "monthly"
                  ? "bg-[#0A3F61] text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Monthly Plans
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("yearly")}
              className={`inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "yearly"
                  ? "bg-emerald-700 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Annual Shield (13 Mo)
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                Save 2 Mo + 1 Free
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("vault")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "vault"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              🌧️ Studio Vault (Off-Season)
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("addons")}
              className={`rounded-xl px-5 py-2.5 text-sm font-semibold transition ${
                activeTab === "addons"
                  ? "bg-purple-600 text-white shadow-sm"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              ⚡ Modular Add-Ons
            </button>
          </div>
        </div>

        {/* Studio Vault Overview Banner */}
        {activeTab === "vault" && (
          <div className="mt-10 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-[#0A3F61] to-[#0D5C8A] p-6 text-white shadow-lg sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                Monsoon Retention &amp; Pause Architecture (&quot;Studio Vault&quot;)
              </span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Pause Subscriptions in Monsoon &bull; Keep Client Galleries 100% Live
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Engineered specifically to solve the off-season churn (June to September) when Indian wedding work halts. Keep all existing QR codes and galleries online without paying full tier pricing.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/15 pt-6 text-xs text-blue-100">
              <div className="rounded-xl bg-white/10 p-4">
                <div className="font-semibold text-white">🔒 100% Client &amp; Guest Access</div>
                <p className="mt-1 text-blue-200 leading-relaxed">Guests scan QR codes, download photos, run AI face searches, and leave comments.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <div className="font-semibold text-white">⏸️ Upload Pipeline Paused</div>
                <p className="mt-1 text-blue-200 leading-relaxed">0 new event creations; shoot pipeline safely parked during non-shooting months.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <div className="font-semibold text-white">🛡️ Zero Data Pruning Guarantee</div>
                <p className="mt-1 text-blue-200 leading-relaxed">Cloudflare R2 assets remain permanently protected with zero deletion risk.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-4">
                <div className="font-semibold text-white">⚡ 1-Click Reactivation</div>
                <p className="mt-1 text-blue-200 leading-relaxed">Restore Studio Pro/Starter features instantly when wedding season restarts in October.</p>
              </div>
            </div>
          </div>
        )}

        {/* Annual Shield Banner */}
        {activeTab === "yearly" && (
          <div className="mt-10 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-[#074739] to-[#0A5C4A] p-6 text-white shadow-lg sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Option 2: Annual Shield
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              13 Months Total: Complete Off-Season Monsoon Coverage
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-100">
              All yearly subscribers automatically bypass off-season churn with <strong>2 Months Free + 1 Extra Bonus Month (13 months total)</strong>. Full coverage across the entire monsoon with zero additional charges or gallery downtime.
            </p>
          </div>
        )}

        {/* Modular Add-Ons Banner */}
        {activeTab === "addons" && (
          <div className="mt-10 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-950 via-[#3B1963] to-[#581C87] p-6 text-white shadow-lg sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
              Peak Season Expansion
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Modular High-Margin Add-Ons
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-purple-200">
              Studios can expand limits dynamically during peak wedding months without forcing an entire tier upgrade. Add extra event passes or boost Cloudflare R2 storage on demand.
            </p>
          </div>
        )}

        {/* Loading / Error States */}
        {loading && (
          <div className="mt-16 text-center text-sm text-slate-500">
            Loading subscription plans...
          </div>
        )}

        {error && (
          <div className="mx-auto mt-16 max-w-xl rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && visiblePlans.length > 0 && (
          <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {visiblePlans.map((plan) => {
              const isVault = plan.plan_code.toLowerCase().includes("vault");
              const isAddon =
                plan.plan_type === "addon" ||
                plan.plan_type === "marketplace" ||
                plan.plan_code.startsWith("addon_");

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-3xl border bg-white p-8 shadow-sm transition hover:shadow-md ${
                    isVault
                      ? "border-blue-200 ring-1 ring-blue-100"
                      : isAddon
                        ? "border-purple-200 ring-1 ring-purple-100"
                        : plan.metadata?.popular
                          ? "border-[#0A3F61] ring-2 ring-[#0A3F61]"
                          : "border-slate-200"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                        {plan.plan_code}
                      </span>
                      {Boolean(plan.metadata?.popular) && (
                        <span className="rounded-full bg-[#0A3F61] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                          Most Popular
                        </span>
                      )}
                      {Boolean(plan.metadata?.badge) && (
                        <span className="rounded-full bg-blue-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[#0A3F61]">
                          {String(plan.metadata?.badge)}
                        </span>
                      )}
                      {Boolean(plan.metadata?.annual_shield) && (
                        <span className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                          13 Months
                        </span>
                      )}
                    </div>

                    <h2 className="mt-4 text-2xl font-bold text-slate-900">
                      {plan.name}
                    </h2>

                    {plan.description && (
                      <p className="mt-3 text-sm leading-6 text-slate-500 min-h-12">
                        {plan.description}
                      </p>
                    )}

                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold text-slate-900">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm font-medium text-slate-500">
                        / {isAddon ? "one-time or monthly" : plan.billing_cycle}
                      </span>
                    </div>

                    {/* Features list */}
                    <div className="mt-6 border-t border-slate-100 pt-6">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                        Key Features &amp; Limits
                      </h4>
                      <ul className="mt-4 space-y-3 text-sm text-slate-700">
                        {isVault ? (
                          <>
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>100% active client galleries &amp; downloads</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>AI face matching &amp; QR scanning live</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>Zero data pruning; Cloudflare R2 protected</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>1-Click Reactivation when wedding season begins</span>
                            </li>
                            <li className="flex items-center gap-2.5 text-slate-400">
                              <PauseCircle className="h-4 w-4 shrink-0 text-amber-500" />
                              <span>New uploads paused (0 new events)</span>
                            </li>
                          </>
                        ) : isAddon ? (
                          <>
                            {plan.plan_code.includes("extra_event") && (
                              <>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                  <span>+1 Event Pass for peak wedding season</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                  <span>Up to 2,500 photos included</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                  <span>Standard Cloudflare R2 allocation</span>
                                </li>
                              </>
                            )}
                            {plan.plan_code.includes("storage") && (
                              <>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                  <span>Instant Cloudflare R2 storage boost</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
                                  <span>Zero downtime or upload compression</span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-purple-600" />
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
                                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                  <span>
                                    <strong>{String((plan.limits as Record<string, unknown>).events_per_month ?? "2")}</strong> Events per month
                                  </span>
                                </li>
                                <li className="flex items-center gap-2.5">
                                  <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                                  <span>
                                    <strong>{String((plan.limits as Record<string, unknown>).storage_gb ?? "50")} GB</strong> Cloudflare R2 Storage
                                  </span>
                                </li>
                              </>
                            )}
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>QR Code sharing &amp; Client selfie upload</span>
                            </li>
                            <li className="flex items-center gap-2.5">
                              <Check className="h-4 w-4 shrink-0 text-emerald-600" />
                              <span>AI Face Matching &amp; Matched delivery</span>
                            </li>
                            {Boolean(plan.features && (plan.features as Record<string, unknown>).whatsapp) && (
                              <li className="flex items-center gap-2.5">
                                <Check className="h-4 w-4 shrink-0 text-emerald-600" />
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
                      className={`inline-flex w-full items-center justify-center rounded-xl px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:opacity-95 ${
                        isVault
                          ? "bg-[#0A3F61]"
                          : isAddon
                            ? "bg-purple-600"
                            : "bg-[#0A3F61]"
                      }`}
                    >
                      {isVault
                        ? "Choose Studio Vault"
                        : isAddon
                          ? "Get Add-On Pass"
                          : "Choose Plan"}
                      <ArrowRight className="ml-2 h-4 w-4" />
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
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0A3F61]">
              <Sparkles className="h-3.5 w-3.5" />
              7-Day Risk-Free Trial
            </span>

            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              Start with the 7-Day Free Trial
            </h3>

            <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500">
              Explore PhotoOS studio management with 1 event, up to 500 photos, AI face match search, and full client galleries. No credit card required.
            </p>

            <div className="mt-6 flex justify-center">
              <Link
                href={`/onboarding/studio?planId=${encodeURIComponent(
                  trialPlan.id,
                )}&planCode=${encodeURIComponent(
                  trialPlan.plan_code,
                )}&billingCycle=monthly&mode=trial`}
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-8 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#082e47]"
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
