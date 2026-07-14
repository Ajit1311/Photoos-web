import {
  Target,
  TrendingUp,
} from "lucide-react";

export default function RevenueGoal() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Revenue Goal
          </h2>

          <p className="mt-2 text-slate-500">
            Track your monthly target progress.
          </p>

        </div>

        <div className="rounded-2xl bg-green-100 p-4 text-green-600">

          <Target size={24} />

        </div>

      </div>

      <div className="mt-8">

        <div className="mb-3 flex items-center justify-between">

          <span className="text-sm font-medium text-slate-600">
            Monthly Progress
          </span>

          <span className="font-bold text-[#0A3F61]">
            72%
          </span>

        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-200">

          <div className="h-full w-[72%] rounded-full bg-[#0A3F61]" />

        </div>

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            Target Revenue
          </p>

          <h3 className="mt-2 text-3xl font-bold text-slate-900">
            ₹18,00,000
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            Achieved
          </p>

          <h3 className="mt-2 text-3xl font-bold text-green-600">
            ₹12,96,000
          </h3>

        </div>

      </div>

      <div className="mt-6 flex items-start gap-4 rounded-2xl bg-green-50 p-5">

        <TrendingUp
          size={22}
          className="mt-1 text-green-600"
        />

        <div>

          <h3 className="font-semibold text-green-700">
            Excellent Progress
          </h3>

          <p className="mt-1 text-sm leading-6 text-green-600">
            You&apos;re on track to achieve your monthly revenue target based on the current business performance.
          </p>

        </div>

      </div>

    </section>
  );
}