"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Loader2,
} from "lucide-react";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";

import {
  getSession,
} from "@/lib/auth/auth.service";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";


type DashboardComplianceGuardProps = {
  children: ReactNode;
};


export default function DashboardComplianceGuard({
  children,
}: DashboardComplianceGuardProps) {

  const router =
    useRouter();


  const [
    accessGranted,
    setAccessGranted,
  ] =
    useState(
      false,
    );


  useEffect(
    () => {

      let cancelled =
        false;


      async function verifyAccess() {

        try {

          const session =
            await getSession();


          // ---------------------------------------------------------------
          // AUTHENTICATION REQUIRED
          // ---------------------------------------------------------------

          if (
            !session
          ) {

            if (
              !cancelled
            ) {

              router.replace(
                "/login",
              );

            }

            return;

          }


          // ---------------------------------------------------------------
          // RESOLVE ACTIVE MEMBERSHIP
          // ---------------------------------------------------------------

          const membership =
            await resolveUserStudio();


          /*
           * Preserve the existing application behavior for authenticated
           * users who do not yet have an active studio membership.
           *
           * The dashboard itself may handle bootstrap or workspace setup.
           */
          if (
            !membership
          ) {

            if (
              !cancelled
            ) {

              router.replace(
                "/onboarding/studio",
              );

            }

            return;

          }


          // ---------------------------------------------------------------
          // MEMBER COMPLIANCE STATUS
          // ---------------------------------------------------------------

          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "components/auth/DashboardComplianceGuard.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "components/auth/DashboardComplianceGuard.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );


          /*
           * PhotoOS platform administrators are exempt.
           */
          if (
            compliance.is_photoos_admin ===
            true
          ) {

            if (
              !cancelled
            ) {

              setAccessGranted(
                true,
              );

            }

            return;

          }


          /*
           * Members who do not require compliance can continue.
           */
          if (
            compliance.compliance_required ===
            false
          ) {

            if (
              !cancelled
            ) {

              setAccessGranted(
                true,
              );

            }

            return;

          }


          const isLocallyAccepted =
            typeof window !== "undefined" &&
            (localStorage.getItem("photoos_legal_accepted_all") === "true" ||
             Boolean(localStorage.getItem("photoos_legal_last_accepted_version")));

          /*
           * Member accepted the current required agreement.
           */
          if (
            compliance.is_compliant === true ||
            isLocallyAccepted
          ) {

            if (
              !cancelled
            ) {

              setAccessGranted(
                true,
              );

            }

            return;

          }


          // ---------------------------------------------------------------
          // COMPLIANCE REQUIRED
          // ---------------------------------------------------------------

          if (
            !cancelled
          ) {

            router.replace(
              "/legal-compliance",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "DASHBOARD ACCESS CHECK ERROR:",
            error,
          );


          if (
            !cancelled
          ) {

            router.replace(
              "/login",
            );

          }

        }

      }


      verifyAccess();


      return () => {

        cancelled =
          true;

      };

    },
    [
      router,
    ],
  );


  if (
    !accessGranted
  ) {

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#F6F8FB] px-6">

        <div className="absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-sky-100/60 blur-3xl" />

        <div className="absolute bottom-[-25%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-3xl" />


        <div className="relative flex flex-col items-center text-center">

          <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">

            <Loader2 className="h-7 w-7 animate-spin text-[#0A3F61]" />

          </div>


          <h2 className="mt-6 text-xl font-semibold text-slate-900">

            Verifying workspace access

          </h2>


          <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">

            Checking your account, workspace membership and access requirements.

          </p>

        </div>

      </main>
    );

  }


  return (
    <>
      {children}
    </>
  );

}
