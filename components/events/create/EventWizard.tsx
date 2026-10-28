"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Lock, PauseCircle, Sparkles, ArrowRight, AlertTriangle, ShieldCheck } from "lucide-react";
import EventStepper from "./EventStepper";
import StepOneBasicDetails from "./StepOneBasicDetails";
import StepTwoClient from "./StepTwoClient";
import StepThreeTeam from "./StepThreeTeam";
import StepFourPricing from "./StepFourPricing";
import StepFiveGallery from "./StepFiveGallery";
import StepSixAI from "./StepSixAI";
import StepSevenReview from "./StepSevenReview";
import WizardFooter from "./WizardFooter";
import { EventWizardProvider } from "@/context/EventWizardContext";
import { usePlanAccess } from "@/hooks/usePlanAccess";
import { useBootstrapContext } from "@/context/BootstrapContext";
import { isVaultPlan } from "@/lib/subscription/plan-access";
import { supabase } from "@/lib/supabase/client";

type EventWizardProps = {
  projectId?: string;
};

function EventWizardContent() {
  const { planCode, planName, getLimit, isTrial } = usePlanAccess();
  const { data: bootstrap } = useBootstrapContext();
  const [eventCount, setEventCount] = useState<number | null>(null);
  const [checkingCount, setCheckingCount] = useState(true);

  const isVault = isVaultPlan(planCode);
  const eventsLimit = getLimit("events_per_month");

  useEffect(() => {
    let cancelled = false;
    async function checkCurrentEvents() {
      const studioId = bootstrap?.workspace?.studio?.id;
      if (!studioId) {
        setCheckingCount(false);
        return;
      }
      try {
        const { count, error } = await supabase
          .from("events")
          .select("id", { count: "exact", head: true })
          .eq("studio_id", studioId);

        if (!cancelled && !error && count !== null) {
          setEventCount(count);
        }
      } catch (err) {
        console.warn("Could not check event count:", err);
      } finally {
        if (!cancelled) setCheckingCount(false);
      }
    }

    checkCurrentEvents();
    return () => {
      cancelled = true;
    };
  }, [bootstrap]);

  // 1. Vault Mode: New uploads & events paused
  if (isVault) {
    return (
      <div className="mx-auto my-6 max-w-2xl rounded-3xl border border-blue-200 bg-gradient-to-b from-blue-50/50 to-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">
          <PauseCircle className="h-9 w-9" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-[#0A3F61]">
          <ShieldCheck className="h-3.5 w-3.5" />
          Studio Vault Active &bull; Monsoon Retention
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          Event Uploads Paused During Off-Season
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          Your studio is currently parked in <strong>Studio Vault</strong>. All existing client galleries, QR codes, guest downloads, and AI face matching are <strong>100% active</strong> with zero data pruning.
        </p>

        <p className="mx-auto mt-2 max-w-md text-xs text-slate-500">
          To start shooting and creating new events for the upcoming wedding season, restore your Studio Starter or Pro subscription with 1 click.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/dashboard/subscription-plans"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#082e47]"
          >
            Reactivate Studio Features
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/events"
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
          >
            View Existing Events
          </Link>
        </div>
      </div>
    );
  }

  // 2. Event limit reached check
  const isLimitReached =
    !checkingCount &&
    eventsLimit !== null &&
    eventsLimit !== -1 &&
    eventCount !== null &&
    eventCount >= eventsLimit;

  if (isLimitReached) {
    return (
      <div className="mx-auto my-6 max-w-2xl rounded-3xl border border-amber-200 bg-gradient-to-b from-amber-50/50 to-white p-8 text-center shadow-lg sm:p-10">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/10 text-amber-600">
          <AlertTriangle className="h-9 w-9" />
        </div>

        <div className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
          <Sparkles className="h-3.5 w-3.5" />
          Event Quota Reached ({eventCount}/{eventsLimit})
        </div>

        <h2 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">
          {isTrial ? "Free Trial Event Limit Reached" : "Monthly Event Limit Reached"}
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm text-slate-600">
          You have used all <strong>{eventsLimit} event{eventsLimit > 1 ? "s" : ""}</strong> allowed on your <strong>{planName || "current plan"}</strong>.
        </p>

        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href={`/dashboard/plans/payment?planCode=addon_extra_event_pass&planType=addon`}
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-emerald-700"
          >
            Get Extra Event Pass (₹149)
            <ArrowRight className="h-4 w-4" />
          </Link>

          <Link
            href="/dashboard/subscription-plans"
            className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-6 py-3 text-sm font-semibold text-white shadow-md transition hover:bg-[#082e47]"
          >
            Upgrade Plan
          </Link>
        </div>

        <p className="mt-4 text-xs text-slate-400">
          Extra Event Pass gives you +1 event (up to 2,500 photos) without changing your current plan.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <EventStepper />

      <StepOneBasicDetails />

      <StepTwoClient />

      <StepThreeTeam />

      <StepFourPricing />

      <StepFiveGallery />

      <StepSixAI />

      <StepSevenReview />

      <WizardFooter />
    </div>
  );
}

export default function EventWizard({
  projectId,
}: EventWizardProps) {
  return (
    <EventWizardProvider
      initialProjectId={projectId}
    >
      <EventWizardContent />
    </EventWizardProvider>
  );
}
