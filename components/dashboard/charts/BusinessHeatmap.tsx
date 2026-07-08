import ChartCard from "./ChartCard";

const heatmap = [
  [2, 4, 3, 5, 6, 8, 4],
  [5, 8, 7, 9, 8, 10, 6],
  [3, 6, 5, 8, 9, 10, 7],
  [1, 3, 5, 7, 8, 9, 5],
  [4, 5, 8, 10, 9, 8, 6],
];

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getColor(value: number) {
  if (value <= 2) return "bg-slate-100";
  if (value <= 4) return "bg-sky-100";
  if (value <= 6) return "bg-sky-300";
  if (value <= 8) return "bg-[#3495A1]";
  return "bg-[#0A3F61]";
}

export default function BusinessHeatmap() {
  return (
    <ChartCard
      title="Business Heatmap"
      subtitle="Studio activity for the last 5 weeks"
      actionLabel="Full Report"
    >
      <div className="space-y-5">

        <div className="flex justify-between px-10 text-xs font-medium text-slate-500">

          {days.map((day) => (
            <span key={day}>{day}</span>
          ))}

        </div>

        <div className="space-y-3">

          {heatmap.map((week, index) => (

            <div
              key={index}
              className="flex items-center gap-3"
            >

              <span className="w-8 text-xs font-medium text-slate-400">
                W{index + 1}
              </span>

              <div className="flex gap-3">

                {week.map((value, i) => (

                  <div
                    key={i}
                    className={`h-10 w-10 rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-md ${getColor(
                      value
                    )}`}
                  />

                ))}

              </div>

            </div>

          ))}

        </div>

        <div className="flex items-center justify-between border-t border-slate-100 pt-5">

          <div>

            <p className="text-sm font-semibold text-slate-900">
              Peak Activity
            </p>

            <p className="mt-1 text-sm text-slate-500">
              Friday & Saturday generate the highest bookings.
            </p>

          </div>

          <div className="flex items-center gap-2">

            <span className="text-xs text-slate-400">
              Low
            </span>

            <div className="flex gap-1">

              <div className="h-4 w-4 rounded bg-slate-100" />
              <div className="h-4 w-4 rounded bg-sky-100" />
              <div className="h-4 w-4 rounded bg-sky-300" />
              <div className="h-4 w-4 rounded bg-[#3495A1]" />
              <div className="h-4 w-4 rounded bg-[#0A3F61]" />

            </div>

            <span className="text-xs text-slate-400">
              High
            </span>

          </div>

        </div>

      </div>
    </ChartCard>
  );
}