"use client";

import {
  Suspense,
  useEffect,
} from "react";

import { useRouter } from "next/navigation";

import { supabase } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(
          window.location.search,
        ).get("next")
      : null;

  useEffect(() => {
    let mounted = true;

    async function completeLogin() {
      try {
        const {
          data,
          error,
        } =
          await supabase.auth.getSession();

        if (error) {
          throw error;
        }

        if (!data.session) {
          throw new Error(
            "Authentication session could not be established.",
          );
        }

        if (mounted) {
          const loadingUrl =
            new URL(
              "/auth/loading",
              window.location.origin,
            );

          if (next) {
            loadingUrl.searchParams.set(
              "next",
              next,
            );
          }

          router.replace(
            loadingUrl.toString(),
          );
        }
      } catch (error) {
        console.error(
          "[AuthCallback] Authentication failed:",
          error,
        );

        if (mounted) {
          router.replace(
            "/login?error=authentication_failed",
          );
        }
      }
    }

    completeLogin();

    return () => {
      mounted = false;
    };
  }, [router, next]);

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your PhotoOS workspace...
        </p>
      </div>
    </main>
  );
}

function AuthCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>

        <p className="mt-2 text-sm text-muted-foreground">
          Preparing your PhotoOS workspace...
        </p>
      </div>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <AuthCallbackFallback />
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}