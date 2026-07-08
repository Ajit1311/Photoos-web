import {
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

export default function RevenueCard() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">

      <div className="flex items-start justify-between">

        <div>

          <p className="text-sm font-medium text-slate-500">
            Monthly Revenue
          </p>

          <h2 className="mt-3 text-5xl font-bold text-slate-900">
            ₹28.4L
          </h2>

          <div className="mt-5 flex items-center gap-2">

            <div className="rounded-full bg-green-100 p-1.5">
              <TrendingUp
                size={14}
                className="text-green-600"
              />
            </div>

            <span className="font-medium text-green-600">
              +18.4%
            </span>

            <span className="text-slate-500">
              vs last month
            </span>

          </div>

        </div>

        <button className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">
          <ArrowUpRight size={22} />
        </button>

      </div>

      <div className="mt-8">

        <div className="h-3 overflow-hidden rounded-full bg-slate-100">

          <div className="h-full w-[72%] rounded-full bg-gradient-to-r from-[#0A3F61] to-[#3495A1]" />

        </div>

        <div className="mt-3 flex justify-between text-sm text-slate-500">

          <span>Target</span>

          <span>72%</span>

        </div>

      </div>

    </div>
  );
}