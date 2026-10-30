"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";

import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";

import Link from "next/link";

import {
  sendPasswordResetEmail,
  signInWithPassword,
} from "@/lib/auth/auth.service";
import { publishableKey, supabaseUrl } from "@/lib/supabase/config";
import { getSafeRedirectUrl } from "@/lib/security/safe-redirect";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  const [error, setError] = useState(() => {
    if (!urlError) return "";
    if (urlError === "authentication_failed") {
      return "Sign in could not be completed. Please try again or enter your email and password below.";
    }
    return decodeURIComponent(urlError);
  });
  const [message, setMessage] = useState("");

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");
    setMessage("");

    try {
      if (!publishableKey || publishableKey.includes("dummy_static_prerender")) {
        throw new Error(
          "Supabase API key is missing. In Vercel (Photoos-web) Settings > Environment Variables, make sure NEXT_PUBLIC_SUPABASE_ANON_KEY is added with Production enabled, then click Redeploy.",
        );
      }

      const data = await signInWithPassword(
        email,
        password,
      );

      if (!data.user || !data.session) {
        throw new Error(
          "Authentication session could not be established.",
        );
      }

      const params = new URLSearchParams();
      const planId = searchParams.get("planId");
      const planCode = searchParams.get("planCode");
      const billingCycle = searchParams.get("billingCycle");
      const mode = searchParams.get("mode");
      const next = searchParams.get("next");

      if (planId) params.set("planId", planId);
      if (planCode) params.set("planCode", planCode);
      if (billingCycle) params.set("billingCycle", billingCycle);
      if (mode) params.set("mode", mode);

      const qs = params.toString();
      const fallbackTarget = qs ? `/auth/loading?${qs}` : "/auth/loading";

      window.location.href = getSafeRedirectUrl(next, fallbackTarget);
    } catch (err) {
      console.error(
        "[SupabaseLogin]",
        err,
      );

      const code =
        typeof err === "object" &&
        err !== null &&
        "code" in err
          ? String(
              (err as { code?: unknown }).code,
            )
          : "";

      if (
        code === "invalid_credentials" ||
        code === "invalid_grant"
      ) {
        setError(
          "The email or password is incorrect.",
        );
      } else if (
        code === "user_banned"
      ) {
        setError(
          "This account has been disabled.",
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : `Unable to continue (${code || "unknown-error"}). Please try again.`,
        );
      }
    } finally {
      setLoading(false);
    }
  }

  async function handleForgotPassword() {
    setError("");
    setMessage("");

    if (!email.trim()) {
      setError(
        "Enter your email address first.",
      );
      return;
    }

    setResetLoading(true);

    try {
      await sendPasswordResetEmail(email);

      setMessage(
        "Password reset instructions have been sent to your email.",
      );
    } catch (err) {
      console.error(
        "[SupabasePasswordReset]",
        err,
      );

      setError(
        "Unable to send password reset email.",
      );
    } finally {
      setResetLoading(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
        >
          Email address
        </label>

        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />

          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            autoFocus
            placeholder="you@example.com"
            value={email}
            onChange={(event) =>
              setEmail(event.target.value)
            }
            className="h-[52px] w-full rounded-2xl border border-border bg-muted/70 pl-11 pr-4 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground hover:border-ring/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-ring/20"
          />
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="text-[12px] font-bold uppercase tracking-[0.08em] text-muted-foreground"
          >
            Password
          </label>

          <button
            type="button"
            onClick={handleForgotPassword}
            disabled={resetLoading}
            className="text-[11px] font-bold text-primary transition hover:underline disabled:opacity-50"
          >
            {resetLoading
              ? "Sending..."
              : "Forgot password?"}
          </button>
        </div>

        <div className="relative">
          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-muted-foreground" />

          <input
            id="password"
            type={
              showPassword
                ? "text"
                : "password"
            }
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            value={password}
            onChange={(event) =>
              setPassword(event.target.value)
            }
            className="h-[52px] w-full rounded-2xl border border-border bg-muted/70 pl-11 pr-12 text-sm font-medium text-foreground outline-none transition placeholder:text-muted-foreground hover:border-ring/60 focus:border-primary focus:bg-card focus:ring-4 focus:ring-ring/20"
          />

          <button
            type="button"
            aria-label={
              showPassword
                ? "Hide password"
                : "Show password"
            }
            onClick={() =>
              setShowPassword(
                (value) => !value,
              )
            }
            className="absolute right-3 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-xl text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-[17px] w-[17px]" />
            ) : (
              <Eye className="h-[17px] w-[17px]" />
            )}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-xs font-medium leading-5 text-red-700">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-xs font-medium leading-5 text-emerald-700">
          {message}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="group flex h-[54px] w-full items-center justify-center gap-2 rounded-2xl bg-primary px-5 text-sm font-black text-white shadow-[0_18px_35px_-15px_rgba(10,63,97,0.55)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 hover:shadow-[0_22px_40px_-15px_rgba(10,63,97,0.6)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-60"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in...
          </>
        ) : (
          <>
            <KeyRound className="h-4 w-4" />
            Sign in to PhotoOS
          </>
        )}
      </button>

      <div className="flex items-center justify-center gap-2 pt-1 text-[11px] font-semibold text-muted-foreground">
        <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
        Secure Supabase authentication
      </div>

      <p className="px-2 text-center text-[10px] leading-5 text-muted-foreground">
        By continuing, you agree to our{" "}
        <Link
          href="/terms"
          className="font-semibold text-slate-500 underline-offset-2 hover:text-primary hover:underline"
        >
          Terms of Service
        </Link>
        ,{" "}
        <Link
          href="/privacy"
          className="font-semibold text-slate-500 underline-offset-2 hover:text-primary hover:underline"
        >
          Privacy Policy
        </Link>
        {" "}and{" "}
        <Link
          href="/platform-agreement"
          className="font-semibold text-slate-500 underline-offset-2 hover:text-primary hover:underline"
        >
          Platform Agreement
        </Link>
        .
      </p>
    </form>
  );
}
