"use client";

import { Bell } from "lucide-react";

import Breadcrumb from "./Breadcrumb";
import PageHeader from "./PageHeader";
import GlobalSearch from "./GlobalSearch";
import UserProfile from "./UserProfile";

export default function Header() {
  return (
    <header className="border-b border-slate-200 bg-white px-8 py-6">

      <div className="flex items-start justify-between">

        <div className="space-y-4">

          <Breadcrumb />

          <PageHeader />

        </div>

        <div className="flex items-center gap-4">

          <GlobalSearch />

          <button className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50">

            <Bell size={18} />

            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />

          </button>

          <div className="hidden rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 lg:block">

            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Current Plan
            </p>

            <p className="text-sm font-bold text-emerald-800">
              Gold Studio
            </p>

          </div>

          <UserProfile />

        </div>

      </div>

    </header>
  );
}