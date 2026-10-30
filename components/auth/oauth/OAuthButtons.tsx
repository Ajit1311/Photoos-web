"use client";

import { useSearchParams } from "next/navigation";
import { FcGoogle } from "react-icons/fc";
import { signInWithGoogle } from "@/lib/auth/auth.service";
import { publishableKey } from "@/lib/supabase/config";

export function OAuthButtons() {
  const searchParams = useSearchParams();

  async function handleGoogle() {
    try {
      if (!publishableKey || publishableKey.includes("dummy_static_prerender")) {
        alert("Supabase API key is missing. Please check NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel.");
        return;
      }

      // Preserve all plan and onboarding parameters across the Google OAuth redirect
      const params = new URLSearchParams();
      const planId = searchParams.get("planId");
      const planCode = searchParams.get("planCode");
      const billingCycle = searchParams.get("billingCycle");
      const mode = searchParams.get("mode");
      const nextParam = searchParams.get("next");

      if (planId) params.set("planId", planId);
      if (planCode) params.set("planCode", planCode);
      if (billingCycle) params.set("billingCycle", billingCycle);
      if (mode) params.set("mode", mode);

      const qs = params.toString();
      const targetNext = nextParam || (qs ? `/auth/loading?${qs}` : "/auth/loading");

      await signInWithGoogle(targetNext);
    } catch (err) {
      console.error("[OAuthButtons] Google sign-in failed:", err);
      alert("Google login failed. Please try again.");
    }
  }

  return (
    <div className="space-y-3">
      <button
        type="button"
        onClick={handleGoogle}
        className="flex h-11 w-full items-center justify-center gap-3 rounded-xl border border-border bg-card shadow-sm transition hover:border-ring/50 hover:bg-muted font-medium text-sm"
      >
        <FcGoogle className="text-lg" />
        Continue with Google
      </button>
    </div>
  );
}
