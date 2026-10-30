"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { supabase } from "@/lib/supabase/client";
import { getCorporateCompany, saveCorporateCompany } from "@/lib/corporate/corporate-service";

function CorporateLoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"credentials" | "otp">("credentials");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "otp" && countdown > 0) {
      timer = setInterval(() => setCountdown((c) => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  // Google OAuth sign-in with mode=corporate preserved
  const handleGoogleSignIn = async () => {
    try {
      setGoogleLoading(true);
      setError(null);
      const origin = typeof window !== "undefined" ? window.location.origin : "https://app.photoos.in";
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${origin}/auth/loading?mode=corporate`,
        },
      });
      if (oauthError) throw oauthError;
    } catch (err: any) {
      setError(err?.message || "Google Sign-In failed. Please try again.");
      setGoogleLoading(false);
    }
  };

  // 1. Submit Email + Password -> Verify credentials format & Dispatch OTP via Resend
  const handleCredentialsSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("Please enter a valid work email address.");
      return;
    }

    if (!password || password.length < 6) {
      setError("Please enter a password with at least 6 characters.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Dispatch real email via PhotoOS Resend API (noreply@photoos.in)
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "send",
          email: cleanEmail,
          purpose: "Corporate Office Portal Access",
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok || !resData?.success) {
        throw new Error(resData?.error || "Failed to deliver verification code to your email.");
      }

      setSentMessage(`A 6-digit verification code has been sent to ${cleanEmail}`);
      setStep("otp");
      setCountdown(Number(resData?.retry_after_seconds) || 60);
    } catch (err: any) {
      setError(err?.message || "Unable to send verification code. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP -> Navigate to Legal Compliance -> Dashboard
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const cleanEmail = email.trim().toLowerCase();
      const cleanOtp = otp.trim();

      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "verify",
          email: cleanEmail,
          otp: cleanOtp,
        }),
      });

      const resData = await res.json().catch(() => null);

      if (!res.ok || !resData?.success) {
        throw new Error(resData?.error || "The verification code entered is incorrect or expired.");
      }

      // Save company session
      const current = await getCorporateCompany();
      const updated = await saveCorporateCompany({
        work_email: cleanEmail,
        name: current.name || cleanEmail.split("@")[1]?.split(".")[0]?.toUpperCase() + " Corp" || "Corporate Office",
      });

      // Flow: Legal compliance is mandatory! Route to unified legal compliance page
      if (!updated.compliance_accepted) {
        router.push("/legal-compliance?mode=corporate");
      } else {
        router.push("/corporate/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to complete verification. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 dark:bg-slate-950 dark:text-slate-100 flex flex-col justify-between selection:bg-[#0A3F61] selection:text-white font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900 px-6 py-4 flex items-center justify-between">
        <Link href="/corporate" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0A3F61] text-white font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-tight text-slate-900 dark:text-white">PhotoOS</span>
            <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:bg-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              Corporate
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Main Card */}
          <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            {/* Header: Strictly "PhotoOS Login" */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 mb-3">
                <Sparkles className="h-3 w-3 text-[#EF8619]" />
                Corporate Office Edition &bull; 7-Day Free Trial
              </div>
              
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                PhotoOS Login
              </h1>
              
              <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
                {step === "credentials"
                  ? "Enter your company work email and password to continue."
                  : `Enter the 6-digit verification code sent to ${email}`}
              </p>
            </div>

            {/* Error Notification */}
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-300">
                {error}
              </div>
            )}

            {/* Success / OTP Sent Alert */}
            {sentMessage && step === "otp" && (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/30 dark:text-emerald-300 space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />
                  <span className="font-semibold">{sentMessage}</span>
                </div>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                  Please check your inbox or spam folder for your 6-digit access code.
                </p>
              </div>
            )}

            {step === "credentials" && (
              <div className="mb-6 space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-slate-300 bg-white py-2.5 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition-all shadow-xs disabled:opacity-50"
                >
                  {googleLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin text-[#0A3F61]" />
                  ) : (
                    <svg className="h-4 w-4" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                  )}
                  <span>Sign in with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="w-full border-t border-slate-200 dark:border-slate-800" />
                  <span className="bg-white px-3 text-[11px] font-medium text-slate-400 dark:bg-slate-900 absolute">
                    or continue with work email
                  </span>
                </div>
              </div>
            )}

            {step === "credentials" ? (
              <form onSubmit={handleCredentialsSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Company Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. hr@company.com or events@office.com"
                      required
                      autoFocus
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                  </div>
                  <div className="relative">
                    <LockKeyhole className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter your corporate password"
                      required
                      minLength={6}
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-10 text-sm text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
                    Includes 7-day complimentary enterprise trial.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Authenticating & Sending OTP...
                    </>
                  ) : (
                    <>
                      Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                    Enter 6-Digit OTP
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      autoFocus
                      required
                      className="w-full rounded-xl border border-slate-300 bg-white py-2.5 pl-10 pr-4 text-center tracking-[0.3em] font-mono text-lg text-slate-900 placeholder-slate-400 dark:border-slate-700 dark:bg-slate-950 dark:text-white focus:border-[#0A3F61] focus:outline-none focus:ring-1 focus:ring-[#0A3F61]"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {countdown > 0 ? `Resend code in ${countdown}s` : "Didn't receive code?"}
                    </span>
                    <button
                      type="button"
                      disabled={countdown > 0 || loading}
                      onClick={() => void handleCredentialsSubmit()}
                      className="text-[#0A3F61] dark:text-sky-400 font-semibold hover:underline disabled:opacity-40"
                    >
                      Resend Code
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] py-3 text-sm font-semibold text-white shadow hover:bg-[#072c44] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify OTP & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("credentials")}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
                >
                  Back to Email & Password
                </button>
              </form>
            )}

            {/* Privacy note */}
            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Enterprise grade security & DPDP 2023 compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
        © {new Date().getFullYear()} PhotoOS &bull; Corporate Office Portal
      </footer>
    </div>
  );
}

export default function CorporateLoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-sm">
            <Loader2 className="h-5 w-5 animate-spin text-[#0A3F61]" />
            <span>Loading PhotoOS Login...</span>
          </div>
        </div>
      }
    >
      <CorporateLoginContent />
    </Suspense>
  );
}
