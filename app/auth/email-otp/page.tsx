"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Loader2, Mail, ShieldCheck, ArrowRight, RefreshCw, KeyRound, LockKeyhole } from "lucide-react";
import { getCurrentUser, getAccessToken, signOut } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const OTP_LENGTH = 6;
const COOLDOWN_SECONDS = 60;

function EmailOtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(true);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(COOLDOWN_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const initialSentRef = useRef(false);

  // Preserve plan params
  const planId = searchParams.get("planId");
  const planCode = searchParams.get("planCode");
  const billingCycle = searchParams.get("billingCycle");
  const mode = searchParams.get("mode");
  const nextParam = searchParams.get("next");

  const buildPlanQueryString = useCallback(() => {
    const params = new URLSearchParams();
    if (planId) params.set("planId", planId);
    if (planCode) params.set("planCode", planCode);
    if (billingCycle) params.set("billingCycle", billingCycle);
    if (mode) params.set("mode", mode);
    if (nextParam) params.set("next", nextParam);
    return params.toString();
  }, [planId, planCode, billingCycle, mode, nextParam]);

  // Countdown timer for resend
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown((c) => Math.max(0, c - 1)), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const callOtp = useCallback(
    async (action: "send" | "verify", code?: string) => {
      if (!SUPABASE_URL) {
        throw new Error("Supabase URL is not configured.");
      }

      const user = await getCurrentUser();
      if (!user) {
        throw new Error("Your session has expired. Please sign in again.");
      }

      const accessToken = await getAccessToken();
      if (!accessToken) {
        throw new Error("Unable to establish authentication session.");
      }

      const userEmail = user.email || email.trim();
      if (!userEmail) {
        throw new Error("A valid email address is required.");
      }

      const response = await fetch(`${SUPABASE_URL}/functions/v1/email-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          action,
          email: userEmail,
          ...(action === "verify" ? { otp: code } : {}),
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        const errMsg =
          (typeof data?.error === "string" ? data.error : data?.error?.message) ||
          "Unable to process verification code.";
        throw new Error(errMsg);
      }

      return data;
    },
    [email]
  );

  // Initialize and dispatch OTP on mount
  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        const user = await getCurrentUser();
        if (!user) {
          const qs = buildPlanQueryString();
          router.replace(`/login${qs ? `?${qs}` : ""}`);
          return;
        }

        const userEmail = user.email ?? searchParams.get("email") ?? "";
        if (!cancelled) {
          setEmail(userEmail);
          setLoading(false);
        }

        // Check if user is already verified
        if (user.app_metadata?.photoos_email_otp_verified_at) {
          const qs = buildPlanQueryString();
          router.replace(`/auth/loading${qs ? `?${qs}` : ""}`);
          return;
        }

        // Auto-send OTP once on mount
        if (!initialSentRef.current) {
          initialSentRef.current = true;
          try {
            const result = await callOtp("send");
            if (!cancelled) {
              setMessage("A 6-digit verification code has been sent to your email.");
              if (result?.retry_after_seconds) {
                setCountdown(Number(result.retry_after_seconds));
              } else {
                setCountdown(COOLDOWN_SECONDS);
              }
            }
          } catch (sendErr) {
            console.warn("[EmailOTP] Initial send notice:", sendErr);
            if (!cancelled) {
              const msg = sendErr instanceof Error ? sendErr.message : "Code request in progress";
              if (msg.includes("Too many") || msg.includes("cooldown")) {
                setMessage("A verification code was recently sent. Please check your inbox.");
              } else {
                setError(msg);
              }
            }
          }
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Unable to prepare verification.");
          setLoading(false);
        }
      }
    }

    void init();

    return () => {
      cancelled = true;
    };
  }, [router, searchParams, buildPlanQueryString, callOtp]);

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setError(null);
    setMessage(null);

    const cleanOtp = otp.replace(/\D/g, "");
    if (cleanOtp.length !== OTP_LENGTH) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setVerifying(true);

    try {
      const data = await callOtp("verify", cleanOtp);

      if (data?.verified !== true) {
        throw new Error("Verification code is invalid or expired.");
      }

      // Refresh session to hydrate updated app_metadata
      await supabase.auth.refreshSession();

      // Proceed to central onboarding resolver
      const qs = buildPlanQueryString();
      router.replace(`/auth/loading${qs ? `?${qs}` : ""}`);
    } catch (err) {
      console.error("[EmailOTP] Verification error:", err);
      setError(
        err instanceof Error ? err.message : "The code entered is incorrect or expired. Please retry."
      );
    } finally {
      setVerifying(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || resending) return;

    setResending(true);
    setError(null);
    setMessage(null);

    try {
      const result = await callOtp("send");
      setMessage("A fresh verification code has been sent to your email.");
      setCountdown(result?.retry_after_seconds ? Number(result?.retry_after_seconds) : COOLDOWN_SECONDS);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to resend verification code.");
    } finally {
      setResending(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    const qs = buildPlanQueryString();
    router.replace(`/login${qs ? `?${qs}` : ""}`);
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] dark:bg-slate-950 p-4">
        <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300 text-sm">
          <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
          <span>Preparing secure email verification...</span>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f7fafc] dark:bg-slate-950 flex flex-col justify-between selection:bg-[#0A3F61] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Image
            src="/photoos-login-logo.png"
            alt="PhotoOS"
            width={140}
            height={36}
            priority
            className="h-auto w-[130px] object-contain"
          />
        </Link>
        <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
          <ShieldCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
          <span>Two-Step Security</span>
        </div>
      </header>

      {/* Main Container */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-slate-200 bg-white p-7 sm:p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="mx-auto flex h-13 w-13 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61] dark:bg-sky-500/10 dark:text-sky-400 mb-4">
                <Mail className="h-6 w-6" />
              </div>

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                Verify Your Email
              </h1>

              <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                To protect your studio data, enter the 6-digit verification code sent to:
              </p>

              <p className="mt-1 font-semibold text-sm text-[#0A3F61] dark:text-sky-400 break-all">
                {email}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Informational Message */}
            {message && !error && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300">
                {message}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleVerify} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 text-center">
                  Enter 6-Digit Code
                </label>

                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={OTP_LENGTH}
                    value={otp}
                    onChange={(e) => {
                      setOtp(e.target.value.replace(/\D/g, "").slice(0, OTP_LENGTH));
                      setError(null);
                    }}
                    placeholder="123456"
                    autoFocus
                    required
                    className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-center tracking-[0.35em] font-mono text-xl font-bold text-slate-900 placeholder-slate-300 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-600 focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                  />
                </div>

                <div className="mt-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>
                    {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive the code?"}
                  </span>
                  <button
                    type="button"
                    disabled={countdown > 0 || resending}
                    onClick={() => void handleResend()}
                    className="text-[#0A3F61] dark:text-sky-400 font-semibold hover:underline disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
                  >
                    {resending && <RefreshCw className="h-3 w-3 animate-spin" />}
                    <span>Resend Code</span>
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={verifying || otp.length !== OTP_LENGTH}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifying ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <span>Verify & Continue</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Account Switcher */}
            <div className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800 text-center">
              <button
                type="button"
                onClick={() => void handleSignOut()}
                className="text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
              >
                Sign out and use a different account
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        &copy; {new Date().getFullYear()} PhotoOS &bull; Enterprise Security & Privacy
      </footer>
    </main>
  );
}

export default function EmailOtpPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7fafc] dark:bg-slate-950 p-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading verification...</span>
          </div>
        </main>
      }
    >
      <EmailOtpContent />
    </Suspense>
  );
}
