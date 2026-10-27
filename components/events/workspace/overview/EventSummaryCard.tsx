"use client";

interface EventSummary {
  title: string;
  clientName: string;
  eventType: string;
  eventDate: string;
  venue?: string | null;
  status:
    | "draft"
    | "active"
    | "published"
    | "completed"
    | "archived";
}

interface EventSummaryCardProps {
  summary: EventSummary;
}

const statusStyles: Record<EventSummary["status"], string> = {
  draft:
    "bg-amber-100 text-amber-800 border border-amber-200",

  active:
    "bg-blue-100 text-blue-800 border border-blue-200",

  published:
    "bg-emerald-100 text-emerald-800 border border-emerald-200",

  completed:
    "bg-indigo-100 text-indigo-800 border border-indigo-200",

  archived:
    "bg-slate-100 text-slate-700 border border-slate-200",
};

const statusLabels: Record<EventSummary["status"], string> = {
  draft: "Draft",

  active: "In Progress",

  published: "Published",

  completed: "Completed",

  archived: "Archived",
};

export default function EventSummaryCard({
  summary,
}: EventSummaryCardProps) {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">

      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

        <div>
          <p className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Event Summary
          </p>

          <h2 className="mt-1 text-2xl font-bold text-slate-900">
            {summary.title}
          </h2>
        </div>

        <span
          className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[summary.status]}`}
        >
          {statusLabels[summary.status]}
        </span>

      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">

        <div>
          <p className="text-sm text-slate-500">
            Client
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {summary.clientName || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Event Type
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {summary.eventType || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Event Date
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {summary.eventDate || "—"}
          </p>
        </div>

        <div>
          <p className="text-sm text-slate-500">
            Venue
          </p>

          <p className="mt-1 font-medium text-slate-900">
            {summary.venue?.trim() || "Not specified"}
          </p>
        </div>

      </div>

    </div>
  );
}