"use client";

import React, { useState, useRef, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
} from "lucide-react";

export default function OpsConsoleLoginPage() {
  const router = useRouter();

  // Auth steps: 'credentials' | '2fa' | 'success'
  const [step, setStep] = useState<"credentials" | "2fa" | "success">("credentials");

  // Step 1 Form
  const [userId, setUserId] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Step 2 2FA State
  const [challengeId, setChallengeId] = useState("");
  const [maskedEmail, setMaskedEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [resendCooldown, setResendCooldown] = useState(60);

  // Status
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "2fa" && resendCooldown > 0) {
      timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown]);

  // Focus first OTP field when entering 2FA step
  useEffect(() => {
    if (step === "2fa") {
      inputRefs.current[0]?.focus();
    }
  }, [step]);

  // Handle Step 1: Submit Credentials
  const handleCredentialsSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Access denied. Invalid credentials.");
      }

      setChallengeId(data.challenge_id);
      setMaskedEmail(data.masked_email || "your email");
      setStep("2fa");
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Authentication error.");
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input change & auto-advance
  const handleOtpChange = (index: number, value: string) => {
    const cleanVal = value.replace(/\D/g, "");
    if (!cleanVal) {
      const newOtp = [...otp];
      newOtp[index] = "";
      setOtp(newOtp);
      return;
    }

    const char = cleanVal.slice(-1);
    const newOtp = [...otp];
    newOtp[index] = char;
    setOtp(newOtp);

    // Auto-advance
    if (index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  // Handle OTP paste
  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (!paste) return;

    const newOtp = [...otp];
    for (let i = 0; i < paste.length; i++) {
      newOtp[i] = paste[i];
    }
    setOtp(newOtp);

    const nextIndex = Math.min(paste.length, 5);
    inputRefs.current[nextIndex]?.focus();
  };

  // Handle Step 2: Submit 2FA OTP
  const handle2FASubmit = async (e: FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length !== 6) {
      setError("Please enter the complete 6-digit verification code.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ops/verify-2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challengeId, otp: fullOtp }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid 2FA verification code.");
      }

      // Store in sessionStorage for all admin hooks & guards
      sessionStorage.setItem("photoos_platform_admin_session", data.data.session_token);

      setStep("success");

      // Redirect into full ops-console dashboard
      setTimeout(() => {
        router.push("/ops-console/dashboard");
      }, 800);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification error.");
    } finally {
      setLoading(false);
    }
  };

  // Resend 2FA OTP
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/ops/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userId, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Failed to resend code.");
      }

      setChallengeId(data.challenge_id);
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend code.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#070E17] px-4 py-12 text-slate-200">
      {/* Background glow */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-sky-900/15 blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-amber-900/10 blur-3xl" />
      </div>

      <div className="relative w-full max-w-md">
        {/* Security badge top indicator */}
        <div className="mb-6 flex items-center justify-between text-[11px] font-mono tracking-wider text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>SECURE SYSTEM GATEWAY</span>
          </div>
          <span className="rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-slate-400">
            TLS 1.3 // 2FA
          </span>
        </div>

        {/* Card */}
        <div className="overflow-hidden rounded-3xl border border-white/15 bg-gradient-to-b from-slate-900/90 to-slate-950/95 p-7 shadow-2xl backdrop-blur-xl sm:p-9">
          {/* Header */}
          <div className="mb-7 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr from-[#0A3F61] to-[#0d5583] border border-sky-400/30 text-sky-400 shadow-xl shadow-sky-900/20">
              <ShieldCheck className="h-7 w-7 text-sky-300" />
            </div>
            <h1 className="mt-4 text-xl font-extrabold tracking-tight text-white">
              PhotoOS Operations Console
            </h1>
            <p className="mt-1 text-xs text-slate-400">
              Restricted platform infrastructure access
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 rounded-2xl border border-red-500/30 bg-red-950/40 p-3.5 text-xs text-red-200 animate-in fade-in">
              <AlertTriangle className="h-4 w-4 shrink-0 text-red-400 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* =============================================================== */}
          {/* STEP 1: CREDENTIALS (USER ID & MASTER PASSWORD) */}
          {/* =============================================================== */}
          {step === "credentials" && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Administrator ID
                </label>
                <div className="mt-1.5 relative">
                  <Terminal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    required
                    value={userId}
                    onChange={(e) => setUserId(e.target.value)}
                    placeholder="adskartmedia11@gmail.com / ADMIN_FOUNDER"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-4 text-xs font-medium text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-white/10"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Master Password
                </label>
                <div className="mt-1.5 relative">
                  <Lock className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter security key"
                    className="w-full rounded-2xl border border-white/15 bg-white/5 py-3 pl-10 pr-10 text-xs text-white placeholder-slate-500 outline-none transition focus:border-sky-400 focus:bg-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || !userId || !password}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-500 to-blue-600 py-3 text-xs font-bold text-white shadow-lg shadow-sky-950 transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Credentials...</span>
                  </>
                ) : (
                  <>
                    <span>Authorize & Dispatch 2FA Code</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* =============================================================== */}
          {/* STEP 2: TWO-FACTOR AUTH (RESEND EMAIL OTP) */}
          {/* =============================================================== */}
          {step === "2fa" && (
            <form onSubmit={handle2FASubmit} className="space-y-5 animate-in fade-in">
              <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 p-4 text-center">
                <KeyRound className="mx-auto h-6 w-6 text-sky-400" />
                <h3 className="mt-2 text-sm font-bold text-white">Two-Factor Authentication</h3>
                <p className="mt-1 text-xs text-slate-300">
                  Enter the 6-digit code dispatched to <strong className="text-white">{maskedEmail}</strong> via Resend.
                </p>
              </div>

              {/* 6 Digit Inputs */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block text-center mb-2">
                  Authentication Code
                </label>
                <div className="flex justify-center gap-2">
                  {otp.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        inputRefs.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onPaste={handleOtpPaste}
                      onKeyDown={(e) => {
                        if (e.key === "Backspace" && !digit && idx > 0) {
                          inputRefs.current[idx - 1]?.focus();
                        }
                      }}
                      className="h-12 w-12 rounded-xl border border-white/20 bg-white/5 text-center text-lg font-bold text-white outline-none transition focus:border-sky-400 focus:bg-white/10"
                    />
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || otp.join("").length !== 6}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 py-3 text-xs font-bold text-white shadow-lg shadow-emerald-950 transition hover:brightness-110 disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Code...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Verify & Enter Console</span>
                  </>
                )}
              </button>

              <div className="flex items-center justify-between pt-2 text-xs text-slate-400">
                <button
                  type="button"
                  onClick={() => {
                    setStep("credentials");
                    setError("");
                  }}
                  className="hover:text-white"
                >
                  &larr; Back to login
                </button>

                <button
                  type="button"
                  disabled={resendCooldown > 0 || loading}
                  onClick={handleResendOtp}
                  className="flex items-center gap-1 text-sky-400 hover:text-sky-300 disabled:text-slate-600"
                >
                  <RefreshCw className="h-3 w-3" />
                  <span>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : "Resend code"}
                  </span>
                </button>
              </div>
            </form>
          )}

          {/* =============================================================== */}
          {/* STEP 3: SUCCESS REDIRECT */}
          {/* =============================================================== */}
          {step === "success" && (
            <div className="py-8 text-center animate-in zoom-in-95">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h3 className="mt-4 text-base font-bold text-white">Access Authorized</h3>
              <p className="mt-1 text-xs text-slate-400">
                Redirecting to PhotoOS Master Console...
              </p>
            </div>
          )}
        </div>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-slate-600">
          PhotoOS Enterprise Platform &bull; End-to-End Encrypted Session
        </p>
      </div>
    </div>
  );
}
