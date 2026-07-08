"use client";

import {
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

const events = [
  {
    date: "09",
    month: "JUL",
    title: "Rahul & Priya Wedding",
    time: "09:00 AM",
    location: "Kolhapur",
    color: "bg-[#0A3F61]",
  },
  {
    date: "10",
    month: "JUL",
    title: "Corporate Photoshoot",
    time: "11:30 AM",
    location: "Belgaum",
    color: "bg-[#3495A1]",
  },
  {
    date: "11",
    month: "JUL",
    title: "Birthday Event",
    time: "06:00 PM",
    location: "Nesari",
    color: "bg-[#EF8619]",
  },
  {
    date: "12",
    month: "JUL",
    title: "Pre Wedding Shoot",
    time: "07:00 AM",
    location: "Goa",
    color: "bg-emerald-500",
  },
];

export default function LiveCalendar() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Live Calendar
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Upcoming shoots & studio schedule
          </p>

        </div>

        <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
          <CalendarDays size={22} />
        </div>

      </div>

      {/* Events */}

      <div className="divide-y divide-slate-100">

        {events.map((event) => (

          <div
            key={event.title}
            className="flex items-center gap-5 px-6 py-5 transition hover:bg-slate-50"
          >

            {/* Date */}

            <div
              className={`flex h-16 w-16 flex-col items-center justify-center rounded-2xl text-white ${event.color}`}
            >

              <span className="text-2xl font-bold">
                {event.date}
              </span>

              <span className="text-[10px] tracking-widest">
                {event.month}
              </span>

            </div>

            {/* Info */}

            <div className="flex-1">

              <h3 className="font-semibold text-slate-900">
                {event.title}
              </h3>

              <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">

                <div className="flex items-center gap-1">

                  <Clock3 size={15} />

                  {event.time}

                </div>

                <div className="flex items-center gap-1">

                  <MapPin size={15} />

                  {event.location}

                </div>

              </div>

            </div>

            {/* Status */}

            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-600">
              Scheduled
            </span>

          </div>

        ))}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 bg-slate-50 px-6 py-4">

        <button className="w-full rounded-2xl border border-[#0A3F61] py-3 font-semibold text-[#0A3F61] transition hover:bg-[#0A3F61] hover:text-white">
          View Full Calendar
        </button>

      </div>

    </div>
  );
}