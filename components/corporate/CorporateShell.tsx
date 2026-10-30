"use client";

import { ReactNode, useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import {
  Building2,
  Clock,
  Menu,
  ShieldCheck,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { CorporateSidebar } from "./CorporateSidebar";
import {
  getCorporateCompany,
  type CorporateCompany,
} from "@/lib/corporate/corporate-service";

interface CorporateShellProps {
  children: ReactNode;
}

export function CorporateShell({ children }: CorporateShellProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [company, setCompany] = useState<CorporateCompany | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [checkingCompliance, setCheckingCompliance] = useState(true);

  useEffect(() => {
    async function init() {
      const comp = await getCorporateCompany();
      setCompany(comp);

      // Enforce legal compliance: user CANNOT access dashboard or internal pages without accepting compliance
      // User requirement: "sagalikde same legal compleince page use kr ha https://app.photoos.in/legal-compliance"
      if (!comp.compliance_accepted && !pathname.includes("/login")) {
        router.replace("/legal-compliance?mode=corporate");
        return;
      }

      setCheckingCompliance(false);
    }
    void init();
  }, [pathname, router]);

  if (checkingCompliance) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
          <div className="h-4 w-4 rounded-full border-2 border-[#0A3F61] border-t-transparent animate-spin" />
          <span>Verifying Enterprise Workspace...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 antialiased dark:bg-slate-950 dark:text-slate-100 flex font-sans">
      {/* Sidebar matching app.photoos.in */}
      <CorporateSidebar
        company={company}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Content Area */}
      <div
        className={[
          "flex-1 flex flex-col min-w-0 transition-all duration-300",
          collapsed ? "lg:pl-[76px]" : "lg:pl-[272px]",
        ].join(" ")}
      >
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 flex h-[72px] shrink-0 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6 lg:px-8 dark:border-slate-800 dark:bg-slate-900/95">
          <div className="flex items-center gap-3">
            {/* Mobile Menu Hamburger */}
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900 dark:text-white">
                  {company?.name || "Corporate Workplace"}
                </span>
                <span className="rounded bg-sky-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-[#0A3F61] dark:bg-sky-950 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                AI Event Galleries & Reception Standee Portal
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-3">
            {/* Trial Countdown Badge */}
            <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-300">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
              </span>
              <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{company?.subscription?.days_remaining ?? 7} Days Free Trial</span>
            </div>

            <ThemeToggle />

            {/* Profile Pill */}
            <Link
              href="/corporate/profile"
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1.5 pr-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 shadow-xs"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#0A3F61] text-xs font-bold text-white shadow-xs">
                {company?.name ? company.name[0].toUpperCase() : "C"}
              </div>
              <span className="hidden sm:inline max-w-[120px] truncate">
                {company?.name || "Profile"}
              </span>
            </Link>
          </div>
        </header>

        {/* Page Content Body */}
        <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>

        {/* Clean Footer */}
        <footer className="border-t border-slate-200 bg-white py-4 dark:border-slate-800 dark:bg-slate-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
            <p>© {new Date().getFullYear()} PhotoOS &bull; Corporate Enterprise Workplace Edition</p>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <ShieldCheck className="h-3.5 w-3.5" />
                DPDP Act 2023 Compliant
              </span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
