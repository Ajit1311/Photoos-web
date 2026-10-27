"use client";

import { useCallback, useEffect, useState } from "react";
import {
  BarChart3,
  FileText,
  RefreshCw,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import {
  getPlatformAdminFinancialReports,
  type PlatformAdminFinancialReports,
} from "@/lib/api/platform-admin";

function money(value: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function dateLabel(value: string | null | undefined) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export default function FinancialReportsPage() {
  const [data, setData] =
    useState<PlatformAdminFinancialReports | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 29);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(() =>
    new Date().toISOString().slice(0, 10),
  );

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");

      const result = await getPlatformAdminFinancialReports({
        dateFrom,
        dateTo,
        limit: 50,
        offset: 0,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load financial reports",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary;
  const reports = data?.reports ?? [];
  const monthly = data?.monthly_summary ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5">
            <BarChart3 className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Financial Reports
            </h1>
            <p className="text-sm text-slate-500">
              Revenue, expenses, profit and tax reporting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
          />
          Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              From
            </label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-slate-500">
              To
            </label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
            />
          </div>

          <div className="flex items-end">
            <button
              type="button"
              onClick={() => void loadData()}
              className="w-full rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Apply Period
            </button>
          </div>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Revenue</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.total_revenue, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expenses</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.total_expenses, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Profit</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {money(summary?.total_profit, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tax</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.total_tax, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Reports</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {summary?.report_count ?? 0}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Monthly Financial Summary
            </h2>
          </div>

          <div className="p-5">
            {monthly.length === 0 ? (
              <p className="py-10 text-center text-sm text-slate-500">
                No financial report data found.
              </p>
            ) : (
              <div className="space-y-5">
                {monthly.map((item) => (
                  <div key={item.month}>
                    <div className="mb-3 flex items-center justify-between">
                      <span className="font-medium text-slate-700">
                        {item.month}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {money(item.profit, summary?.currency)}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-400">Revenue</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {money(item.revenue, summary?.currency)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-400">Expenses</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {money(item.expenses, summary?.currency)}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-slate-400">Tax</p>
                        <p className="mt-1 font-medium text-slate-700">
                          {money(item.tax, summary?.currency)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingUp className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-sm text-slate-500">
              Total Revenue
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {money(summary?.total_revenue, summary?.currency)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <TrendingDown className="h-5 w-5 text-red-500" />
            <p className="mt-4 text-sm text-slate-500">
              Total Expenses
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {money(summary?.total_expenses, summary?.currency)}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <FileText className="h-5 w-5 text-slate-500" />
            <p className="mt-4 text-sm text-slate-500">
              Report Records
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {summary?.report_count ?? 0}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <BarChart3 className="h-5 w-5 text-slate-500" />
            <p className="mt-4 text-sm text-slate-500">
              Total Profit
            </p>
            <p className="mt-1 text-xl font-semibold text-emerald-700">
              {money(summary?.total_profit, summary?.currency)}
            </p>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Financial Report Ledger
          </h2>

          <span className="text-sm text-slate-500">
            {data?.total ?? 0} records
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Report</th>
                <th className="px-5 py-3">Period</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-right">Revenue</th>
                <th className="px-5 py-3 text-right">Expenses</th>
                <th className="px-5 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right">Profit</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    Loading financial reports...
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No financial reports found.
                  </td>
                </tr>
              ) : (
                reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <p className="font-medium text-slate-900">
                        {report.report_number}
                      </p>
                      <p className="text-xs text-slate-500">
                        {report.title}
                      </p>
                    </td>

                    <td className="px-5 py-4 text-slate-600">
                      {dateLabel(report.start_date)} —{" "}
                      {dateLabel(report.end_date)}
                    </td>

                    <td className="px-5 py-4">
                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                        {report.status.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      {money(report.total_revenue, report.currency)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {money(report.total_expenses, report.currency)}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {money(report.total_tax, report.currency)}
                    </td>

                    <td className="px-5 py-4 text-right font-semibold text-emerald-700">
                      {money(report.total_profit, report.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
