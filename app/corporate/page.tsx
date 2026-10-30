"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  CalendarDays,
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

export default function CorporatePresentationPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 dark:bg-slate-950 dark:text-slate-100 font-sans selection:bg-[#0A3F61] selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61] text-white shadow-sm font-bold">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                    PhotoOS
                  </span>
                  <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-[#0A3F61] dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                    For Corporate
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Enterprise Workplace & Internal Events
                </p>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Link
              href="/corporate/login"
              className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/corporate/login?mode=trial"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm hover:bg-[#072c44] transition-all"
            >
              Start Corporate Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section - Clean Minimalist White */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-200 dark:border-slate-800 bg-gradient-to-b from-slate-50/80 to-white dark:from-slate-900/60 dark:to-slate-950">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#EF8619]" />
            Enterprise Edition · 7-Day Complimentary Trial
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            Instant AI Face Matching For{" "}
            <span className="text-[#0A3F61] dark:text-sky-400">
              Corporate Office Events
            </span>
          </h1>

          <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Eliminate bulky Google Drive links and endless photographer emails. Give your employees an instant, delightful photo experience: Scan the reception standee QR, snap a 2-second selfie, and receive candid event photos in seconds.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/corporate/login?mode=trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-7 py-3.5 text-sm font-bold text-white shadow-md hover:bg-[#072c44] transition-all"
            >
              Start Corporate Free Trial (7 Days)
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/corporate/dashboard"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              View Corporate Portal Demo
            </Link>
          </div>

          <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
            ✓ 7-Day Free Trial &bull; No Credit Card Required &bull; DPDP Act 2023 Compliant
          </p>

          {/* Quick Stats / Highlights Bar */}
          <div className="mt-14 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto text-left">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ScanFace className="h-5 w-5 text-[#3495A1] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Face Match</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">99.2% accuracy selfie detection</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <QrCode className="h-5 w-5 text-[#0A3F61] dark:text-sky-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Standee QR</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Printable posters for reception</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <Clock className="h-5 w-5 text-[#EF8619] mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">7-Day Free Trial</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Full enterprise features included</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <ShieldCheck className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mb-2" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">DPDP Act 2023</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Enterprise biometric privacy</p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Corporate Offices Need PhotoOS */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="rounded bg-sky-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-[#0A3F61] dark:bg-sky-950 dark:text-sky-300">
              Built for Modern HR, Admin & Culture Teams
            </span>
            <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              The Smarter Way to Share Corporate Event Memories
            </h2>
            <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400">
              Whether you are hosting an Annual Day, Leadership Townhall, Offsite, or Diwali Celebration, PhotoOS delivers every employee their personal photos automatically.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 items-center">
            {/* The Old Way vs The PhotoOS Way */}
            <div className="rounded-2xl border border-red-200 bg-red-50/50 p-6 sm:p-8 dark:border-red-950 dark:bg-red-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-red-600 dark:text-red-400">
                The Traditional Hassle
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                Google Drive & Manual Searching
              </h3>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Photographer delivers 4,000 raw unorganized photos in a 25 GB folder.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>HR emails a massive link to 500+ employees; most never bother downloading it.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Employees waste hours scrolling to find 2 photos where they appeared.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 font-bold shrink-0">✕</span>
                  <span>Zero employee engagement metrics or photo download tracking.</span>
                </li>
              </ul>
            </div>

            <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 sm:p-8 dark:border-emerald-950 dark:bg-emerald-950/20">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                The PhotoOS Enterprise Way
              </span>
              <h3 className="mt-2 text-xl font-bold text-slate-900 dark:text-white">
                AI Face Matching & Standee QR
              </h3>
              <ul className="mt-4 space-y-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Upload event photos once; AI indexes every employee face in the background.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Print a branded Standee QR for the office reception or event registration desk.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>Employees scan QR, take a 2-second selfie, and get their photos in 3 seconds.</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                  <span>100% DPDP Act 2023 compliant: encrypted biometric vectors, strict data ownership.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Step Workflow */}
      <section className="py-20 bg-slate-50 dark:bg-slate-900/60 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              How PhotoOS Works in 3 Simple Steps
            </h2>
            <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              No software download required for employees. Works instantly on any modern smartphone browser.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-[#0A3F61] border border-sky-200 dark:border-slate-700 dark:bg-slate-800 dark:text-sky-300 mb-4 font-bold text-lg">
                1
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Create Event & Upload</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Add your corporate event (Annual Day, Townhall, Offsite) and upload photos in bulk. PhotoOS automatically indexes face embeddings.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 dark:border-slate-700 dark:bg-slate-800 dark:text-indigo-300 mb-4 font-bold text-lg">
                2
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Download Standee QR</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generate a ready-to-print standee poster with your company logo and event title. Place it at the entrance or cafeterias.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 dark:border-slate-700 dark:bg-slate-800 dark:text-emerald-300 mb-4 font-bold text-lg">
                3
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Employees Find Their Photos</h3>
              <p className="mt-2 text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Employees scan QR, take a selfie, and instantly receive their personal gallery to download, celebrate, and post on LinkedIn.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Security Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-8 sm:p-12 dark:border-slate-800 dark:bg-slate-900 shadow-sm">
            <div className="flex items-center gap-2 mb-3">
              <ShieldCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                Enterprise Data Protection
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
              Strict DPDP Act 2023 & Biometric Privacy Standards
            </h2>

            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              We understand corporate compliance. PhotoOS never sells, trains third-party public models, or retains employee biometric descriptors beyond your corporate event lifecycle.
            </p>

            <div className="mt-8 grid sm:grid-cols-3 gap-6 text-xs text-slate-700 dark:text-slate-300">
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white font-bold">100% Data Ownership</strong>
                <p className="text-slate-500 dark:text-slate-400">Your organization owns all uploaded media and intellectual property.</p>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white font-bold">End-to-End Encryption</strong>
                <p className="text-slate-500 dark:text-slate-400">All data in transit and at rest encrypted with AES-256 standard.</p>
              </div>
              <div className="space-y-1">
                <strong className="block text-slate-900 dark:text-white font-bold">Right to Erasure</strong>
                <p className="text-slate-500 dark:text-slate-400">Employees can request instant selfie descriptor purge at any time.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final Call to Action */}
      <section className="py-20 bg-gradient-to-b from-white to-slate-100 dark:from-slate-950 dark:to-slate-900 border-t border-slate-200 dark:border-slate-800 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Ready to upgrade your next Corporate Event?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Get started in 2 minutes. Start your 7-day complimentary enterprise trial with full access.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/corporate/login?mode=trial"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-8 py-3.5 text-base font-bold text-white shadow-md hover:bg-[#072c44] transition-all"
            >
              Start Corporate Free Trial
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
            For dedicated custom enterprise integrations, contact{" "}
            <a href="mailto:team@photoos.in" className="text-[#0A3F61] dark:text-sky-400 font-semibold underline">
              team@photoos.in
            </a>
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-950 text-center text-xs text-slate-500 dark:text-slate-400">
        © {new Date().getFullYear()} PhotoOS &bull; Engineered for Professional Studios & Corporate Offices
      </footer>
    </div>
  );
}
