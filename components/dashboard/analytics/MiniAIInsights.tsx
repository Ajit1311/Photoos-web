import {
  BrainCircuit,
  CheckCircle2,
  Clock3,
  Sparkles,
} from "lucide-react";

const items = [
  {
    title: "Running",
    value: "18",
    icon: Sparkles,
    color: "bg-blue-100 text-[#0A3F61]",
  },
  {
    title: "Completed",
    value: "142",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600",
  },
  {
    title: "Queue",
    value: "08",
    icon: Clock3,
    color: "bg-orange-100 text-orange-600",
  },
];

export default function MiniAIInsights() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-xl font-bold text-slate-900">
              AI Insights
            </h2>

            <p className="mt-2 text-sm text-slate-500">
              Live AI engine status.
            </p>

          </div>

          <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

            <BrainCircuit size={20} />

          </div>

        </div>

      </div>

      <div className="space-y-4 p-6">

        {items.map((item) => {

          const Icon = item.icon;

          return (

            <div
              key={item.title}
              className="flex items-center justify-between rounded-2xl border border-slate-200 p-4 transition hover:border-[#0A3F61]/20 hover:bg-slate-50"
            >

              <div className="flex items-center gap-3">

                <div className={`rounded-xl p-3 ${item.color}`}>

                  <Icon size={18} />

                </div>

                <span className="font-medium text-slate-700">

                  {item.title}

                </span>

              </div>

              <span className="text-xl font-bold text-slate-900">

                {item.value}

              </span>

            </div>

          );

        })}

      </div>

      <div className="border-t border-slate-100 p-5">

        <div className="rounded-2xl bg-[#0A3F61]/5 p-4">

          <p className="text-sm font-semibold text-[#0A3F61]">
            AI Health
          </p>

          <p className="mt-2 text-sm leading-6 text-slate-600">
            All AI workers are healthy. No action required.
          </p>

        </div>

      </div>

    </section>
  );
}