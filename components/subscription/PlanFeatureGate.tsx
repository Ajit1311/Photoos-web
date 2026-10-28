"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { Lock, Sparkles, ArrowRight, ShieldCheck } from "lucide-react";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import {
  type PlanFeatureKey,
  PLAN_FEATURE_LABELS,
  isVaultPlan,
} from "@/lib/subscription/plan-access";

type PlanFeatureGateProps = {
  feature: PlanFeatureKey;
  children: ReactNode;
  title?: string;
  description?: string;
};

export default function PlanFeatureGate({
  feature,
  children,
  title,
  description,
}: PlanFeatureGateProps) {
  const { canAccess, planName, planCode, loading } = usePlanAccess();

  if (loading) {
    return <>{children}</>;
  }

  const hasAccess = canAccess(feature);

  if (hasAccess) {
    return <>{children}</>;
  }

  const isVault = isVaultPlan(planCode);
  const featureLabel = PLAN_FEATURE_LABELS[feature] || feature;

  return (
    <div className="mx-auto my-8 max-w-2xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-lg sm:p-10">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">
        <Lock className="h-8 w-8" />
      </div>

      <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
        <Sparkles className="h-3.5 w-3.5" />
        {isVault ? "Studio Vault Mode" : `${planName || "Free Trial"} Tier`}
      </div>

      <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
        {title || `${featureLabel} is locked`}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500">
        {description ||
          (isVault
            ? `Your studio is currently paused in Studio Vault. Existing client galleries and face search are live, but ${featureLabel} is paused until reactivation.`
            : `${featureLabel} is not included in your ${planName || "Free Trial"}. Upgrade your plan to unlock full access and grow your photography business.`)}
      </p>

      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        <Link
          href="/dashboard/subscription-plans"
          className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#082e47]"
        >
          {isVault ? "Reactivate Studio Plan" : "Upgrade Plan"}
          <ArrowRight className="h-4 w-4" />
        </Link>

        <Link
          href="/dashboard"
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Return to Dashboard
        </Link>
      </div>

      <div className="mt-8 flex items-center justify-center gap-2 text-xs text-slate-400">
        <ShieldCheck className="h-4 w-4 text-emerald-600" />
        <span>Instant activation &bull; Cancel or pause anytime</span>
      </div>
    </div>
  );
}

