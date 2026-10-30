"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  KeyRound,
  Loader2,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCorporateCompany, saveCorporateCompany } from "@/lib/corporate/corporate-service";

export default function CorporateLoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") || "trial";

  const [email, setEmail] = useState("");
  const [step, setStep] = useState<"email" | "otp">("email");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentMessage, setSentMessage] = useState<string | null>(null);

  // 1. Request OTP
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      setError("Please enter a valid corporate work email.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Simulate/trigger OTP dispatch
      await new Promise((res) => setTimeout(res, 800));
      setSentMessage(`Verification code sent to ${email}`);
      setStep("otp");
    } catch {
      setError("Unable to send verification code. Please retry.");
    } finally {
      setLoading(false);
    }
  };

  // 2. Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await new Promise((res) => setTimeout(res, 900));

      // Save/bind company session
      const current = await getCorporateCompany();
      const updated = await saveCorporateCompany({
        work_email: email,
        name: current.name || email.split("@")[1]?.split(".")[0]?.toUpperCase() + " Corp" || "Enterprise Corp",
      });

      // If legal compliance not accepted or fresh user, go to onboarding
      if (!updated.compliance_accepted) {
        router.push("/corporate/onboarding");
      } else {
        router.push("/corporate/dashboard");
      }
    } catch {
      setError("Invalid or expired verification code. Please recheck.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-sky-500 selection:text-white">
      {/* Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur px-6 py-4 flex items-center justify-between">
        <Link href="/corporate" className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 text-white font-bold">
            <Building2 className="h-5 w-5" />
          </div>
          <div>
            <span className="font-bold tracking-tight text-white">PhotoOS</span>
            <span className="ml-2 rounded bg-sky-500/20 px-1.5 py-0.5 text-[10px] font-bold uppercase text-sky-400">
              Corporate Portal
            </span>
          </div>
        </Link>
        <ThemeToggle />
      </header>

      {/* Main Form Center */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-8 shadow-2xl backdrop-blur">
            <div className="text-center mb-6">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-300 mb-3">
                <Sparkles className="h-3 w-3 text-sky-400" />
                7-Day Free Enterprise Trial
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {step === "email" ? "Corporate Work Login" : "Enter Verification Code"}
              </h1>
              <p className="mt-1.5 text-xs text-slate-400">
                {step === "email"
                  ? "Enter your company work email to access your corporate events portal."
                  : `We sent a 6-digit one-time code to ${email}`}
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-xs text-red-300">
                {error}
              </div>
            )}

            {sentMessage && step === "otp" && (
              <div className="mb-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                <span>{sentMessage}</span>
              </div>
            )}

            {step === "email" ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Company Work Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="e.g. hr@company.com or events@office.com"
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500">
                    Use your corporate email. No credit card required.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 py-3 text-sm font-semibold text-white shadow-lg hover:from-sky-400 hover:to-indigo-500 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending Verification Code...
                    </>
                  ) : (
                    <>
                      Continue with OTP
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    One-Time Password (OTP)
                  </label>
                  <div className="relative">
                    <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="text"
                      maxLength={6}
                      value={otp}
                      onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                      placeholder="123456"
                      autoFocus
                      required
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 py-2.5 pl-10 pr-4 text-center tracking-[0.3em] font-mono text-lg text-white placeholder-slate-600 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                    />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Didn't receive code?</span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sky-400 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 rounded-xl bg-sky-500 py-3 text-sm font-bold text-slate-950 shadow-lg hover:bg-sky-400 transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      Verify & Continue
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => setStep("email")}
                  className="w-full text-center text-xs text-slate-500 hover:text-slate-300"
                >
                  Change Email Address
                </button>
              </form>
            )}

            {/* Privacy note */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <div className="inline-flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
                <span>Enterprise grade security & DPDP compliance</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-600">
        © {new Date().getFullYear()} PhotoOS Corporate Portal · All rights reserved.
      </footer>
    </div>
  );
}
