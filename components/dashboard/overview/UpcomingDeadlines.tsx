import { CalendarClock } from "lucide-react";

const deadlines = [
  {
    title: "Rahul Wedding Album",
    due: "Today",
  },
  {
    title: "Corporate Gallery",
    due: "Tomorrow",
  },
  {
    title: "Birthday Print Order",
    due: "Friday",
  },
];

export default function UpcomingDeadlines() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6 flex items-center gap-3">

        <CalendarClock
          size={22}
          className="text-[#0A3F61]"
        />

        <h2 className="text-xl font-bold">
          Upcoming Deadlines
        </h2>

      </div>

      <div className="space-y-4">

        {deadlines.map((item) => (

          <div
            key={item.title}
            className="flex items-center justify-between rounded-xl bg-slate-50 p-4"
          >

            <div>

              <h3 className="font-semibold text-slate-900">
                {item.title}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Delivery Deadline
              </p>

            </div>

            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-medium text-orange-600">
              {item.due}
            </span>

          </div>

        ))}

      </div>

    </div>
  );
}