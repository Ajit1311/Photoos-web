"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShieldAlert, CheckCircle2, ChevronRight, FileText } from "lucide-react";
import { LEGAL_CONFIG } from "@/config/legal";
import { recordConsent } from "@/lib/legal/consent";
import { getSession } from "@/lib/auth/session";

export function ReconsentModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [privacyAgreed, setPrivacyAgreed] = useState(false);
  const [platformAgreed, setPlatformAgreed] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function checkReconsent() {
      const session = await getSession();
      if (!session?.user?.id) return;

      const lastAcceptedVersion = localStorage.getItem("photoos_accepted_legal_version");
      if (lastAcceptedVersion !== LEGAL_CONFIG.version) {
        setIsOpen(true);
      }
    }
    checkReconsent();
  }, []);

  async function handleAccept() {
    if (!termsAgreed || !privacyAgreed || !platformAgreed) return;
    setSubmitting(true);
    try {
      await Promise.all([
        recordConsent({
          consentType: "terms",
          documentType: "terms_of_service",
          version: LEGAL_CONFIG.version,
        }),
        recordConsent({
          consentType: "privacy",
          documentType: "privacy_policy",
          version: LEGAL_CONFIG.version,
        }),
        recordConsent({
          consentType: "platform_agreement",
          documentType: "platform_agreement",
          version: LEGAL_CONFIG.version,
        }),
      ]);

      localStorage.setItem("photoos_accepted_legal_version", LEGAL_CONFIG.version);
      setIsOpen(false);
    } catch (err) {
      console.warn("[Reconsent] Notice:", err);
      localStorage.setItem("photoos_accepted_legal_version", LEGAL_CONFIG.version);
      setIsOpen(false);
    } finally {
      setSubmitting(false);
    }
  }

  if (!isOpen) return null;

  const allChecked = termsAgreed && privacyAgreed && platformAgreed;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-md">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="reconsent-dialog-title"
        className="w-full max-w-lg rounded-2xl border border-sky-500/40 bg-slate-900 p-6 shadow-2xl sm:p-8 text-slate-100"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-sky-400">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <div>
            <span className="rounded-full bg-sky-500/10 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-300">
              Regulatory Update Notice
            </span>
            <h2 id="reconsent-dialog-title" className="text-lg font-bold text-white sm:text-xl">
              We&apos;ve Updated Our Legal Terms
            </h2>
          </div>
        </div>

        <p className="mt-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
          To comply with India&apos;s <strong>Digital Personal Data Protection Act, 2023 (DPDP Act)</strong> and the <strong>IT Intermediary Rules, 2021</strong>, we have updated our legal framework to <strong>Version {LEGAL_CONFIG.version}</strong> (Effective {LEGAL_CONFIG.effectiveDateFormattedEn}).
        </p>

        {/* Changelog Summary */}
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/70 p-4 text-xs text-slate-300">
          <span className="font-bold text-sky-400">Key Summary of Changes:</span>
          <ul className="mt-2 space-y-1.5 list-disc pl-4 text-slate-300">
            <li>Strict DPDP Act 2023 data principal rights (access, erasure, nomination).</li>
            <li>Explicit opt-in and instant 1-click withdrawal for AI face-matching.</li>
            <li>Clear IT Act Section 79 intermediary safe harbor and non-liability terms.</li>
            <li>Available in full bilingual English and Marathi.</li>
          </ul>
        </div>

        {/* Unbundled Checkboxes */}
        <div className="mt-5 space-y-3">
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700">
            <input
              type="checkbox"
              checked={termsAgreed}
              onChange={(e) => setTermsAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#0a3f61]"
            />
            <span className="text-xs text-slate-200">
              I have reviewed and agree to the{" "}
              <Link href="/terms" target="_blank" className="text-sky-400 underline">
                Terms of Service (v{LEGAL_CONFIG.version})
              </Link>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700">
            <input
              type="checkbox"
              checked={privacyAgreed}
              onChange={(e) => setPrivacyAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#0a3f61]"
            />
            <span className="text-xs text-slate-200">
              I understand and consent to data processing under the{" "}
              <Link href="/privacy" target="_blank" className="text-sky-400 underline">
                Privacy Policy & DPDP Notice
              </Link>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3 hover:border-slate-700">
            <input
              type="checkbox"
              checked={platformAgreed}
              onChange={(e) => setPlatformAgreed(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#0a3f61]"
            />
            <span className="text-xs text-slate-200">
              I agree to the{" "}
              <Link href="/platform-agreement" target="_blank" className="text-sky-400 underline">
                Platform Agreement & Intermediary Terms
              </Link>
            </span>
          </label>
        </div>

        {/* Submit */}
        <div className="mt-6 pt-2">
          <button
            type="button"
            disabled={!allChecked || submitting}
            onClick={handleAccept}
            className="w-full rounded-xl bg-[#0a3f61] py-3 text-xs font-bold text-white shadow-lg transition hover:bg-[#083650] disabled:opacity-50"
          >
            {submitting ? "Recording Your Consent..." : `Confirm & Accept Version ${LEGAL_CONFIG.version}`}
          </button>
        </div>
      </div>
    </div>
  );
}

