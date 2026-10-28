"use client";

import {
  ReactNode,
  useEffect,
  useState,
} from "react";

import {
  usePathname,
  useRouter,
} from "next/navigation";

import DashboardLayoutComponent from "@/components/layout/DashboardLayout";
import { AlbumSessionProvider } from "@/context/AlbumSessionContext";
import { BootstrapProvider } from "@/context/BootstrapContext";
import { DashboardProvider } from "@/context/DashboardContext";
import { SubscriptionAccessProvider } from "@/context/SubscriptionAccessContext";
import { NotificationProvider } from "@/context/NotificationContext";

import {
  SubscriptionAccessGate,
} from "@/components/subscription/SubscriptionAccessGate";

import { getSession } from "@/lib/auth/session";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";


type LayoutProps = {
  children: ReactNode;
};


type GuardState =
  | "loading"
  | "authorized"
  | "denied";


export default function Layout({
  children,
}: LayoutProps) {

  const router =
    useRouter();


  const pathname =
    usePathname();


  const [
    guardState,
    setGuardState,
  ] =
    useState<GuardState>(
      "loading",
    );


  useEffect(
    () => {

      let cancelled =
        false;


      async function verifyDashboardAccess() {

        try {

          const session =
            await getSession();


          /*
           * Supabase authentication is required.
           */
          if (!session?.user) {

            if (!cancelled) {

              setGuardState(
                "denied",
              );

              router.replace(
                "/login",
              );

            }

            return;

          }


          /*
           * Resolve the user's active PhotoOS studio membership
           * through the Supabase-backed bootstrap boundary.
           */
          const membership =
            await resolveUserStudio();


          /*
           * Keep existing application behavior for users
           * who are authenticated but do not yet have
           * a studio membership.
           */
          if (!membership) {

            if (!cancelled) {

              setGuardState(
                "denied",
              );

              router.replace(
                "/onboarding/studio",
              );

            }

            return;

          }


          /*
           * Check member-level legal compliance.
           */
          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "app/dashboard/layout.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );

          console.log(
            "DEBUG_COMPLIANCE_GUARD:",
            {
              file: "app/dashboard/layout.tsx",
              studioId: membership.studioId,
              compliance,
            },
          );


          /*
           * PhotoOS Admin is exempt.
           */
          if (
            compliance.is_photoos_admin ===
            true
          ) {

            if (!cancelled) {

              setGuardState(
                "authorized",
              );

            }

            return;

          }


          /*
           * Compliance is not required.
           */
          if (
            compliance.compliance_required ===
            false
          ) {

            if (!cancelled) {

              setGuardState(
                "authorized",
              );

            }

            return;

          }


          /*
           * Member already accepted the current agreement.
           */
          if (
            compliance.is_compliant ===
            true
          ) {

            if (!cancelled) {

              setGuardState(
                "authorized",
              );

            }

            return;

          }


          /*
           * Legal compliance is mandatory before
           * accessing any dashboard route.
           */
          if (!cancelled) {

            setGuardState(
              "denied",
            );

            router.replace(
              "/legal-compliance",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "DASHBOARD ACCESS GUARD ERROR:",
            error,
          );


          if (!cancelled) {
            setGuardState(
              "denied",
            );
            router.replace(
              "/onboarding/studio",
            );
          }

        }

      }


      verifyDashboardAccess();


      return () => {

        cancelled =
          true;

      };

    },
    [
      pathname,
      router,
    ],
  );


  /*
   * Do not render dashboard content until
   * access verification is complete.
   */
  if (
    guardState ===
    "loading"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center">

        <div className="space-y-4 text-center">

          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />

          <h2 className="text-xl font-semibold">
            Verifying access...
          </h2>

          <p className="text-sm text-muted-foreground">
            Checking your workspace permissions.
          </p>

        </div>

      </main>
    );

  }


  /*
   * Redirect is already in progress.
   * Never expose dashboard content.
   */
  if (
    guardState ===
    "denied"
  ) {

    return null;

  }


  return (

    <BootstrapProvider>

      <SubscriptionAccessProvider>

        <NotificationProvider>

          <DashboardProvider>

          <AlbumSessionProvider>

            <DashboardLayoutComponent>

              {children}

            </DashboardLayoutComponent>

            <SubscriptionAccessGate />

          </AlbumSessionProvider>

          </DashboardProvider>

        </NotificationProvider>

      </SubscriptionAccessProvider>

    </BootstrapProvider>

  );

}
