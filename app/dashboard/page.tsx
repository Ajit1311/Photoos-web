import {
  Images,
  FolderOpen,
  Users,
  Sparkles,
} from "lucide-react";

import StatCard from "@/components/dashboard/StatCard";
import BusinessHealthCard from "@/components/dashboard/analytics/BusinessHealthCard";
import RevenueCard from "@/components/dashboard/analytics/RevenueCard";
import AIInsights from "@/components/dashboard/analytics/AIInsights";
import StorageHealth from "@/components/dashboard/analytics/StorageHealth";
import AIQueue from "@/components/dashboard/analytics/AIQueue";
import PerformanceScorecards from "@/components/dashboard/analytics/PerformanceScorecards";
import RevenueChart from "@/components/dashboard/charts/RevenueChart";
import BusinessHeatmap from "@/components/dashboard/charts/BusinessHeatmap";
import OverviewStats from "@/components/dashboard/overview/OverviewStats";
import QuickActions from "@/components/dashboard/overview/QuickActions";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";
import TodaysEvents from "@/components/dashboard/overview/TodaysEvents";
import UpcomingDeadlines from "@/components/dashboard/overview/UpcomingDeadlines";
import NotificationCenter from "@/components/dashboard/overview/NotificationCenter";
import LiveCalendar from "@/components/dashboard/overview/LiveCalendar";
import ActivityTimeline from "@/components/dashboard/overview/ActivityTimeline";
import StudioCommandCenter from "@/components/dashboard/command/StudioCommandCenter";
import QuickMetrics from "@/components/dashboard/command/QuickMetrics";
import ProductivityPanel from "@/components/dashboard/productivity/ProductivityPanel";
import TeamPerformance from "@/components/dashboard/productivity/TeamPerformance";
import RevenueGoalTracker from "@/components/dashboard/productivity/RevenueGoalTracker";
import AIRecommendationEngine from "@/components/dashboard/intelligence/AIRecommendationEngine";
import ActiveProjects from "@/components/dashboard/intelligence/ActiveProjects";
import ClientFollowups from "@/components/dashboard/intelligence/ClientFollowups";

export default function DashboardPage() {
  return (
    <main className="space-y-8">
      <section className="flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-[#0A3F61]">Enterprise Dashboard</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-900">
            Good Evening, Parashuram 👋
          </h1>
          <p className="mt-3 max-w-2xl text-slate-500">
            Welcome back. Here is your studio command center.
          </p>
        </div>
        <BusinessHealthCard />
      </section>

      <OverviewStats />
      <PerformanceScorecards />

      {/* नवीन ॲड केलेले Sections - Hero / Scorecards नंतर */}
      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <StudioCommandCenter />
        </div>
        <QuickMetrics />
      </section>
      {/* System Status च्या खाली नवीन जोडलेला सेक्शन */}
      <section className="grid gap-6 xl:grid-cols-3">
        <ProductivityPanel />
        <TeamPerformance />
        <RevenueGoalTracker />
      </section>
      <section className="grid gap-6 xl:grid-cols-3">

        <AIRecommendationEngine />

        <ActiveProjects />

        <ClientFollowups />

      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Assets" value="24,582" subtitle="+312 this month" icon={<Images size={24} />} />
        <StatCard title="Galleries" value="186" subtitle="12 pending publish" icon={<FolderOpen size={24} />} />
        <StatCard title="Clients" value="842" subtitle="+24 new clients" icon={<Users size={24} />} />
        <StatCard title="AI Jobs" value="32" subtitle="Workers healthy" icon={<Sparkles size={24} />} />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RevenueCard /></div>
        <AIInsights />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RevenueChart /></div>
        <BusinessHeatmap />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <LiveCalendar />
        <ActivityTimeline />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2"><RecentActivity /></div>
        <QuickActions />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <TodaysEvents />
        <UpcomingDeadlines />
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <StorageHealth />
        <AIQueue />
        <NotificationCenter />
      </section>
    </main>
  );
}