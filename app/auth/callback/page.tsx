"use client";

import {
  Suspense,
  useEffect,
  useRef,
} from "react";

import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const processedRef = useRef(false);

  useEffect(() => {
    let mounted = true;

    async function completeLogin() {
      // Prevent double execution in React StrictMode
      if (processedRef.current) return;
      processedRef.current = true;

      try {
        const code = searchParams.get("code");
        const tokenHash = searchParams.get("token_hash");
        const next = searchParams.get("next");
        const callbackError = searchParams.get("error");
        const errorDescription = searchParams.get("error_description");

        if (callbackError) {
          throw new Error(errorDescription || callbackError);
        }

        let session: Session | null = null;

        // Path 0: Check if client already established session in background (detectSessionInUrl)
        const { data: initialData } = await supabase.auth.getSession();
        if (initialData?.session) {
          session = initialData.session;
        }

        // Path 1: PKCE Code exchange
        if (!session && code) {
          try {
            const { data: exchangeData, error: exchangeError } =
              await supabase.auth.exchangeCodeForSession(code);

            if (exchangeError) {
              console.warn("[AuthCallback] Code exchange warning:", exchangeError.message);
            } else if (exchangeData?.session) {
              session = exchangeData.session;
            }
          } catch (codeErr) {
            console.warn("[AuthCallback] Exchange exception:", codeErr);
          }
        }

        // Path 2: Token hash (magiclink / OTP)
        if (!session && tokenHash) {
          const type = (searchParams.get("type") as "email" | "magiclink" | null) || "email";
          try {
            const { data: otpData, error: otpError } =
              await supabase.auth.verifyOtp({
                token_hash: tokenHash,
                type,
              });

            if (otpError) {
              console.warn("[AuthCallback] OTP warning:", otpError.message);
            } else if (otpData?.session) {
              session = otpData.session;
            }
          } catch (otpErr) {
            console.warn("[AuthCallback] OTP exception:", otpErr);
          }
        }

        // Path 3: Hash parameters (#access_token=...&refresh_token=...)
        if (!session && typeof window !== "undefined" && window.location.hash) {
          const hashParams = new URLSearchParams(window.location.hash.replace(/^#/, ""));
          const accessToken = hashParams.get("access_token");
          const refreshToken = hashParams.get("refresh_token");

          if (accessToken && refreshToken) {
            try {
              const { data: hashData, error: hashError } =
                await supabase.auth.setSession({
                  access_token: accessToken,
                  refresh_token: refreshToken,
                });

              if (hashError) {
                console.warn("[AuthCallback] Hash session warning:", hashError.message);
              } else if (hashData?.session) {
                session = hashData.session;
              }
            } catch (hashErr) {
              console.warn("[AuthCallback] Hash exception:", hashErr);
            }
          }
        }

        // Path 4: Poll getSession() with backoff (up to 20 attempts x 150ms = 3.0s)
        if (!session) {
          for (let attempt = 0; attempt < 20; attempt++) {
            const { data: pollData } = await supabase.auth.getSession();
            if (pollData?.session) {
              session = pollData.session;
              break;
            }
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }

        if (!session) {
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
          const errMessage =
            error instanceof Error
              ? encodeURIComponent(error.message)
              : "authentication_failed";
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
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>
        <p className="text-sm text-muted-foreground">
          Preparing your PhotoOS workspace...
        </p>
      </div>
    </main>
  );
}

function AuthCallbackFallback() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="text-center space-y-4">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <h2 className="text-xl font-semibold">
          Signing you in...
        </h2>
        <p className="text-sm text-muted-foreground">
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
