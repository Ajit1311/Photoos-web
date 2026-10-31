"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  ExternalLink,
  Image as ImageIcon,
  Plus,
  QrCode,
  ScanFace,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Upload,
  Users,
} from "lucide-react";
import { CorporateShell } from "@/components/corporate/CorporateShell";
import {
  getCorporateCompany,
  getCorporateEvents,
  type CorporateCompany,
  type CorporateEvent,
} from "@/lib/corporate/corporate-service";

export default function CorporateDashboardPage() {
  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [events, setEvents] = useState<CorporateEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const comp = await getCorporateCompany();
        setCompany(comp);
        const evs = await getCorporateEvents(comp.id);
        setEvents(evs);
      } catch (err) {
        console.error("[CorporateDashboard] Load error:", err);
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const totalPhotos = events.reduce((acc, ev) => acc + (ev.photos_count || 0), 0);
  const totalFaces = events.reduce((acc, ev) => acc + (ev.ai_faces_indexed || 0), 0);

  return (
    <CorporateShell>
      <div className="space-y-8">
        {/* Executive Header Banner - PhotoOS Gradient Style */}
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#061826] via-[#0A3F61] to-[#041522] p-6 sm:p-8 text-white shadow-xl">
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[#3495A1]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full bg-[#EF8619]/15 blur-3xl" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-2.5">
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-md">
                  <Building2 className="h-3.5 w-3.5 text-[#3495A1]" />
                  Corporate Portal
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-sky-200 backdrop-blur-md">
                  <Clock className="h-3.5 w-3.5 text-[#EF8619]" />
                  {company?.subscription?.days_remaining ?? 7} Days Trial Active
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                {company?.name || "Corporate Office Dashboard"}
              </h1>
              <p className="mt-1 text-xs sm:text-sm text-sky-100/80 max-w-xl leading-relaxed">
                Manage your office events, generate reception Standee QRs, and let employees instantly discover their candid photos with AI selfie matching.
              </p>
            </div>

            <div className="relative z-10 flex flex-wrap items-center gap-3">
              <Link
                href="/corporate/standee-qr"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-4 py-2.5 text-xs font-semibold text-white hover:bg-white/20 transition-all backdrop-blur-md shadow-sm"
              >
                <QrCode className="h-4 w-4 text-sky-300" />
                Standee QR Poster
              </Link>

              <Link
                href="/corporate/events/new"
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#EF8619] to-amber-500 hover:from-amber-500 hover:to-[#EF8619] px-5 py-2.5 text-xs font-bold text-slate-950 shadow-lg shadow-orange-500/20 transition-all hover:scale-[1.02]"
              >
                <Plus className="h-4 w-4" />
                Create Corporate Event
              </Link>
            </div>
          </div>
        </div>

        {/* Enterprise Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/80">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Corporate Events</span>
              <div className="h-8 w-8 rounded-lg bg-[#0A3F61]/10 text-[#0A3F61] dark:bg-sky-500/10 dark:text-sky-300 flex items-center justify-center">
                <CalendarDays className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {events.length}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Townhalls & Gatherings
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/80">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Event Photos</span>
              <div className="h-8 w-8 rounded-lg bg-[#3495A1]/10 text-[#3495A1] dark:bg-teal-500/10 dark:text-teal-300 flex items-center justify-center">
                <ImageIcon className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalPhotos.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              High-resolution media
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/80">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">AI Faces Indexed</span>
              <div className="h-8 w-8 rounded-lg bg-[#EF8619]/10 text-[#EF8619] dark:bg-amber-500/10 dark:text-amber-300 flex items-center justify-center">
                <ScanFace className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              {totalFaces.toLocaleString()}
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              Indexed for selfie match
            </p>
          </div>

          <div className="relative overflow-hidden rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm hover:shadow-md transition-all dark:border-slate-800 dark:bg-slate-900/80">
            <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]" />
            <div className="flex items-center justify-between text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Employee Privacy</span>
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <ShieldCheck className="h-4 w-4" />
              </div>
            </div>
            <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              100%
            </p>
            <p className="mt-1 text-[11px] text-slate-400">
              DPDP Act 2023 Compliant
            </p>
          </div>
        </div>

        {/* Corporate Events List */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Company Events & Live Galleries
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click any event to upload photos, manage media, view AI face indexing, or download standee posters.
              </p>
            </div>
            <Link
              href="/corporate/events/new"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Event
            </Link>
          </div>

          {events.length === 0 ? (
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 text-[#0A3F61] dark:bg-slate-800 dark:text-sky-400 mb-4">
                <CalendarDays className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                No Corporate Events Created Yet
              </h3>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
                Host your upcoming townhall, annual awards, offsite, or celebration. Upload photos and generate your reception Standee QR.
              </p>
              <div className="mt-5">
                <Link
                  href="/corporate/events/new"
                  className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-2.5 text-xs font-bold text-white shadow hover:bg-[#072c44] transition-all"
                >
                  <Plus className="h-4 w-4" />
                  Create First Corporate Event
                </Link>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <Link
                    href={`/corporate/events/${ev.id}`}
                    className="flex items-start sm:items-center gap-4 group flex-1"
                  >
                    <div className="h-16 w-20 rounded-xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 relative border border-slate-200 dark:border-slate-700">
                      {ev.cover_image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={ev.cover_image_url}
                          alt={ev.name}
                          className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-slate-400">
                          <CalendarDays className="h-6 w-6" />
                        </div>
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-md border border-slate-200/80 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-300">
                          {ev.event_type}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {ev.date}
                        </span>
                      </div>
                      <h3 className="mt-1 text-sm font-semibold text-slate-900 dark:text-white group-hover:text-[#0A3F61] dark:group-hover:text-slate-200 transition-colors">
                        {ev.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        📍 {ev.location} · {ev.photos_count} photos · {ev.ai_faces_indexed} AI faces
                      </p>
                    </div>
                  </Link>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <Link
                      href={`/corporate/events/${ev.id}`}
                      className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-[#0A3F61] to-[#0d5583] hover:from-[#0d5583] hover:to-[#0A3F61] px-3.5 py-1.5 text-xs font-semibold text-white shadow-xs transition-all"
                    >
                      <Upload className="h-3.5 w-3.5" />
                      Manage & Upload
                    </Link>

                    <Link
                      href={`/corporate/events/${ev.id}?tab=qrcode`}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 shadow-xs transition-colors"
                    >
                      <QrCode className="h-3.5 w-3.5 text-slate-500" />
                      Standee QR
                    </Link>

                    <Link
                      href={`/gallery/${ev.id}/access`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800/80 dark:text-slate-300 shadow-xs transition-colors"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-slate-500" />
                      Live View
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3-Step Guide for Office Reception / HR */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center gap-2 text-[#0A3F61] dark:text-sky-400 mb-3">
            <Sparkles className="h-4 w-4" />
            <h3 className="text-sm font-bold uppercase tracking-wider">
              How PhotoOS Works For Your Office Events
            </h3>
          </div>
          <div className="grid sm:grid-cols-3 gap-4 text-xs text-slate-600 dark:text-slate-400">
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-[#0A3F61] dark:text-sky-400">Step 1: Upload Photos</span>
              <p className="mt-1">
                Upload your photographer's DSLR captures or phone albums after the event. AI automatically indexes every face.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-[#0A3F61] dark:text-sky-400">Step 2: Print Standee QR</span>
              <p className="mt-1">
                Download your high-res office standee poster with company branding and place it in the office cafeteria or reception.
              </p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">Step 3: Instant Employee Delivery</span>
              <p className="mt-1">
                Employees scan QR, take a selfie, and get all their event moments in 3 seconds directly on their smartphone.
              </p>
            </div>
          </div>
        </div>
      </div>
    </CorporateShell>
  );
}

