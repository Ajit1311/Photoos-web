"use client";

import {
  CheckCircle2,
  Upload,
  CreditCard,
  Users,
  ImageIcon,
  Clock3,
} from "lucide-react";

export interface RecentActivity {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "upload"
    | "payment"
    | "team"
    | "gallery"
    | "general";
}

interface RecentActivityCardProps {
  activities: RecentActivity[];
}

export default function RecentActivityCard({
  activities,
}: RecentActivityCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Recent Activity
          </p>

          <h2 className="mt-1 text-xl font-bold text-slate-900">
            Activity Timeline
          </h2>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
          {activities.length} Activit{activities.length === 1 ? "y" : "ies"}
        </span>

      </div>

      {activities.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">

          <Clock3
            size={40}
            className="text-slate-400"
          />

          <h3 className="mt-4 text-lg font-semibold text-slate-900">
            No Recent Activity
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Activity history will appear here once work begins on this event.
          </p>

        </div>
      ) : (
        <div className="mt-6 space-y-4 max-h-96 overflow-y-auto">

          {activities.map((activity) => (
            <ActivityRow
              key={activity.id}
              activity={activity}
            />
          ))}

        </div>
      )}

    </div>
  );
}

interface ActivityRowProps {
  activity: RecentActivity;
}

function ActivityRow({
  activity,
}: ActivityRowProps) {
  return (
    <div className="flex items-start gap-4 rounded-xl border border-slate-200 p-4">

      <div className="rounded-full bg-slate-100 p-2">
        {getActivityIcon(activity.type)}
      </div>

      <div className="flex-1">

        <div className="flex items-center justify-between gap-4">

          <h3 className="font-semibold text-slate-900">
            {activity.title}
          </h3>

          <span className="whitespace-nowrap text-xs text-slate-500">
            {activity.time}
          </span>

        </div>

        <p className="mt-1 text-sm text-slate-500">
          {activity.description}
        </p>

      </div>

    </div>
  );
}

function getActivityIcon(
  type: RecentActivity["type"],
) {
  switch (type) {
    case "upload":
      return (
        <Upload
          size={18}
          className="text-blue-600"
        />
      );

    case "payment":
      return (
        <CreditCard
          size={18}
          className="text-emerald-600"
        />
      );

    case "team":
      return (
        <Users
          size={18}
          className="text-violet-600"
        />
      );

    case "gallery":
      return (
        <ImageIcon
          size={18}
          className="text-orange-600"
        />
      );

    default:
      return (
        <CheckCircle2
          size={18}
          className="text-slate-600"
        />
      );
  }
}