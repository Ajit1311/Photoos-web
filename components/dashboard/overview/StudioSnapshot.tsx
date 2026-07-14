import {
  CalendarDays,
  Image,
  Users,
  Sparkles,
} from "lucide-react";

const stats = [
  {
    title: "Total Events",
    value: "248",
    icon: CalendarDays,
  },
  {
    title: "Active Galleries",
    value: "42",
    icon: Image,
  },
  {
    title: "Active Clients",
    value: "186",
    icon: Users,
  },
  {
    title: "AI Jobs",
    value: "18",
    icon: Sparkles,
  },
];

export default function StudioSnapshot() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-xl font-bold text-slate-900">
          Studio Snapshot
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Live studio overview.
        </p>

      </div>

      <div className="grid grid-cols-2 gap-4 p-6">

        {stats.map((item) => {

          const Icon = item.icon;

          return (

            <button
              key={item.title}
              className="rounded-2xl border border-slate-200 p-4 text-left transition-all duration-200 hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >

              <div className="mb-4 flex items-center justify-between">

                <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                  <Icon size={18} />

                </div>

                <span className="text-2xl font-bold text-slate-900">

                  {item.value}

                </span>

              </div>

              <p className="text-sm font-medium text-slate-600">

                {item.title}

              </p>

            </button>

          );

        })}

      </div>

    </section>
  );
}