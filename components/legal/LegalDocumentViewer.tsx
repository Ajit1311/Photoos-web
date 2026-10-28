"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ShieldCheck, 
  ArrowLeft, 
  Globe, 
  Printer, 
  FileText, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  ChevronRight,
  ExternalLink
} from "lucide-react";
import { LEGAL_CONFIG } from "@/config/legal";
import { LEGAL_METADATA, LegalDocumentType, LegalLanguage } from "@/lib/legal/documents";

interface LegalDocumentViewerProps {
  documentType: LegalDocumentType;
  contentEn: string;
  contentMr: string;
}

export function LegalDocumentViewer({
  documentType,
  contentEn,
  contentMr,
}: LegalDocumentViewerProps) {
  const [lang, setLang] = useState<LegalLanguage>("en");
  const meta = LEGAL_METADATA[documentType];

  const title = lang === "en" ? meta.titleEn : meta.titleMr;
  const summaryBullets = lang === "en" ? meta.summaryEn : meta.summaryMr;
  const content = lang === "en" ? contentEn : contentMr;

  function handlePrint() {
    if (typeof window !== "undefined") {
      window.print();
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 antialiased selection:bg-[#3495a1] selection:text-white print:bg-white print:text-black">
      {/* Top Navigation Bar - Hidden on print */}
      <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-medium text-slate-400 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to PhotoOS</span>
          </Link>

          <div className="flex items-center gap-3">
            {/* Language Switcher */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/80 p-1">
              <button
                type="button"
                onClick={() => setLang("en")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  lang === "en"
                    ? "bg-[#0a3f61] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Globe className="h-3.5 w-3.5" />
                English
              </button>
              <button
                type="button"
                onClick={() => setLang("mr")}
                className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  lang === "mr"
                    ? "bg-[#0a3f61] text-white shadow-sm"
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                मराठी
              </button>
            </div>

            {/* Print Button */}
            <button
              type="button"
              onClick={handlePrint}
              aria-label="Print Document"
              className="hidden items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white sm:flex"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:py-12">
        {/* Document Header */}
        <div className="space-y-4 border-b border-slate-800 pb-8">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-sky-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Official Legal Document
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs font-medium text-slate-400">
              <Clock className="h-3.5 w-3.5" />
              Version {LEGAL_CONFIG.version}
            </span>
          </div>

          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl lg:text-5xl">
            {title}
          </h1>

          <p className="text-sm font-medium text-sky-400">
            Version {LEGAL_CONFIG.version} | Effective from {LEGAL_CONFIG.effectiveDateFormattedEn} / प्रभावी दिनांक: {LEGAL_CONFIG.effectiveDateFormattedMr}
          </p>

          <p className="text-xs text-slate-400">
            Last Updated: {lang === "en" ? LEGAL_CONFIG.lastUpdatedEn : LEGAL_CONFIG.lastUpdatedMr}
          </p>

          {/* Language Conflict Rule */}
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 p-3.5 text-xs leading-relaxed text-amber-300/90">
            <strong>Language Notice / भाषेबाबत सूचना:</strong>{" "}
            {LEGAL_CONFIG.conflictNoticeEn} / {LEGAL_CONFIG.conflictNoticeMr}
          </div>
        </div>

        {/* Short Summary Box ("In Short / थोडक्यात") */}
        <section className="mt-8 rounded-2xl border border-sky-500/25 bg-gradient-to-br from-sky-950/20 to-slate-900/60 p-6 shadow-sm backdrop-blur-sm">
          <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-sky-300">
            <FileText className="h-4 w-4" />
            <span>{lang === "en" ? "In Short (Plain Language Summary)" : "थोडक्यात (ठळक मुद्दे)"}</span>
          </div>

          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-slate-300">
            {summaryBullets.map((bullet, idx) => (
              <li key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
                <span>{bullet}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Legal Body Content */}
        <article className="prose prose-invert mt-10 max-w-none space-y-6 text-sm leading-relaxed text-slate-300 sm:text-base print:text-black">
          <div className="whitespace-pre-line font-sans">
            {content}
          </div>
        </article>

        {/* Statutory Grievance & DPO Callout Card */}
        <section className="mt-12 rounded-2xl border border-slate-800 bg-slate-900/70 p-6 text-xs text-slate-300 sm:text-sm">
          <h3 className="text-base font-bold text-white">
            {lang === "en" ? "Statutory Grievance Redressal & DPO Contact" : "वैधानिक तक्रार निवारण अधिकारी व संपर्क"}
          </h3>
          <p className="mt-1 text-slate-400">
            {lang === "en"
              ? "Designated under IT Intermediary Rules 2021 & Section 13/8 of the Digital Personal Data Protection Act, 2023:"
              : "माहिती तंत्रज्ञान नियम २०२१ आणि DPDP कायदा २०२३ कलम १३ नुसार अधिकृत तक्रार निवारण अधिकारी:"}
          </p>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <span className="font-semibold text-slate-200">Grievance Officer:</span>
              <p className="mt-1 text-slate-400">{LEGAL_CONFIG.grievanceOfficerName}</p>
              <p className="text-slate-400">{LEGAL_CONFIG.grievanceOfficerDesignation}</p>
              <p className="mt-1 text-sky-400">{LEGAL_CONFIG.grievanceOfficerEmail}</p>
            </div>
            <div className="rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5">
              <span className="font-semibold text-slate-200">Statutory Timelines:</span>
              <p className="mt-1 text-slate-400">Acknowledgement: Within {LEGAL_CONFIG.grievanceAckHours} hours</p>
              <p className="text-slate-400">Resolution: Within {LEGAL_CONFIG.grievanceResolutionDays} days</p>
              <p className="mt-1 text-slate-400">Appeal: Data Protection Board of India (DPBI)</p>
            </div>
          </div>
        </section>

        {/* Bottom Changelog */}
        <section className="mt-8 border-t border-slate-800/80 pt-6 text-xs text-slate-400">
          <h4 className="font-semibold text-slate-300">
            {lang === "en" ? "Document History & Changelog" : "दस्तऐवज इतिहास आणि आवृत्ती नोंद"}
          </h4>
          <div className="mt-2 space-y-2">
            {LEGAL_CONFIG.changelog.map((entry, idx) => (
              <div key={idx} className="rounded-xl border border-slate-900 bg-slate-900/30 p-3">
                <span className="font-bold text-slate-200">v{entry.version} ({entry.date}):</span>{" "}
                {lang === "en" ? entry.summaryEn : entry.summaryMr}
              </div>
            ))}
          </div>
        </section>

        {/* Related Documents Navigation - Hidden on print */}
        <nav aria-label="Legal documents" className="mt-12 flex flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-900/40 p-5 sm:flex-row sm:items-center sm:justify-between print:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            {lang === "en" ? "Explore Related Legal Documents:" : "इतर कायदेशीर दस्तऐवज:"}
          </span>
          <div className="flex flex-wrap items-center gap-3">
            {documentType !== "terms_of_service" && (
              <Link
                href="/terms"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition hover:underline"
              >
                <span>Terms of Service</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
            {documentType !== "privacy_policy" && (
              <Link
                href="/privacy"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition hover:underline"
              >
                <span>Privacy Policy</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
            {documentType !== "platform_agreement" && (
              <Link
                href="/platform-agreement"
                className="inline-flex items-center gap-1 text-xs font-medium text-sky-400 transition hover:underline"
              >
                <span>Platform Agreement</span>
                <ChevronRight className="h-3 w-3" />
              </Link>
            )}
          </div>
        </nav>
      </main>
    </div>
  );
}
