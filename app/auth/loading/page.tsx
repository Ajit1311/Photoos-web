"use client";

import {
  Suspense,
  useEffect,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  getSession,
} from "@/lib/auth/auth.service";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";

function LoadingContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
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
        if (!session) {
          if (!cancelled) {
            router.replace("/login");
          }
          return;
        }

        // Step 2: Resolve active studio membership
        let membership = null;
        try {
          membership = await resolveUserStudio();
        } catch (resolveErr) {
          console.warn("[AuthLoading] Studio resolution notice (new or unassigned user):", resolveErr);
          // If membership lookup or workspace bootstrap fails, do not lock user out to login!
          // Send them to studio onboarding so they can set up or join a studio.
          if (!cancelled) {
            router.replace(next ?? "/onboarding/studio");
          }
          return;
        }

        /*
         * A user may be authenticated but may not yet have
         * an active studio membership.
         * Send to onboarding.
         */
        if (!membership) {
          if (!cancelled) {
            router.replace(next ?? "/onboarding/studio");
          }
          return;
        }

        // Step 3: Check member legal compliance
        try {
          const compliance = await getCurrentMemberComplianceStatus(membership.studioId);

          if (
            compliance.is_photoos_admin === true ||
            compliance.compliance_required === false ||
            compliance.is_compliant === true
          ) {
            if (!cancelled) {
              router.replace(next ?? "/dashboard");
            }
            return;
          }

          if (!cancelled) {
            router.replace("/legal-compliance");
          }
        } catch (complianceErr) {
          console.warn("[AuthLoading] Compliance check warning, defaulting to dashboard:", complianceErr);
          if (!cancelled) {
            router.replace(next ?? "/dashboard");
          }
        }
      } catch (error) {
        console.error("AUTH LOADING ERROR:", error);
        if (!cancelled) {
          router.replace("/login");
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, next]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="space-y-4 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>
        <p className="text-sm text-muted-foreground">
          Preparing your workspace...
        </p>
      </div>
    </main>
  );
}

export default function LoadingPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
          <div className="space-y-4 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
            <h2 className="text-xl font-semibold">
              Signing you in...
            </h2>
            <p className="text-sm text-muted-foreground">
              Preparing your workspace...
            </p>
          </div>
        </main>
      }
    >
      <LoadingContent />
    </Suspense>
  );
}
