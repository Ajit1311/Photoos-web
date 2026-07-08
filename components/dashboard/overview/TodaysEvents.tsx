import {
  CalendarDays,
  Clock,
} from "lucide-react";

const events = [
  {
    title: "Rahul Wedding",
    time: "09:00 AM",
  },
  {
    title: "Corporate Shoot",
    time: "01:30 PM",
  },
  {
    title: "Birthday Event",
    time: "06:00 PM",
  },
];

export default function TodaysEvents() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center gap-3">

        <CalendarDays
          className="text-[#0A3F61]"
          size={22}
        />

        <h2 className="text-xl font-bold">
          Today's Events
        </h2>

      </div>

      <div className="space-y-4">

        {events.map((event) => (
          <div
            key={event.title}
            className="flex items-center justify-between rounded-2xl bg-slate-50 p-4"
          >
            <div>

              <h3 className="font-semibold">
                {event.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Event Scheduled
              </p>

            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500">

              <Clock size={16} />

              {event.time}

            </div>

          </div>
        ))}

      </div>

    </div>
  );
}