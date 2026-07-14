import {
  TrendingUp,
  DollarSign,
} from "lucide-react";

export default function RevenueAnalytics() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <h2 className="text-2xl font-bold text-slate-900">
            Revenue Analytics
          </h2>

          <p className="mt-2 text-slate-500">
            Monthly business performance overview.
          </p>

        </div>

        <div className="rounded-2xl bg-green-100 p-4 text-green-600">

          <TrendingUp size={24} />

        </div>

      </div>

      <div className="mt-8 flex h-72 items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50">

        <div className="text-center">

          <DollarSign
            size={40}
            className="mx-auto text-slate-400"
          />

          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            Revenue Chart
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            ApexCharts will be integrated during backend connection.
          </p>

        </div>

      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            Today
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            ₹48,500
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            This Month
          </p>

          <h3 className="mt-2 text-2xl font-bold text-slate-900">
            ₹12.8L
          </h3>

        </div>

        <div className="rounded-2xl bg-slate-50 p-5">

          <p className="text-sm text-slate-500">
            Growth
          </p>

          <h3 className="mt-2 text-2xl font-bold text-green-600">
            +18%
          </h3>

        </div>

      </div>

    </section>
  );
}