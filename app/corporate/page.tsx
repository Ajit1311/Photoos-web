"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Clock,
  Download,
  Lock,
  QrCode,
  ScanFace,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { getCorporateCompany, type CorporateCompany } from "@/lib/corporate/corporate-service";

export default function CorporateLandingPage() {
  const [company, setCompany] = useState<CorporateCompany | null>(null);

  useEffect(() => {
    void getCorporateCompany().then(setCompany);
  }, []);

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-sky-500 selection:text-white">
      {/* Top Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-blue-600 shadow-lg shadow-sky-500/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight">PhotoOS</span>
                <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-400 border border-sky-500/30">
                  Corporate
                </span>
              </div>
              <p className="text-[11px] text-slate-400">For Enterprise Offices & Internal Events</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/corporate/login"
              className="text-sm font-medium text-slate-300 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/corporate/login?mode=trial"
              className="inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-sky-500 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md hover:from-sky-400 hover:to-indigo-500 transition-all"
            >
              Start 7-Day Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-24 lg:pt-28 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/30 via-slate-900/0 to-slate-900/0" />
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-sky-500/30 bg-sky-500/10 px-4 py-1.5 text-xs font-semibold text-sky-300 backdrop-blur mb-8">
            <Sparkles className="h-3.5 w-3.5 text-sky-400" />
            Enterprise Edition · 7-Day Complimentary Trial
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-tight">
            Instant AI Face Matching For{" "}
            <span className="bg-gradient-to-r from-sky-400 via-indigo-300 to-blue-400 bg-clip-text text-transparent">
              Corporate Office Events
            </span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto">
            Host Townhalls, Annual Days, Offsites, and Celebrations. Employees scan the event standee QR, snap a quick selfie, and get their personal event photos in 3 seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/corporate/login?mode=trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-sky-500/25 hover:bg-sky-400 transition-all"
            >
              Start Corporate Free Trial (7 Days)
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/corporate/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-800/80 px-8 py-3.5 text-base font-semibold text-white hover:bg-slate-700 transition-all backdrop-blur"
            >
              View Live Demo Dashboard
            </Link>
          </div>

          {/* Value Badges */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto text-left">
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <ScanFace className="h-6 w-6 text-sky-400 mb-2" />
              <h2 className="text-sm font-bold text-white">AI Face Match</h2>
              <p className="text-xs text-slate-400 mt-1">99.2% precision face indexing</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <QrCode className="h-6 w-6 text-indigo-400 mb-2" />
              <h2 className="text-sm font-bold text-white">Standee QR</h2>
              <p className="text-xs text-slate-400 mt-1">Ready-to-print office standees</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <Clock className="h-6 w-6 text-emerald-400 mb-2" />
              <h2 className="text-sm font-bold text-white">7-Day Free Trial</h2>
              <p className="text-xs text-slate-400 mt-1">Full enterprise features included</p>
            </div>
            <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-4">
              <ShieldCheck className="h-6 w-6 text-purple-400 mb-2" />
              <h2 className="text-sm font-bold text-white">DPDP 2023 Ready</h2>
              <p className="text-xs text-slate-400 mt-1">Strict employee privacy controls</p>
            </div>
          </div>
        </div>
      </section>

      {/* How it works for Corporate HR / Admin */}
      <section className="py-20 bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-white">
              Designed specifically for Workplace People & Culture Teams
            </h2>
            <p className="mt-3 text-slate-400 text-sm">
              Replace messy Google Drive folders and endless requests to the event photographer.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-lg font-bold text-white">Create Event & Upload</h3>
              <p className="mt-2 text-sm text-slate-400">
                Create your corporate gathering (Townhall, Annual Day, Offsite) and upload event photos in bulk. AI runs in background and maps every face.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-lg font-bold text-white">Download Standee QR</h3>
              <p className="mt-2 text-sm text-slate-400">
                Generate a branded standee poster with your company logo and event title. Place it at the reception or event registration desk.
              </p>
            </div>

            <div className="relative rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-lg font-bold text-white">Employees Get Their Photos</h3>
              <p className="mt-2 text-sm text-slate-400">
                Employees scan the QR on their smartphone, take a 2-second selfie, and their candid photos appear immediately to download and share.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 border-t border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-2xl sm:text-3xl font-bold text-white">
            Transform Your Corporate Event Experience Today
          </h2>
          <p className="mt-3 text-slate-400 text-sm">
            Setup takes less than 2 minutes. Start your 7-day free trial with zero upfront credit card.
          </p>
          <div className="mt-8 flex justify-center">
            <Link
              href="/corporate/login?mode=trial"
              className="inline-flex items-center gap-2 rounded-xl bg-sky-500 px-8 py-3.5 text-base font-bold text-slate-950 shadow-xl shadow-sky-500/20 hover:bg-sky-400 transition-all"
            >
              Get Started with 7-Day Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
