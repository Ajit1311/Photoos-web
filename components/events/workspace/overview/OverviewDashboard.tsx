"use client";

import EventSummaryCard from "./EventSummaryCard";
import FinanceSnapshotCard from "./FinanceSnapshotCard";
import TodayTasksCard from "./TodayTasksCard";
import TeamSnapshotCard from "./TeamSnapshotCard";
import RecentActivityCard from "./RecentActivityCard";

export default function OverviewDashboard() {
  return (
    <div className="space-y-6">

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-8">
          <EventSummaryCard />
        </div>

        <div className="col-span-4">
          <FinanceSnapshotCard />
        </div>

      </div>

      <div className="grid grid-cols-12 gap-6">

        <div className="col-span-6">
          <TodayTasksCard />
        </div>

        <div className="col-span-6">
          <TeamSnapshotCard />
        </div>

      </div>

      <RecentActivityCard />

    </div>
  );
}