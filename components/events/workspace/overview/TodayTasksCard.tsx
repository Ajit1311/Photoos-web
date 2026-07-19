"use client";

export default function TodayTasksCard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Today's Tasks
      </h2>

      <p className="mt-5 text-slate-500">
        No pending tasks.
      </p>
    </div>
  );
}