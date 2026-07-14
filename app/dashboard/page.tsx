import { CalendarDays } from "lucide-react";

import CommandCenter from "@/components/dashboard/overview/CommandCenter";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import TodaysFocus from "@/components/dashboard/overview/TodaysFocus";
import StudioSnapshot from "@/components/dashboard/overview/StudioSnapshot";
import ActiveProjects from "@/components/dashboard/overview/ActiveProjects";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";

import RevenueAnalytics from "@/components/dashboard/analytics/RevenueAnalytics";
import TodaysOperations from "@/components/dashboard/analytics/TodaysOperations";
import RevenueGoal from "@/components/dashboard/analytics/RevenueGoal";
import MiniAIInsights from "@/components/dashboard/analytics/MiniAIInsights";

import PendingPayments from "@/components/dashboard/finance/PendingPayments";
import ClientFollowups from "@/components/dashboard/crm/ClientFollowups";

import BusinessHeatmap from "@/components/dashboard/charts/BusinessHeatmap";
import AIRecommendations from "@/components/dashboard/intelligence/AIRecommendations";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) return "Good Morning";
  if (hour >= 12 && hour < 17) return "Good Afternoon";
  if (hour >= 17 && hour < 21) return "Good Evening";

  return "Good Night";
}

export default function DashboardPage() {
  return (
    <main className="space-y-8">

      {/* Hero */}

      <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-white p-8 shadow-sm lg:flex-row lg:items-center lg:justify-between">

        <div>

          <h1 className="text-4xl font-bold text-slate-900">

            {getGreeting()}, Parashuram 👋

          </h1>

          <div className="mt-4 flex items-center gap-3 text-slate-500">

            <CalendarDays size={18} />

            <span>
              Wednesday • Studio Performance Excellent
            </span>

          </div>

        </div>

        <div className="rounded-3xl bg-[#0A3F61] px-8 py-6 text-white shadow-lg">

          <p className="text-sm text-white/80">
            Business Health
          </p>

          <h2 className="mt-2 text-5xl font-bold">
            92%
          </h2>

        </div>

      </section>

      {/* Top Dashboard */}

      <section className="grid gap-6 xl:grid-cols-3">

        {/* Left */}

        <div className="space-y-6 xl:col-span-2">

          <CommandCenter />

          <TodaysFocus />

        </div>

        {/* Right */}

        <div className="space-y-6">

          <QuickActions />

          <StudioSnapshot />

          <MiniAIInsights />

        </div>

      </section>

      {/* Analytics */}

      <section className="grid gap-6 xl:grid-cols-2">

        <RevenueAnalytics />

        <TodaysOperations />

      </section>

      {/* Revenue */}

      <section className="grid gap-6 xl:grid-cols-2">

        <RevenueGoal />

        <ActiveProjects />

      </section>

      {/* Finance */}

      <section className="grid gap-6 xl:grid-cols-2">

        <PendingPayments />

        <ClientFollowups />

      </section>

      {/* Bottom */}

      <section className="grid gap-6 xl:grid-cols-2">

        <BusinessHeatmap />

        <RecentActivity />

      </section>

      {/* AI */}

      <AIRecommendations />

    </main>
  );
}