"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, Shield, Check, X, ChevronDown, ChevronUp } from "lucide-react";
import { recordConsent, withdrawConsent } from "@/lib/legal/consent";

export function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);

  useEffect(() => {
    // Check if consent has already been recorded
    const existing = localStorage.getItem("photoos_cookie_consent");
    if (!existing) {
      // Small timeout so banner doesn't flash on first frame
      const timer = setTimeout(() => setVisible(true), 1200);
      return () => clearTimeout(timer);
    }
  }, []);

  function handleAcceptAll() {
    localStorage.setItem(
      "photoos_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: true,
        accepted_at: new Date().toISOString(),
      })
    );
    void recordConsent({
      consentType: "cookies",
      documentType: "cookie_policy",
      metadata: { essential: true, analytics: true },
    });
    setVisible(false);
  }

  function handleAcceptEssentialOnly() {
    localStorage.setItem(
      "photoos_cookie_consent",
      JSON.stringify({
        essential: true,
        analytics: false,
        accepted_at: new Date().toISOString(),
      })
    );
    void withdrawConsent("cookies");
    setVisible(false);
  }

  if (!visible) {
    return null;
  }

  return (
    <aside 
      aria-label="Cookie consent banner"
      className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-xl animate-in fade-in slide-in-from-bottom-5 duration-300 print:hidden"
    >
      <div className="rounded-2xl border border-slate-800 bg-slate-900/95 p-5 shadow-2xl backdrop-blur-md sm:p-6">
        <div className="flex items-start gap-3.5">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-sky-500/10 text-sky-400">
            <Cookie className="h-5 w-5" />
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-bold text-white">
              Cookie & Data Privacy Preferences
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-slate-300">
              We use strictly necessary cookies to keep you signed in and secure your account. 
              With your permission, we also use privacy-friendly analytics cookies to improve platform speed and gallery reliability under the DPDP Act 2023.
            </p>

            {/* Expandable Details Section */}
            {showDetails && (
              <div className="mt-3.5 space-y-2.5 rounded-xl border border-slate-800/80 bg-slate-950/60 p-3.5 text-xs">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                  <div>
                    <span className="font-semibold text-white">Strictly Necessary Cookies</span>
                    <p className="text-[11px] text-slate-400">Authentication tokens, session integrity, security CSRF tokens.</p>
                  </div>
                  <span className="rounded bg-sky-500/20 px-2 py-0.5 text-[10px] font-bold text-sky-300">Always Active</span>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <div>
                    <span className="font-semibold text-white">Telemetry & Performance Cookies</span>
                    <p className="text-[11px] text-slate-400">Error diagnostics and Cloudflare gallery performance telemetry.</p>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={analyticsEnabled}
                      onChange={(e) => setAnalyticsEnabled(e.target.checked)}
                      className="sr-only"
                    />
                    <div className={`h-5 w-9 rounded-full transition-colors ${analyticsEnabled ? "bg-[#0a3f61]" : "bg-slate-700"}`}>
                      <div className={`h-4 w-4 rounded-full bg-white transition-transform ${analyticsEnabled ? "translate-x-4" : "translate-x-0.5"} mt-0.5`} />
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setShowDetails(!showDetails)}
                className="inline-flex items-center gap-1 text-xs font-medium text-slate-400 transition hover:text-white"
              >
                <span>{showDetails ? "Hide Details" : "Customize Preferences"}</span>
                {showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleAcceptEssentialOnly}
                  className="rounded-xl border border-slate-700 bg-slate-800/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                >
                  Essential Only
                </button>
                <button
                  type="button"
                  onClick={handleAcceptAll}
                  className="rounded-xl bg-[#0a3f61] px-4 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[#083650]"
                >
                  Accept All
                </button>
              </div>
            </div>

            <div className="mt-3 text-[11px] text-slate-500">
              Read our full <Link href="/privacy" className="text-sky-400 underline">Privacy Policy</Link> and <Link href="/terms" className="text-sky-400 underline">Terms of Service</Link>.
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

