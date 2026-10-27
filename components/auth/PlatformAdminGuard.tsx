"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Loader2,
  ShieldAlert,
} from "lucide-react";

import {
  getCurrentUser,
} from "@/lib/auth/auth.service";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import {
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";


type GuardState =
  | "loading"
  | "authorized"
  | "denied";


type PlatformAdminGuardProps = {
  children: ReactNode;
};


export default function PlatformAdminGuard({
  children,
}: PlatformAdminGuardProps) {

  const router =
    useRouter();


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


      async function verifyPlatformAdminAccess() {

        try {

          const user =
            await getCurrentUser();


          if (!user) {

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


          const membership =
            await resolveUserStudio();


          if (!membership) {

            if (!cancelled) {

              setGuardState(
                "denied",
              );

              router.replace(
                "/dashboard",
              );

            }

            return;

          }


          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );


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


          if (!cancelled) {

            setGuardState(
              "denied",
            );

            router.replace(
              "/dashboard",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "PLATFORM ADMIN ACCESS GUARD ERROR:",
            error,
          );


          if (!cancelled) {

            setGuardState(
              "denied",
            );

            router.replace(
              "/dashboard",
            );

          }

        }

      }


      verifyPlatformAdminAccess();


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
    guardState ===
    "loading"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">

        <div className="space-y-4 text-center">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm">

            <Loader2 className="h-6 w-6 animate-spin text-[#0A3F61]" />

          </div>


          <div>

            <h2 className="text-lg font-semibold text-slate-900">

              Verifying platform access

            </h2>


            <p className="mt-1 text-sm text-slate-500">

              Checking your administrator permissions.

            </p>

          </div>

        </div>

      </main>
    );

  }


  if (
    guardState ===
    "denied"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-6">

        <div className="w-full max-w-md rounded-[28px] border border-slate-200 bg-white p-8 text-center shadow-xl shadow-slate-200/60">

          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <ShieldAlert className="h-7 w-7" />

          </div>


          <h1 className="mt-6 text-xl font-bold text-slate-900">

            Access restricted

          </h1>


          <p className="mt-3 text-sm leading-6 text-slate-500">

            Platform administration access is restricted to authorised PhotoOS administrators.

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
