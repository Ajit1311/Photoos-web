"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Clock,
  Layers,
  LogOut,
  QrCode,
  ShieldCheck,
  Sparkles,
  User,
} from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import {
  getCorporateCompany,
  type CorporateCompany,
} from "@/lib/corporate/corporate-service";

export function CorporateNavbar() {
  const pathname = usePathname();
  const [company, setCompany] = useState<CorporateCompany | null>(null);

  useEffect(() => {
    void getCorporateCompany().then(setCompany);
  }, []);

  const navItems = [
    { label: "Dashboard", href: "/corporate/dashboard", icon: Layers },
    { label: "Company Events", href: "/corporate/events", icon: CalendarDays },
    { label: "Standee QR", href: "/corporate/standee-qr", icon: QrCode },
    { label: "Company Profile", href: "/corporate/profile", icon: Building2 },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur dark:border-slate-800 dark:bg-slate-900/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <Link href="/corporate/dashboard" className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 via-indigo-600 to-blue-700 text-white shadow-md shadow-indigo-500/20">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  PhotoOS
                </span>
                <span className="rounded bg-sky-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-sky-800 dark:bg-sky-950 dark:text-sky-300">
                  Enterprise
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Corporate Office Edition
              </p>
            </div>
          </Link>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || (item.href !== "/corporate/dashboard" && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-white"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-white"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right side controls */}
        <div className="flex items-center gap-3">
          {/* Trial Status Badge */}
          <div className="hidden sm:flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
            </span>
            <Clock className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>
              {company?.subscription?.days_remaining ?? 7} Days Free Trial
            </span>
          </div>

          <ThemeToggle />

          {/* Company identity dropdown/pill */}
          <Link
            href="/corporate/profile"
            className="flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-600 text-[11px] font-bold text-white">
              {company?.name ? company.name[0].toUpperCase() : "C"}
            </div>
            <span className="max-w-[120px] truncate">
              {company?.name || "Corporate Admin"}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
}
