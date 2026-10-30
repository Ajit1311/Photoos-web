"use client";

import { Suspense, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Building2,
  Camera,
  CheckCircle2,
  QrCode,
  ScanFace,
  Sparkles,
} from "lucide-react";
import { LoginForm } from "@/components/auth/LoginForm";
import { OAuthButtons } from "@/components/auth/oauth/OAuthButtons";
import { AuthDivider } from "@/components/auth/AuthDivider";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import Link from "next/link";
import Image from "next/image";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const isCorporate = searchParams.get("mode") === "corporate";

  const handleToggleMode = (mode: "studio" | "corporate") => {
    const p = new URLSearchParams(searchParams.toString());
    if (mode === "corporate") {
      p.set("mode", "corporate");
    } else {
      p.delete("mode");
    }
    const qs = p.toString();
    router.replace(`/login${qs ? `?${qs}` : ""}`);
  };

  return (
    <main className="min-h-screen bg-[#f7fafc] dark:bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.08fr_0.92fr]">

        {/* =====================================================
            LEFT — PHOTOOS VISUAL BRANDING
        ===================================================== */}
        <section className="relative hidden overflow-hidden bg-[#0A3F61] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,149,161,0.45),transparent_32%),radial-gradient(circle_at_85%_75%,rgba(239,134,25,0.28),transparent_30%)]" />

          <div className="absolute -left-32 top-1/4 h-80 w-80 rounded-full bg-[#3495A1]/20 blur-3xl" />
          <div className="absolute -right-24 bottom-10 h-96 w-96 rounded-full bg-[#EF8619]/15 blur-3xl" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-wide text-white/80 backdrop-blur-md">
                <Sparkles className="h-3.5 w-3.5 text-[#EF8619]" />
                {isCorporate
                  ? "Corporate Office Event Operating System"
                  : "Photography Business Operating System"}
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl">
              {/* Main visual card */}
              <div className="relative aspect-[4/4.4] overflow-hidden rounded-[42px] border border-white/15 bg-white/[0.07] shadow-2xl backdrop-blur-xl">
                <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(255,255,255,0.12),transparent_45%,rgba(52,149,161,0.10))]" />

                {/* Composition */}
                <div className="absolute left-[12%] top-[14%] h-[58%] w-[76%] rotate-[-5deg] rounded-[30px] border border-white/20 bg-gradient-to-br from-[#3495A1]/40 via-[#0A3F61]/70 to-[#071f31] shadow-2xl">
                  <div className="absolute inset-5 rounded-[24px] border border-white/10 bg-[#0A3F61]/60" />

                  <div className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center">
                    <div className="flex h-28 w-28 items-center justify-center rounded-[32px] border border-white/20 bg-white/10 shadow-2xl backdrop-blur-md">
                      {isCorporate ? (
                        <Building2 className="h-14 w-14 text-white" strokeWidth={1.35} />
                      ) : (
                        <Camera className="h-14 w-14 text-white" strokeWidth={1.35} />
                      )}
                    </div>

                    <div className="mt-5 h-2 w-28 rounded-full bg-white/20" />
                    <div className="mt-2 h-2 w-20 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Floating cards */}
                <div className="absolute bottom-[13%] left-[9%] w-44 rounded-2xl border border-white/15 bg-white/10 p-3 shadow-xl backdrop-blur-xl">
                  <div className="h-24 rounded-xl bg-gradient-to-br from-[#EF8619]/70 via-[#3495A1]/50 to-[#0A3F61] flex items-center justify-center text-white">
                    {isCorporate ? <QrCode className="h-8 w-8" /> : <ScanFace className="h-8 w-8" />}
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <div>
                      <div className="h-2 w-16 rounded-full bg-white/40" />
                      <div className="mt-2 h-1.5 w-10 rounded-full bg-white/20" />
                    </div>
                    <CheckCircle2 className="h-5 w-5 text-[#EF8619]" />
                  </div>
                </div>

                <div className="absolute right-[8%] top-[12%] rounded-2xl border border-white/15 bg-white/10 px-4 py-3 shadow-xl backdrop-blur-xl">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">
                    {isCorporate ? "Enterprise QR" : "Smart workflow"}
                  </p>
                  <p className="mt-1 text-sm font-bold text-white">
                    {isCorporate ? "Scan QR → Selfie → Photos" : "Capture → Manage → Deliver"}
                  </p>
                </div>
              </div>

              <div className="mt-8 max-w-lg">
                <h1 className="text-4xl font-black tracking-[-0.045em] text-white xl:text-5xl">
                  {isCorporate ? (
                    <>
                      Office events & photos,
                      <span className="block text-[#EF8619]">
                        seamlessly delivered.
                      </span>
                    </>
                  ) : (
                    <>
                      Your photography business,
                      <span className="block text-[#EF8619]">
                        beautifully organized.
                      </span>
                    </>
                  )}
                </h1>

                <p className="mt-5 max-w-md text-base leading-7 text-white/60">
                  {isCorporate
                    ? "Generate reception Standee QRs for townhalls, offsites, and celebrations. Employees find their candid photos in seconds with AI selfie matching."
                    : "Manage studios, events, clients, galleries and AI-powered workflows from one powerful PhotoOS workspace."}
                </p>
              </div>
            </div>

            <p className="text-xs font-medium text-white/35">
              {isCorporate
                ? "Enterprise Edition • Trusted by leading corporate companies across India."
                : "Built for modern photographers and studios."}
            </p>
          </div>
        </section>

        {/* =====================================================
            RIGHT — LOGIN CARD
        ===================================================== */}
        <section className="relative flex min-h-screen items-center justify-center px-6 py-10 sm:px-10 lg:px-12 xl:px-20 bg-background text-foreground">
          <div className="absolute right-6 top-6 flex items-center gap-3">
            <ThemeToggle />
          </div>

          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="flex justify-center">
              <Image
                src="/photoos-login-logo.png"
                alt="PhotoOS"
                width={205}
                height={52}
                priority
                className="h-auto w-[205px] object-contain"
              />
            </div>

            {/* Studio / Corporate Unified Mode Switcher */}
            <div className="mt-6 flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
              <button
                type="button"
                onClick={() => handleToggleMode("studio")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                  !isCorporate
                    ? "bg-white text-[#0A3F61] shadow-xs dark:bg-slate-900 dark:text-white"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Camera className="h-3.5 w-3.5" />
                Photography Studio
              </button>

              <button
                type="button"
                onClick={() => handleToggleMode("corporate")}
                className={`flex-1 flex items-center justify-center gap-2 rounded-lg py-2.5 text-xs font-bold transition-all ${
                  isCorporate
                    ? "bg-[#0A3F61] text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
                }`}
              >
                <Building2 className="h-3.5 w-3.5" />
                Corporate Office
              </button>
            </div>

            {/* Heading */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card/80 px-3 py-0.5 text-xs font-semibold text-foreground mb-2">
                <Sparkles className="h-3 w-3 text-[#EF8619]" />
                {isCorporate
                  ? "Corporate Office Edition • 7-Day Free Trial"
                  : "Studio Edition • 7-Day Free Trial"}
              </div>

              <h2 className="text-[28px] font-black tracking-[-0.045em] text-foreground">
                {isCorporate ? "Corporate Office Login" : "Welcome back"}
              </h2>

              <p className="mt-1.5 text-xs sm:text-sm text-muted-foreground">
                {isCorporate
                  ? "Sign in to manage company events, reception Standee QRs, and employee face matching"
                  : "Sign in to continue to PhotoOS Studio Workspace"}
              </p>
            </div>

            {/* Google OAuth Button */}
            <div className="mt-6">
              <OAuthButtons />
            </div>

            {/* Divider */}
            <div className="my-5">
              <AuthDivider />
            </div>

            {/* Email / Password Form */}
            <LoginForm />

            {/* Copyright & Legal Links */}
            <div className="mt-8 border-t border-border/80 pt-6 text-center space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground">
                <Link href="/privacy" className="hover:text-foreground transition underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                <span>&bull;</span>
                <Link href="/terms" className="hover:text-foreground transition underline-offset-4 hover:underline">
                  Terms of Service
                </Link>
                <span>&bull;</span>
                <Link href="/platform-agreement" className="hover:text-foreground transition underline-offset-4 hover:underline">
                  Platform Agreement
                </Link>
                <span>&bull;</span>
                <Link href="/pricing" className="hover:text-foreground transition underline-offset-4 hover:underline">
                  Pricing
                </Link>
              </div>

              <p className="text-[11px] font-medium text-muted-foreground/80">
                &copy; {new Date().getFullYear()} PhotoOS &bull; Engineered for Studios & Corporate Offices &bull; India
              </p>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center bg-[#f7fafc]">
          <div className="text-sm text-muted-foreground">
            Loading PhotoOS...
          </div>
        </main>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
