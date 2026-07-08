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

import QuickActions from "@/components/dashboard/overview/QuickActions";
import RecentActivity from "@/components/dashboard/overview/RecentActivity";
import TodaysEvents from "@/components/dashboard/overview/TodaysEvents";
import OverviewStats from "@/components/dashboard/overview/OverviewStats";
import UpcomingDeadlines from "@/components/dashboard/overview/UpcomingDeadlines";
import StorageHealth from "@/components/dashboard/analytics/StorageHealth";
import AIQueue from "@/components/dashboard/analytics/AIQueue";
import NotificationCenter from "@/components/dashboard/overview/NotificationCenter";

export default function DashboardPage() {
    return (
        <main className="space-y-8">

            <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">

                <div>

                    <p className="text-sm font-semibold uppercase tracking-widest text-[#0A3F61]">
                        Dashboard
                    </p>

                    <h1 className="mt-2 text-4xl font-bold text-slate-900">
                        Good Evening, Parashuram 👋
                    </h1>

                    <p className="mt-3 text-slate-500">
                        Welcome back. Your studio is performing exceptionally well today.
                    </p>

                </div>

                <BusinessHealthCard />

            </section>

            <OverviewStats />

            <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">

                <StatCard
                    title="Total Assets"
                    value="24,582"
                    subtitle="+312 this month"
                    icon={<Images size={24} />}
                />

                <StatCard
                    title="Galleries"
                    value="186"
                    subtitle="12 pending publish"
                    icon={<FolderOpen size={24} />}
                />

                <StatCard
                    title="Clients"
                    value="842"
                    subtitle="+24 new clients"
                    icon={<Users size={24} />}
                />

                <StatCard
                    title="AI Jobs"
                    value="32"
                    subtitle="Workers healthy"
                    icon={<Sparkles size={24} />}
                />

            </section>

            <section className="grid gap-6 xl:grid-cols-3">

                <div className="xl:col-span-2">
                    <RevenueCard />
                </div>

                <AIInsights />

            </section>

            <section className="grid gap-6 xl:grid-cols-3">

                <div className="xl:col-span-2">
                    <RecentActivity />
                </div>

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