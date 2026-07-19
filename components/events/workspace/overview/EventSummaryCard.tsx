"use client";

export default function EventSummaryCard() {
  return (
    <div className="rounded-2xl border bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold">
        Event Summary
      </h2>

      <div className="mt-5 grid grid-cols-2 gap-4">

        <div>
          <p className="text-sm text-slate-500">Client</p>
          <p className="font-medium">Rahul Patil</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Event Type</p>
          <p className="font-medium">Wedding</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Date</p>
          <p className="font-medium">15 Dec 2026</p>
        </div>

        <div>
          <p className="text-sm text-slate-500">Venue</p>
          <p className="font-medium">Kolhapur</p>
        </div>

      </div>
    </div>
  );
}