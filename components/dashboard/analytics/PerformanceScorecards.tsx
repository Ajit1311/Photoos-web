import {
  TrendingUp,
  Smile,
  Clock3,
  Sparkles,
} from "lucide-react";

const scorecards = [
  {
    title: "Revenue Goal",
    value: "72%",
    target: "₹28.4L / ₹40L",
    icon: TrendingUp,
    color: "bg-green-100 text-green-600",
    progress: 72,
  },
  {
    title: "Client Satisfaction",
    value: "4.9★",
    target: "Excellent",
    icon: Smile,
    color: "bg-yellow-100 text-yellow-600",
    progress: 98,
  },
  {
    title: "Delivery Performance",
    value: "96%",
    target: "On Time",
    icon: Clock3,
    color: "bg-blue-100 text-[#0A3F61]",
    progress: 96,
  },
  {
    title: "AI Accuracy",
    value: "99.2%",
    target: "Healthy",
    icon: Sparkles,
    color: "bg-purple-100 text-purple-600",
    progress: 99,
  },
];

export default function PerformanceScorecards() {
  return (
    <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-4">

      {scorecards.map((card) => {
        const Icon = card.icon;

        return (

          <div
            key={card.title}
            className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
          >

            <div className="flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-500">
                  {card.title}
                </p>

                <h3 className="mt-2 text-3xl font-bold text-slate-900">
                  {card.value}
                </h3>

              </div>

              <div
                className={`rounded-2xl p-3 ${card.color}`}
              >
                <Icon size={22} />
              </div>

            </div>

            <div className="mt-6">

              <div className="mb-2 flex items-center justify-between text-sm">

                <span className="text-slate-500">
                  Progress
                </span>

                <span className="font-semibold text-slate-700">
                  {card.progress}%
                </span>

              </div>

              <div className="h-3 overflow-hidden rounded-full bg-slate-100">

                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#0A3F61] via-[#3495A1] to-[#EF8619]"
                  style={{
                    width: `${card.progress}%`,
                  }}
                />

              </div>

            </div>

            <div className="mt-5 rounded-2xl bg-slate-50 px-4 py-3">

              <p className="text-xs uppercase tracking-wide text-slate-400">
                Status
              </p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {card.target}
              </p>

            </div>

          </div>

        );
      })}

    </div>
  );
}