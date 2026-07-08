"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronRight,
  Sparkles,
} from "lucide-react";

import Logo from "@/components/logo/Logo";
import { APP_VERSION } from "@/constants/app";
import { navigation } from "@/constants/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-screen w-72 flex-col border-r border-slate-200 bg-white">

      {/* Logo */}

      <div className="border-b border-slate-200 px-6 py-6">

        <Logo />

        <p className="mt-2 text-sm text-slate-500">
          Photography Operating System
        </p>

      </div>

      {/* Workspace */}

      <div className="mx-4 mt-5 rounded-2xl border border-[#0A3F61]/10 bg-gradient-to-br from-[#0A3F61] to-[#155983] p-4 text-white shadow-lg">

        <div className="flex items-center justify-between">

          <div>

            <p className="text-xs uppercase tracking-wider text-white/70">
              Workspace
            </p>

            <h2 className="mt-1 text-lg font-semibold">
              Adskart Studio
            </h2>

          </div>

          <div className="rounded-xl bg-white/10 p-3">
            <Sparkles size={18} />
          </div>

        </div>

        <div className="mt-5">

          <div className="mb-2 flex items-center justify-between text-xs">

            <span>Storage</span>

            <span>68%</span>

          </div>

          <div className="h-2 overflow-hidden rounded-full bg-white/20">

            <div className="h-full w-[68%] rounded-full bg-white" />

          </div>

        </div>

      </div>

      {/* Navigation */}

      <nav className="flex-1 overflow-y-auto px-4 py-6">

        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-widest text-slate-400">
          Main Menu
        </p>

        <ul className="space-y-2">

          {navigation.map((item) => {
            const Icon = item.icon;

            const active =
              pathname === item.href ||
              pathname.startsWith(`${item.href}/`);

            return (
              <li key={item.href}>

                <Link
                  href={item.href}
                  className={`group flex items-center justify-between rounded-2xl px-4 py-3 transition-all duration-300 ${
                    active
                      ? "bg-[#0A3F61] text-white shadow-lg"
                      : "text-slate-600 hover:bg-slate-100 hover:text-[#0A3F61]"
                  }`}
                >

                  <div className="flex items-center gap-3">

                    <div
                      className={`rounded-xl p-2 ${
                        active
                          ? "bg-white/15"
                          : "bg-slate-100 group-hover:bg-[#0A3F61]/10"
                      }`}
                    >
                      <Icon size={18} />
                    </div>

                    <span className="font-medium">
                      {item.title}
                    </span>

                  </div>

                  <ChevronRight
                    size={16}
                    className={`transition-transform ${
                      active ? "translate-x-1" : ""
                    }`}
                  />

                </Link>

              </li>
            );
          })}

        </ul>

      </nav>

      {/* Footer */}

      <div className="border-t border-slate-200 p-5">

        <div className="rounded-2xl bg-slate-50 p-4">

          <div className="flex items-center justify-between">

            <div>

              <p className="text-sm font-semibold text-slate-900">
                Photo<span className="text-[#0A3F61]">OS</span>
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Enterprise Edition
              </p>

            </div>

            <span className="rounded-full bg-[#0A3F61]/10 px-3 py-1 text-xs font-semibold text-[#0A3F61]">
              v{APP_VERSION}
            </span>

          </div>

        </div>

      </div>

    </aside>
  );
}