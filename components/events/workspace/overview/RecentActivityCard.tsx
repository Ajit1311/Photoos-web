"use client";

export default function RecentActivityCard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Recent Activity
      </h2>

      <p className="mt-5 text-slate-500">
        No recent activity found.
      </p>
    </div>
  );
}