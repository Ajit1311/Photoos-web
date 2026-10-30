"use client";

import { ReactNode } from "react";
import { CorporateNavbar } from "./CorporateNavbar";

interface CorporateShellProps {
  children: ReactNode;
}

export function CorporateShell({ children }: CorporateShellProps) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 flex flex-col font-sans">
      <CorporateNavbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
      <footer className="border-t border-slate-200 bg-white py-6 dark:border-slate-800 dark:bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} PhotoOS Enterprise. Dedicated Platform for Corporate Offices & Internal Events.</p>
          <div className="flex items-center gap-6">
            <span className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
              DPDP Act 2023 Compliant
            </span>
            <span>AI Face Matching Enabled</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

