import Link from "next/link";
import { ShieldCheck, Mail, MapPin } from "lucide-react";
import { LEGAL_CONFIG } from "@/config/legal";

export function LegalFooter() {
  return (
    <footer className="border-t border-slate-800 bg-slate-950 py-10 text-xs text-slate-400 print:hidden">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Intermediary safe harbor notice */}
          <div className="space-y-3 sm:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white tracking-tight">PhotoOS</span>
              <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 text-[10px] font-semibold text-sky-400">
                v{LEGAL_CONFIG.version}
              </span>
            </div>
            <p className="max-w-md text-xs leading-relaxed text-slate-400">
              India&apos;s modern operating system and marketplace technology for professional photography studios, client proofing, and QR code event delivery. 
              Operated by {LEGAL_CONFIG.companyLegalName} as a technology intermediary under Section 79 of the IT Act, 2000.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0 text-slate-400" />
              <span>{LEGAL_CONFIG.registeredAddress}</span>
            </div>
          </div>

          {/* Legal Documents */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Legal & Compliance
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/terms" className="transition hover:text-white hover:underline">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="transition hover:text-white hover:underline">
                  Privacy Policy (DPDP Act 2023)
                </Link>
              </li>
              <li>
                <Link href="/platform-agreement" className="transition hover:text-white hover:underline">
                  Platform Agreement
                </Link>
              </li>
              <li>
                <Link href="/dashboard/settings/privacy" className="transition hover:text-white hover:underline">
                  Consent & Data Rights (DPDP)
                </Link>
              </li>
            </ul>
          </div>

          {/* Statutory Grievance & Regulatory */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Grievance & Redressal
            </h4>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <p className="font-medium text-slate-300">{LEGAL_CONFIG.grievanceOfficerName}</p>
              <p>{LEGAL_CONFIG.grievanceOfficerDesignation}</p>
              <p className="text-sky-400">
                <a href={`mailto:${LEGAL_CONFIG.grievanceOfficerEmail.replace(/[\[\]]/g, "")}`} className="hover:underline">
                  {LEGAL_CONFIG.grievanceOfficerEmail}
                </a>
              </p>
              <p className="text-[10px] text-slate-500 pt-1">
                Acknowledgement within 48 hrs · Resolution within 30 days under IT Rules 2021.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-4 border-t border-slate-900 pt-6 text-[11px] text-slate-500 sm:flex-row">
          <p>© 2026 {LEGAL_CONFIG.brandName}. All rights reserved. Made with ❤️ in India.</p>
          <div className="flex items-center gap-4">
            <span>CIN: {LEGAL_CONFIG.cin}</span>
            <span>•</span>
            <span>Effective: {LEGAL_CONFIG.effectiveDateFormattedEn}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

