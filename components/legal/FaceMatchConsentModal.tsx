"use client";

import { useState } from "react";
import Link from "next/link";
import { 
  ScanFace, 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertTriangle,
  X 
} from "lucide-react";
import { recordConsent, withdrawConsent } from "@/lib/legal/consent";
import { LEGAL_CONFIG } from "@/config/legal";

interface FaceMatchConsentModalProps {
  isOpen: boolean;
  onConsentGranted: () => void;
  onConsentDeclined: () => void;
  eventName?: string;
}

export function FaceMatchConsentModal({
  isOpen,
  onConsentGranted,
  onConsentDeclined,
  eventName,
}: FaceMatchConsentModalProps) {
  const [lang, setLang] = useState<"en" | "mr">("en");
  const [agreeChecked, setAgreeChecked] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleConfirm() {
    if (!agreeChecked) return;
    setSubmitting(true);
    try {
      await recordConsent({
        consentType: "face_match",
        documentType: "privacy_policy",
        version: LEGAL_CONFIG.version,
        language: lang,
        metadata: {
          feature: "face_search_discovery",
          event_name: eventName || "event_gallery",
          dpdp_section_6_compliant: true,
        },
      });
      onConsentGranted();
    } catch (err) {
      console.warn("[FaceMatchConsent] Notice:", err);
      onConsentGranted();
    } finally {
      setSubmitting(false);
    }
  }

  function handleDecline() {
    void withdrawConsent("face_match");
    onConsentDeclined();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        role="dialog"
        aria-modal="true"
        aria-labelledby="face-match-dialog-title"
        className="w-full max-w-lg rounded-2xl border border-sky-500/30 bg-slate-900 p-6 shadow-2xl sm:p-7 text-slate-100"
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
              <ScanFace className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-400">
                DPDP Act 2023 Statutory Notice
              </span>
              <h2 id="face-match-dialog-title" className="text-base font-bold text-white sm:text-lg">
                {lang === "en" ? "Facial Search & Biometric Consent" : "चेहऱ्याची ओळख आणि बायोमेट्रिक संमती"}
              </h2>
            </div>
          </div>

          {/* Language Switch */}
          <button
            type="button"
            onClick={() => setLang(lang === "en" ? "mr" : "en")}
            className="rounded-lg border border-slate-800 bg-slate-800/80 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:text-white"
          >
            {lang === "en" ? "मराठी" : "English"}
          </button>
        </div>

        {/* Notice Body */}
        <div className="mt-5 space-y-4 text-xs leading-relaxed text-slate-300 sm:text-sm">
          <p className="font-medium text-slate-200">
            {lang === "en"
              ? `To find your personal photos in ${eventName ? `"${eventName}"` : "this event gallery"}, PhotoOS generates temporary mathematical face coordinates (vectors).`
              : `या अल्बममधून तुमचे स्वतःचे फोटो शोधण्यासाठी PhotoOS चेहऱ्याचे तात्पुरते गणितीय निर्देशक (Face Vectors) मोजून शोध घेते.`}
          </p>

          <div className="space-y-2 rounded-xl border border-slate-800/80 bg-slate-950/60 p-4 text-xs">
            <div className="flex items-start gap-2.5">
              <ShieldCheck className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
              <span>
                <strong>{lang === "en" ? "Private & Safe:" : "सुरक्षित व खाजगी:"}</strong>{" "}
                {lang === "en" 
                  ? "We never store raw facial biometric scan images. Only mathematical arrays are created."
                  : "आम्ही चेहऱ्याचा मूळ स्कॅन फोटो साठवत नाही; केवळ संख्यात्मक निर्देशक तयार केले जातात."}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <Lock className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
              <span>
                <strong>{lang === "en" ? "No Ad Profiling:" : "जाहिरातींसाठी वापर नाही:"}</strong>{" "}
                {lang === "en"
                  ? "Your face data is never sold, shared with ad networks, or used to train open AI models."
                  : "तुमचा चेहरा डेटा कधीही कोणाला विकला जात नाही किंवा जाहिरातींसाठी वापरला जात नाही."}
              </span>
            </div>

            <div className="flex items-start gap-2.5">
              <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-sky-400" />
              <span>
                <strong>{lang === "en" ? "Withdrawable Anytime:" : "कधीही डिलीट करा:"}</strong>{" "}
                {lang === "en"
                  ? "You can withdraw consent and delete your face vectors at any time via privacy settings."
                  : "तुम्ही कधीही सेटिंग्जमधून ही संमती मागे घेऊन तुमचे वेक्टर्स कायमस्वरूपी डिलीट करू शकता."}
              </span>
            </div>
          </div>

          {/* Opt-in Checkbox */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/60 p-3.5 hover:border-slate-700">
            <input
              type="checkbox"
              checked={agreeChecked}
              onChange={(e) => setAgreeChecked(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-slate-700 bg-slate-800 text-[#0a3f61] focus:ring-sky-500"
            />
            <span className="text-xs font-medium text-slate-200">
              {lang === "en"
                ? "I expressly consent to the processing of my facial vectors solely for photo-matching in this gallery, under the PhotoOS Privacy Policy."
                : "PhotoOS च्या गोपनीयता धोरणानुसार या अल्बममध्ये फोटो शोधण्यासाठी माझ्या चेहऱ्याच्या वेक्टर्सवर प्रक्रिया करण्यास माझी स्पष्ट संमती आहे."}
            </span>
          </label>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-2.5 sm:flex-row sm:items-center sm:justify-end">
          <button
            type="button"
            onClick={handleDecline}
            className="rounded-xl border border-slate-700 bg-slate-800/80 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
          >
            {lang === "en" ? "Decline (Browse Manually)" : "नाही (फोटो स्वतः शोधा)"}
          </button>

          <button
            type="button"
            disabled={!agreeChecked || submitting}
            onClick={handleConfirm}
            className="inline-flex items-center justify-center rounded-xl bg-[#0a3f61] px-5 py-2.5 text-xs font-bold text-white shadow-md transition hover:bg-[#083650] disabled:opacity-50"
          >
            {submitting 
              ? (lang === "en" ? "Recording..." : "नोंदवत आहे...") 
              : (lang === "en" ? "Grant Consent & Continue" : "संमती द्या आणि पुढे जा")}
          </button>
        </div>

        <p className="mt-4 text-center text-[11px] text-slate-500">
          Statutory compliance under DPDP Act 2023 Section 6. Read full <Link href="/privacy" target="_blank" className="text-sky-400 underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
