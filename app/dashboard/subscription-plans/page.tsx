"use client";

import Link from "next/link";
import {
  BadgeCheck,
  Check,
  CloudRain,
  HardDrive,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Zap,
  ArrowRight,
  PauseCircle,
  Calendar,
  Layers,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { getSubscriptionPlans } from "@/lib/api/subscription/plans";
import type { SubscriptionPlan } from "@/types/subscription/plan";
import { useSubscriptionAccess } from "@/context/SubscriptionAccessContext";
import { CancelSubscriptionModal } from "@/components/subscription/CancelSubscriptionModal";

type PlanTab = "monthly" | "yearly" | "vault" | "addons";

const featureLabels: Record<string, string> = {
  dashboard: "Studio Dashboard",
  crm: "Client CRM & Pipeline",
  events: "Event Management",
  gallery: "Client Galleries & Downloads",
  projects: "Project & Task Management",
  reports: "Business Analytics & Reports",
  whatsapp: "WhatsApp Integration",
  analytics: "Advanced Analytics",
  automation: "Workflow Automation",
  ai_features: "AI Face Match & Search",
  priority_support: "Priority 24/7 Support",
  qr_sharing: "QR Code Instant Sharing",
  client_selfie_upload: "Client Selfie Upload",
  face_matching: "AI Face Recognition",
  matched_photo_delivery: "Matched Photo Delivery",
  watermark: "Automated Watermarking",
  basic_profile: "Basic Studio Profile",
  studio_listing: "Studio Marketplace Listing",
  customer_visibility: "Client Marketplace Visibility",
  verified_badge: "Verified Studio Badge",
  trust_indicator: "Trust Indicator",
  profile_verification: "Profile Verification",
  chat: "Client Messaging & Chat",
  finance: "Historic Payments & Invoices",
};

const limitLabels: Record<string, string> = {
  users: "Team Members",
  storage_gb: "Cloudflare R2 Storage",
  events_per_month: "Events per Month",
  watermark_photos: "Watermarked Photos",
  services: "Offered Services",
  portfolio_images: "Portfolio Images",
};

const formatFeatureName = (value: string) => {
  const normalizedValue = value.trim().toLowerCase();
  if (featureLabels[normalizedValue]) {
    return featureLabels[normalizedValue];
  }
  return normalizedValue
    .replace(/_/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const formatLimitValue = (key: string, value: unknown, isVault = false): string => {
  if (value === -1 || value === "-1") {
    return "Unlimited";
  }

  const numericValue = typeof value === "number" ? value : Number(value);

  if (key === "storage_gb" && !Number.isNaN(numericValue)) {
    return `${numericValue.toLocaleString()} GB`;
  }

  if (key === "watermark_photos" && !Number.isNaN(numericValue)) {
    return `${numericValue.toLocaleString()} Photos`;
  }

  if (key === "events_per_month" && !Number.isNaN(numericValue)) {
    if (isVault || numericValue === 0) {
      return "0 (Uploads Paused)";
    }
    return `${numericValue.toLocaleString()} Events`;
  }

  if (key === "users" && !Number.isNaN(numericValue)) {
    return `${numericValue.toLocaleString()} Users`;
  }

  if (key === "portfolio_images" && !Number.isNaN(numericValue)) {
    return `${numericValue.toLocaleString()} Images`;
  }

  if (key === "services" && !Number.isNaN(numericValue)) {
    return `${numericValue.toLocaleString()} Services`;
  }

  if (typeof value === "boolean") {
    return value ? "Included" : "Not Included";
  }

  return String(value);
};

const getFeatures = (features: unknown): string[] => {
  if (!features) {
    return [];
  }

  if (Array.isArray(features)) {
    return features
      .flatMap((feature) => {
        if (typeof feature === "string") {
          return [formatFeatureName(feature)];
        }
        if (feature && typeof feature === "object") {
          return Object.entries(feature as Record<string, unknown>)
            .filter(([, value]) => value === true || value === 1 || value === "true")
            .map(([key]) => formatFeatureName(key));
        }
        return [];
      })
      .filter(Boolean);
  }

  if (typeof features === "object") {
    return Object.entries(features as Record<string, unknown>)
      .filter(([, value]) => value === true || value === 1 || value === "true")
      .map(([key]) => formatFeatureName(key));
  }

  return [];
};

const getLimits = (limits: unknown, isVault = false): Array<{ label: string; value: string }> => {
  if (!limits || typeof limits !== "object" || Array.isArray(limits)) {
    return [];
  }

  return Object.entries(limits as Record<string, unknown>)
    .filter(([key, value]) => {
      if (value === null || value === undefined || typeof value === "boolean") {
        return false;
      }
      // In Studio Vault: no storage is given or displayed
      if (isVault && (key === "storage_gb" || key === "upload_paused" || key === "galleries_active")) {
        return false;
      }
      return true;
    })
    .map(([key, value]) => ({
      label:
        limitLabels[key] ??
        key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase()),
      value: formatLimitValue(key, value, isVault),
    }));
};

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

const getPlanIcon = (plan: SubscriptionPlan) => {
  const code = plan.plan_code.toLowerCase();
  if (code.includes("vault")) return "🌧️";
  if (code.includes("addon_extra_event")) return "🎟️";
  if (code.includes("addon_storage")) return "💾";
  if (code.includes("elite")) return "👑";
  if (code.includes("booster")) return "🚀";
  if (code.includes("starter")) return "🌱";
  return "✦";
};

const formatPrice = (price: number | string | null, currency?: string | null) => {
  const numericPrice = typeof price === "number" ? price : Number(price ?? 0);
  const resolvedCurrency = currency ?? "INR";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: resolvedCurrency,
    maximumFractionDigits: 0,
  }).format(Number.isNaN(numericPrice) ? 0 : numericPrice);
};

