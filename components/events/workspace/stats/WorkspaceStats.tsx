"use client";

import type {
  Event,
} from "@/types/api/event";

interface WorkspaceStatsProps {
  workspace: Event;
}

export default function WorkspaceStats({
  workspace,
}: WorkspaceStatsProps) {

  const stats = [
    {
      label: "Status",
      value: workspace.status.replaceAll(
        "_",
        " ",
      ),
    },
    {
      label: "Shoot Date",
      value: new Date(
        workspace.shootDate,
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        },
      ),
    },
    {
  label: "Location",
  value:
    workspace.location ??
    "—",
},
        {
      label: "Priority",
      value:
        workspace.priority ??
        "normal",
    },
    {
      label: "Event #",
      value:
        workspace.eventNumber.toString(),
    },
    {
      label: "Project",
      value:
        workspace.projectId,
    },
    {
      label: "Venue",
      value:
        workspace.venue ??
        "—",
    },
  ];

  return (
    <div className="grid grid-cols-7 gap-3">
      {stats.map((item) => (
        <div
          key={item.label}
          className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 transition hover:border-slate-300 hover:bg-white"
        >
          <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            {item.label}
          </p>

          <h3 className="mt-1 text-xl font-bold capitalize text-slate-900">
            {item.value}
          </h3>
        </div>
      ))}
    </div>
  );
}