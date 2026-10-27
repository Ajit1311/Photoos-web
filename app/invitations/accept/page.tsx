"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  acceptTeamInvitation,
} from "@/lib/api/team-members";

import {
  getCurrentUser,
} from "@/lib/auth/auth.service";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";


type PageState =
  | "loading"
  | "unauthenticated"
  | "accepting"
  | "success"
  | "error";


function AcceptInvitationContent() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();

  const token =
    searchParams.get("token");

  const [state, setState] =
    useState<PageState>(
      "loading",
    );

  const [error, setError] =
    useState<string | null>(
      null,
    );


  useEffect(
    () => {

      let cancelled =
        false;


      async function initialize() {

        if (!token) {

          if (!cancelled) {

            setError(
              "Invitation token is missing.",
            );

            setState(
              "error",
            );

          }

          return;
        }


        try {

          const user =
            await getCurrentUser();


          if (!user) {

            if (!cancelled) {

              setState(
                "unauthenticated",
              );

            }

            return;
          }


          if (!cancelled) {

            setState(
              "accepting",
            );

          }


          await acceptTeamInvitation(
            token,
          );


          const membership =
            await resolveUserStudio();


          if (!membership) {

            throw new Error(
              "Your team membership was created, but no active studio could be resolved.",
            );

          }


          if (
            typeof window !==
            "undefined"
          ) {

            window.localStorage.setItem(
              "photoos.activeStudioId",
              membership.studioId,
            );

            window.localStorage.setItem(
              "photoos.activeMemberId",
              membership.memberId,
            );

            window.localStorage.setItem(
              "photoos.activeRoleId",
              membership.roleId,
            );

          }


          if (!cancelled) {

            setState(
              "success",
            );

          }


          window.setTimeout(
            () => {

              router.replace(
                "/dashboard",
              );

              router.refresh();

            },
            1200,
          );


        } catch (
          error
        ) {

          console.error(
            "INVITATION ACCEPT ERROR:",
            error,
          );


          if (!cancelled) {

            setError(
              error instanceof Error
                ? error.message
                : "Unable to accept the invitation.",
            );

            setState(
              "error",
            );

          }

        }

      }


      initialize();


      return () => {

        cancelled =
          true;

      };

    },
    [
      router,
      token,
    ],
  );


  if (
    state ===
    "loading"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>
          Checking your invitation...
        </p>
      </main>
    );

  }


  if (
    state ===
    "unauthenticated"
  ) {

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">
          Sign in to accept your invitation
        </h1>

        <p className="text-muted-foreground">
          Please sign in using the same email address that received the invitation.
        </p>

        <button
          type="button"
          onClick={() => {

            router.push(
              `/login?next=${encodeURIComponent(
                `/invitations/accept?token=${token ?? ""}`,
              )}`,
            );

          }}
          className="rounded-md px-4 py-2"
        >
          Go to Login
        </button>
      </main>
    );

  }


  if (
    state ===
    "accepting"
  ) {

    return (
      <main className="flex min-h-screen items-center justify-center">
        <p>
          Accepting your invitation...
        </p>
      </main>
    );

  }


  if (
    state ===
    "success"
  ) {

    return (
      <main className="flex min-h-screen flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-semibold">
          Invitation accepted
        </h1>

        <p className="text-muted-foreground">
          Your studio access is ready. Redirecting to your dashboard...
        </p>
      </main>
    );

  }


  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-2xl font-semibold">
        Unable to accept invitation
      </h1>

      <p className="text-muted-foreground">
        {error}
      </p>
    </main>
  );

}


export default function AcceptInvitationPage() {

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <p>
            Loading invitation...
          </p>
        </main>
      }
    >
      <AcceptInvitationContent />
    </Suspense>
  );

}
