"use client";

import {
  useEffect,
} from "react";

import {
  useRouter,
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


export default function LoadingPage() {

  const router =
    useRouter();

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(
          window.location.search,
        ).get("next")
      : null;


  useEffect(
    () => {

      let cancelled =
        false;


      async function checkAuth() {

        try {

          const session =
            await getSession();


          // -------------------------------------------------------------------
          // NO SESSION
          // -------------------------------------------------------------------

          if (!session) {

            if (!cancelled) {

              router.replace(
                "/login",
              );

            }

            return;

          }


          // -------------------------------------------------------------------
          // RESOLVE ACTIVE STUDIO MEMBERSHIP
          // -------------------------------------------------------------------

          const membership =
            await resolveUserStudio();


          /*
           * A user may be authenticated but may not yet have
           * an active studio membership.
           *
           * Do not send such a user directly to the dashboard.
           */
          if (!membership) {

            if (!cancelled) {

              router.replace(
                next ??
                "/onboarding/studio",
              );

            }

            return;

          }


          // -------------------------------------------------------------------
          // CHECK MEMBER LEGAL COMPLIANCE
          // -------------------------------------------------------------------

          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "app/auth/loading/page.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "app/auth/loading/page.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );


          /*
           * PhotoOS platform admins are exempt.
           */
          if (
            compliance.is_photoos_admin ===
            true
          ) {

            if (!cancelled) {

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          /*
           * No compliance requirement for this member.
           */
          if (
            compliance.compliance_required ===
            false
          ) {

            if (!cancelled) {

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          /*
           * Member has already accepted the current
           * required legal agreement.
           */
          if (
            compliance.is_compliant ===
            true
          ) {

            if (!cancelled) {

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          // -------------------------------------------------------------------
          // LEGAL COMPLIANCE REQUIRED
          // -------------------------------------------------------------------

          if (!cancelled) {

            router.replace(
              "/legal-compliance",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "AUTH LOADING ERROR:",
            error,
          );


          if (!cancelled) {

            router.replace(
              "/login",
            );

          }

        }

      }


      checkAuth();


      return () => {

        cancelled =
          true;

      };

    },
    [
      router,
    ],
  );


  return (
    <main className="flex min-h-screen items-center justify-center">

      <div className="space-y-4 text-center">

        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="text-sm text-muted-foreground">
          Preparing your workspace.
        </p>

      </div>

    </main>
  );

}