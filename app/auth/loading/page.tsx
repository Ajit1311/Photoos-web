"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { getSession } from "@/lib/auth/auth.service";
import { supabase } from "@/lib/supabase/client";
import { LEGAL_CONFIG } from "@/config/legal";
import { createOnboardingSubscription } from "@/lib/api/onboarding/studio-subscription";

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let cancelled = false;

    async function checkAuthAndRoute() {
      try {
        // Step 1: Resilient session retrieval with storage hydration polling (up to 3s)
        let session = await getSession();
        if (!session) {
          for (let i = 0; i < 15; i++) {
            await new Promise((r) => setTimeout(r, 200));
            if (cancelled) return;
            session = await getSession();
            if (session) break;
          }
        }

        // NO SESSION -> redirect to login
        if (!session || !session.user) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        const user = session.user;

        // Build query string of plan parameters to preserve across all steps
        const planParams = new URLSearchParams();
        const planId = searchParams.get("planId");
        const planCode = searchParams.get("planCode");
        const billingCycle = searchParams.get("billingCycle");
        const mode = searchParams.get("mode");
        const nextParam = searchParams.get("next");

        if (planId) planParams.set("planId", planId);
        if (planCode) planParams.set("planCode", planCode);
        if (billingCycle) planParams.set("billingCycle", billingCycle);
        if (mode) planParams.set("mode", mode);
        if (nextParam) planParams.set("next", nextParam);

        const qs = planParams.toString();
        const planSuffix = qs ? `?${qs}` : "";

        const isTrial =
          mode === "trial" ||
          !planId ||
          planId.toLowerCase().includes("trial") ||
          planCode?.toLowerCase().includes("trial");

        // -------------------------------------------------------------------
        // STEP 1: CHECK EMAIL OTP VERIFICATION
        // -------------------------------------------------------------------
        const sessionOtpVerified =
          typeof window !== "undefined" &&
          Boolean(sessionStorage.getItem("photoos_session_otp_verified"));

        let isOtpVerified =
          sessionOtpVerified ||
          Boolean(user.app_metadata?.photoos_email_otp_verified_at);

        // If not in session, attempt a fast refresh to hydrate freshly verified sessions
        if (!isOtpVerified) {
          const { data: refreshed } = await supabase.auth.refreshSession();
          if (refreshed?.session?.user?.app_metadata?.photoos_email_otp_verified_at) {
            isOtpVerified = true;
          }
        }

        // If user is not yet OTP verified in session, gate on OTP
        if (!sessionOtpVerified && !isOtpVerified) {
          if (!cancelled) {
            const emailParam = user.email ? `&email=${encodeURIComponent(user.email)}` : "";
            router.replace(`/auth/email-otp${planSuffix ? `${planSuffix}${emailParam}` : `?${emailParam.slice(1)}`}`);
          }
          return;
        }

        // Check if user is an existing studio owner who already completed onboarding
        const { data: activeMember } = await supabase
          .from("studio_members")
          .select("id, studio_id")
          .eq("profile_id", user.id)
          .eq("status", "active")
          .limit(1)
          .maybeSingle();

        let currentStudioId = activeMember?.studio_id ?? null;
        if (!currentStudioId && typeof window !== "undefined") {
          currentStudioId = localStorage.getItem("photoos_active_studio_id") || localStorage.getItem("photoos_studio_id");
        }

        const { data: activeSub } = currentStudioId
          ? await supabase
              .from("subscriptions")
              .select("id, plan_id, status, trial_end_at, subscription_end_at")
              .eq("studio_id", currentStudioId)
              .limit(1)
              .maybeSingle()
          : { data: null };

        const isAlreadyOnboardedStudio =
          Boolean(currentStudioId) &&
          Boolean(activeSub) &&
          (activeSub?.status === "active" ||
            (activeSub?.status === "trial" &&
              new Date(activeSub.trial_end_at).getTime() > Date.now()));

        // -------------------------------------------------------------------
        // STEP 2: CHECK LEGAL COMPLIANCE (STRICTLY SCOPED TO CURRENT USER)
        // -------------------------------------------------------------------
        const isLocallyAccepted =
          typeof window !== "undefined" &&
          (Boolean(user?.id && localStorage.getItem(`photoos_user_${user.id}_legal_accepted_v${LEGAL_CONFIG.version}`) === "true") ||
           (mode === "corporate" && localStorage.getItem("photoos_corporate_compliance_accepted") === "true"));

        // Check statutory DPDP user_consents table for all 3 required documents
        const { data: consents } = await supabase
          .from("user_consents")
          .select("document_type")
          .eq("user_id", user.id)
          .eq("version", LEGAL_CONFIG.version)
          .is("withdrawn_at", null);

        const hasTerms = consents?.some((c) => c.document_type === "terms_of_service");
        const hasPrivacy = consents?.some((c) => c.document_type === "privacy_policy");
        const hasPlatform = consents?.some((c) => c.document_type === "platform_agreement");
        const isLegalCompliant = Boolean((hasTerms && hasPrivacy && hasPlatform) || isLocallyAccepted);

        if (!isLegalCompliant) {
          if (!cancelled) {
            router.replace(`/legal-compliance${planSuffix}`);
          }
          return;
        }

        // -------------------------------------------------------------------
        // STEP 3: CORPORATE ROUTING OR STUDIO WORKSPACE MEMBERSHIP
        // -------------------------------------------------------------------
        if (mode === "corporate") {
          if (!cancelled) {
            router.replace(nextParam ?? "/corporate/onboarding");
          }
          return;
        }

        if (!currentStudioId) {
          if (!cancelled) {
            router.replace(`/onboarding/studio${planSuffix}`);
          }
          return;
        }

        const studioId = currentStudioId;

        // -------------------------------------------------------------------
        // STEP 4: SUBSCRIPTION & PAYMENT ROUTING
        // -------------------------------------------------------------------
        if (activeSub) {
          // If trial or paid active, proceed directly to Dashboard
          if (
            activeSub.status === "active" ||
            (activeSub.status === "trial" &&
              new Date(activeSub.trial_end_at).getTime() > Date.now())
          ) {
            if (!cancelled) {
              router.replace(nextParam ?? "/dashboard");
            }
            return;
          }

          // If paid plan with pending payment, send to Payment page
          if (activeSub.status === "past_due" || activeSub.status === "pending") {
            if (!cancelled) {
              router.replace(`/onboarding/studio/payment?planId=${activeSub.plan_id}&${qs}`);
            }
            return;
          }
        }

        // No subscription found yet on the studio:
        if (isTrial) {
          // FREE TRIAL: Activate 7-day trial in database, redirect to Dashboard directly
          try {
            await createOnboardingSubscription(studioId, "photoos_free_trial_7_day");
          } catch (trialErr) {
            console.warn("[AuthLoading] Free trial auto-creation notice:", trialErr);
          }
          if (!cancelled) {
            router.replace("/dashboard");
          }
          return;
        }

        // PAID PLAN: Send to Payment page
        if (!cancelled) {
          router.replace(`/onboarding/studio/payment${planSuffix}`);
        }
      } catch (error) {
        console.error("[AuthLoading] Onboarding routing error:", error);
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    void checkAuthAndRoute();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans">
      <div className="space-y-4 text-center p-6">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61] dark:bg-sky-500/10 dark:text-sky-400">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
        <h2 className="text-xl font-bold tracking-tight">
          Signing you in...
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Preparing your PhotoOS workspace...
        </p>
      </div>
    </main>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] dark:bg-slate-950">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading...</span>
          </div>
        </main>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