export default function SubscriptionPlansPage() {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [activeTab, setActiveTab] = useState<PlanTab>("monthly");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: currentSubscription, reload: reloadSubscription } = useSubscriptionAccess();
  const [cancelModalOpen, setCancelModalOpen] = useState(false);

  const loadPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getSubscriptionPlans();
      setPlans(result.filter((plan) => plan.is_active));
    } catch (err) {
      setPlans([]);
      setError(err instanceof Error ? err.message : "Unable to load subscription plans.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
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
        (plan) =>
          !isAddonPlan(plan) &&
          !isVaultPlan(plan) &&
          plan.billing_cycle === "yearly" &&
          plan.price > 0,
      );
    }

    // Monthly
    return plans.filter(
      (plan) =>
        !isAddonPlan(plan) &&
        !isVaultPlan(plan) &&
        plan.billing_cycle === "monthly" &&
        plan.price > 0,
    );
  }, [activeTab, plans]);

  return (
    <div className="min-h-full bg-slate-50/60 pb-16">
      <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0A3F61]">
              <Sparkles className="h-3.5 w-3.5" />
              PhotoOS Studio Subscriptions
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Subscription Plans &amp; Retention Architecture
            </h1>
            <p className="mt-2 text-sm leading-6 text-slate-600 max-w-3xl">
              Select the right tier for wedding shoots, protect client galleries during monsoons with <strong>Studio Vault</strong>, or scale capacity dynamically with <strong>Modular Add-Ons</strong>.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadPlans()}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 py-2.5 text-xs font-semibold text-[#0A3F61] shadow-sm transition hover:bg-slate-50 hover:border-[#0A3F61]/30 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#0A3F61]" />
            ) : (
              <RefreshCw className="h-4 w-4 text-[#0A3F61]" />
            )}
            Refresh Plans
          </button>
        </div>

        {/* Current Active Plan Status Bar */}
        {currentSubscription?.plan_name && (
          <div className="mt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-3xl border border-slate-200 bg-white p-5 sm:px-6 shadow-sm">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF5FB] text-[#0A3F61]">
                <ShieldCheck className="h-6 w-6 stroke-[2]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Current Active Plan
                  </span>
                  <span className="rounded-full bg-[#EBF5FB] px-2.5 py-0.5 text-[10px] font-extrabold text-[#0A3F61] uppercase tracking-wider">
                    {currentSubscription.status}
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  {currentSubscription.plan_name}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/dashboard/plans"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition shadow-sm"
              >
                Billing Details
              </Link>
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100 hover:text-red-700 transition shadow-sm"
              >
                Cancel Subscription
              </button>
            </div>
          </div>
        )}

        <CancelSubscriptionModal
          isOpen={cancelModalOpen}
          onClose={() => setCancelModalOpen(false)}
          subscriptionId={currentSubscription?.subscription_id}
          planName={currentSubscription?.plan_name}
          onSuccess={() => void reloadSubscription()}
        />

        {/* Cohesive Brand Tabs Navigation */}
        <div className="mt-8 inline-flex flex-wrap items-center gap-1.5 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
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
            Annual Shield (13 Months)
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
            Studio Vault (Off-Season Pause)
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

        {/* Tab 3: Studio Vault Overview Banner */}
        {activeTab === "vault" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100 border border-white/20 backdrop-blur-md">
                Monsoon Retention &amp; Pause Architecture (&quot;Studio Vault&quot;)
              </span>
              <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                Keep Galleries 100% Live &bull; Pay Only ₹199/mo In Off-Season
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
                Engineered specifically to solve off-season churn (June to September) when Indian wedding shoots pause. Instead of losing client access or canceling subscriptions, Studio Vault safely pauses your event creation pipeline while keeping your client galleries permanently online.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/15 pt-6 text-xs">
              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>🔒</span> 100% Client &amp; Guest Access
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Guests scan QR codes, download full-res photos, run AI face match, and comment with zero interruption.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>⏸️</span> Upload Pipeline Paused
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  0 new event creations; shoot pipeline safely suspended while keeping monthly expenses minimal.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>🛡️</span> Zero Data Pruning
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  All Cloudflare R2 image assets remain permanently protected with zero deletion risk.
                </p>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 border border-white/15 backdrop-blur-md hover:bg-white/[0.14] transition-all">
                <div className="font-bold text-white text-sm flex items-center gap-1.5">
                  <span>⚡</span> 1-Click Reactivation
                </div>
                <p className="mt-1.5 text-slate-200 leading-relaxed">
                  Instantly restore full Studio Starter or Booster features whenever your season starts in October.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Annual Shield Overview Banner */}
        {activeTab === "yearly" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-slate-100 border border-white/20 backdrop-blur-md">
              Option 2: Annual Shield
            </span>
            <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
              13 Months Total: Complete Off-Season Monsoon Coverage
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-200">
              All yearly subscribers bypass the off-season problem automatically: with <strong>2 Months Free + 1 Extra Bonus Month (13 months total)</strong>, the entire June to September monsoon period is covered with zero additional charges or gallery downtime.
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

        {/* Tab 4: Modular Add-Ons Overview Banner */}
        {activeTab === "addons" && (
          <div className="mt-8 rounded-3xl border border-white/10 bg-gradient-to-br from-[#073653] via-[#0A3F61] to-[#0B4D75] p-6 text-white shadow-xl shadow-[#0A3F61]/15 sm:p-8">
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

        {/* Loading State */}
        {loading && (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-3xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center gap-3 text-sm font-medium text-slate-500">
              <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
              Loading subscription plans...
            </div>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="mt-8 rounded-3xl border border-red-200 bg-red-50/50 p-8 shadow-sm">
            <h2 className="font-bold text-red-900">Unable to load plans</h2>
            <p className="mt-2 text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void loadPlans()}
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white shadow-md hover:bg-[#07324D] transition-all"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && visiblePlans.length === 0 && (
          <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">
              <Layers className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">No plans found</h2>
            <p className="mt-2 text-sm text-slate-500">
              {activeTab === "addons"
                ? "No active add-on plans are currently available."
                : "No active plans are available for this billing cycle."}
            </p>
          </div>
        )}

        {/* Plans Grid */}
        {!loading && !error && visiblePlans.length > 0 && (
          <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {visiblePlans.map((plan) => {
              const vault = isVaultPlan(plan);
              const addon = isAddonPlan(plan);
              const features = getFeatures(plan.features);
              const limits = getLimits(plan.limits, vault);
              const isPopular = Boolean(plan.metadata?.popular);

              return (
                <div
                  key={plan.id}
                  className={`flex flex-col justify-between rounded-3xl border bg-white p-7 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-[#0A3F61]/40 ${
                    isPopular
                      ? "border-2 border-[#0A3F61] ring-4 ring-[#0A3F61]/10 relative"
                      : "border-slate-200"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between gap-2">
                      <span className="inline-flex items-center rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-600">
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

                    {/* Plan Title & Icon */}
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <h2 className="text-2xl font-black tracking-tight text-slate-900">
                        {plan.name}
                      </h2>
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#EBF5FB] text-lg text-[#0A3F61]">
                        {getPlanIcon(plan)}
                      </span>
                    </div>

                    {/* Plan Description */}
                    {plan.description && (
                      <p className="mt-3 min-h-12 text-sm leading-6 text-slate-600">
                        {plan.description}
                      </p>
                    )}

                    {/* Price Block */}
                    <div className="mt-6 flex items-baseline gap-2">
                      <span className="text-4xl font-extrabold tracking-tight text-slate-900">
                        {formatPrice(plan.price, plan.currency)}
                      </span>
                      <span className="text-sm font-semibold text-slate-500">
                        / {addon ? (plan.metadata?.unit ? String(plan.metadata.unit) : "pass") : plan.billing_cycle}
                      </span>
                    </div>

                    {addon && (
                      <p className="mt-2 text-xs font-semibold text-[#0A3F61]">
                        ✦ Modular add-on. Current base subscription remains active.
                      </p>
                    )}

                    {/* Features List */}
                    {features.length > 0 && (
                      <div className="mt-6 border-t border-slate-100 pt-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Included Features
                        </h3>
                        <ul className="mt-4 space-y-3">
                          {features.map((feature) => (
                            <li
                              key={feature}
                              className="flex items-start gap-2.5 text-sm text-slate-700 font-medium"
                            >
                              <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-[#EBF5FB] text-[#0A3F61]">
                                <Check className="h-3 w-3 stroke-[2.5]" />
                              </span>
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Limits List */}
                    {limits.length > 0 && (
                      <div className="mt-6 border-t border-slate-100 pt-6">
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          {addon ? "Add-on Capacity" : vault ? "Retention Architecture" : "Studio Limits"}
                        </h3>
                        <dl className="mt-4 space-y-2.5">
                          {limits.map((limit) => (
                            <div
                              key={limit.label}
                              className="flex items-center justify-between gap-4 text-sm"
                            >
                              <dt className="text-slate-500">{limit.label}</dt>
                              <dd className="font-bold text-slate-900">{limit.value}</dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>

                  {/* CTA Button */}
                  <div className="mt-8 pt-4">
                    {addon ? (
                      <Link
                        href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                          plan.id,
                        )}&planCode=${encodeURIComponent(
                          plan.plan_code,
                        )}&planType=addon`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0A3F61]/20 transition-all hover:bg-[#07324D] hover:shadow-lg"
                      >
                        Get Add-on Pass
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : vault ? (
                      <Link
                        href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                          plan.id,
                        )}&planCode=${encodeURIComponent(
                          plan.plan_code,
                        )}&planType=studio_software&billingCycle=${encodeURIComponent(
                          plan.billing_cycle,
                        )}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0A3F61]/20 transition-all hover:bg-[#07324D] hover:shadow-lg"
                      >
                        Activate Studio Vault
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    ) : (
                      <Link
                        href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                          plan.id,
                        )}&planCode=${encodeURIComponent(
                          plan.plan_code,
                        )}&planType=studio_software&billingCycle=${encodeURIComponent(
                          plan.billing_cycle,
                        )}`}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3.5 text-sm font-semibold text-white shadow-md shadow-[#0A3F61]/20 transition-all hover:bg-[#07324D] hover:shadow-lg"
                      >
                        Choose Plan
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Security & Integrity Note */}
        <div className="mt-12 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#EBF5FB] text-[#0A3F61]">
              <ShieldCheck className="h-6 w-6 stroke-[2]" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">
                PhotoOS Studio Vault &amp; Retention Guarantee
              </h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                All uploaded full-resolution RAW and JPEG assets remain safe in Cloudflare R2 object storage with zero deletion or compression during off-season pauses. You can upgrade, pause, or expand your plan at any time.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
