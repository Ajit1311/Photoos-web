"use client";

import { Dispatch, SetStateAction } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  CalendarDays,
  Clock,
  Layers,
  PanelLeftClose,
  PanelLeftOpen,
  QrCode,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import type { CorporateCompany } from "@/lib/corporate/corporate-service";

interface CorporateSidebarProps {
  company: CorporateCompany | null;
  collapsed: boolean;
  setCollapsed: Dispatch<SetStateAction<boolean>>;
  mobileOpen: boolean;
  setMobileOpen: Dispatch<SetStateAction<boolean>>;
}

export function CorporateSidebar({
  company,
  collapsed,
  setCollapsed,
  mobileOpen,
  setMobileOpen,
}: CorporateSidebarProps) {
  const pathname = usePathname();

  const navItems = [
    { label: "Dashboard", href: "/corporate/dashboard", icon: Layers },
    { label: "Company Events", href: "/corporate/events", icon: CalendarDays },
    { label: "Standee QR Generator", href: "/corporate/standee-qr", icon: QrCode },
    { label: "Company Profile", href: "/corporate/profile", icon: Building2 },
  ];

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close navigation drawer"
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex flex-col",
          "border-r border-white/10",
          "bg-gradient-to-b from-[#073653] via-[#0A3F61] to-[#075078] text-white",
          "transition-all duration-300 ease-in-out shadow-2xl",
          collapsed ? "w-[76px]" : "w-[272px]",
          mobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        ].join(" ")}
      >
        {/* Logo Header matching app.photoos.in */}
        <div className="relative flex h-[88px] shrink-0 items-center justify-between border-b border-white/10 px-4">
          <Link
            href="/corporate/dashboard"
            className="flex min-w-0 flex-1 items-center gap-3"
            onClick={() => setMobileOpen(false)}
            title={collapsed ? "PhotoOS Corporate" : undefined}
          >
            {/* Logo Mark */}
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-gradient-to-br from-[#3495A1] via-[#1F70B8] to-[#0A3F61] shadow-md shadow-black/20">
              <Building2 className="h-5 w-5 text-white" />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-base font-black tracking-tight text-white">
                    PhotoOS
                  </span>
                  <span className="rounded bg-[#EF8619] px-1.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-950 shadow-xs">
                    Corp
                  </span>
                </div>
                <p className="truncate text-[11px] font-medium text-slate-300">
                  {company?.name || "Corporate Workplace"}
                </p>
              </div>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-300 hover:bg-white/10 lg:hidden"
            onClick={() => setMobileOpen(false)}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 space-y-1.5 px-3 py-6 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive =
              pathname === item.href ||
              (item.href !== "/corporate/dashboard" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={[
                  "group flex items-center gap-3 rounded-xl px-3.5 py-3 text-xs font-semibold tracking-wide transition-all",
                  isActive
                    ? "bg-white/15 text-white font-bold shadow-sm backdrop-blur-md border border-white/20"
                    : "text-slate-300 hover:bg-white/10 hover:text-white",
                  collapsed ? "justify-center px-0" : "",
                ].join(" ")}
                title={collapsed ? item.label : undefined}
              >
                <Icon
                  className={[
                    "h-5 w-5 shrink-0 transition-transform group-hover:scale-110",
                    isActive ? "text-[#EF8619]" : "text-[#3495A1]",
                  ].join(" ")}
                />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer: Trial Badge & Collapse Toggle */}
        <div className="border-t border-white/10 p-3.5">
          {!collapsed && (
            <div className="mb-3 rounded-xl border border-white/15 bg-white/5 p-3 backdrop-blur-xs">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{company?.subscription?.days_remaining ?? 7} Days Free Trial</span>
              </div>
              <p className="mt-1 text-[11px] text-slate-300">
                AI face matching & unlimited event standees active.
              </p>
            </div>
          )}

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex w-full items-center justify-center gap-2 rounded-xl py-2 text-xs font-semibold text-slate-300 hover:bg-white/10 hover:text-white transition-colors"
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <PanelLeftOpen className="h-4 w-4" />
            ) : (
              <>
                <PanelLeftClose className="h-4 w-4" />
                <span>Collapse Sidebar</span>
              </>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}

