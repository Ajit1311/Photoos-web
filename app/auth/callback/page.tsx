"use client";

import {
  Suspense,
  useEffect,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    let mounted = true;

    async function completeLogin() {
      try {
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const next = searchParams.get("next");
        const callbackError = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (callbackError) {
          throw new Error(errorDescription || callbackError);
        }

        // 1. If PKCE authorization code is returned from Google / OAuth
        if (code) {
          const { error: exchangeError } =
            await supabase.auth.exchangeCodeForSession(code);

          if (exchangeError) {
            console.error("[AuthCallback] Code exchange error:", exchangeError);
            throw exchangeError;
          }
        } else if (tokenHash) {
          // 2. If token hash (OTP or Magic Link)
          const type = (searchParams.get("type") as "email" | "magiclink" | null) || "email";
          const { error: otpError } =
            await supabase.auth.verifyOtp({
              token_hash: tokenHash,
              type,
            });

          if (otpError) {
            console.error("[AuthCallback] OTP verification error:", otpError);
            throw otpError;
          }
        } else if (typeof window !== "undefined" && window.location.hash) {
          // 3. If hash parameters (#access_token=...&refresh_token=...)
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            const { error: setSessionError } =
              await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });

            if (setSessionError) {
              console.error("[AuthCallback] Set session error:", setSessionError);
              throw setSessionError;
            }
          }
        }

        // 4. Verify and establish session
        const {
          data,
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          throw sessionError;
        }

        if (!data.session) {
          throw new Error("Authentication session could not be established.");
        }

        if (mounted) {
          const loadingUrl = new URL(
            "/auth/loading",
            window.location.origin,
          );

          if (next) {
            loadingUrl.searchParams.set("next", next);
          }

          router.replace(loadingUrl.toString());
        }
      } catch (error) {
        console.error(
          "[AuthCallback] Authentication failed:",
          error,
        );

        if (mounted) {
          const errMessage = error instanceof Error ? encodeURIComponent(error.message) : "authentication_failed";
          router.replace(`/login?error=${errMessage}`);
        }
      }
    }

    completeLogin();

    return () => {
      mounted = false;
    };
  }, [router, searchParams]);

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
    <Suspense fallback={<AuthCallbackFallback />}>
      <AuthCallbackContent />
    </Suspense>
  );
}
