"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Landmark,
  Percent,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  getPlatformAdminTds,
  type PlatformAdminTds,
} from "@/lib/api/platform-admin";

function money(value: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export default function TdsPage() {
  const [data, setData] = useState<PlatformAdminTds | null>(null);
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

      const result = await getPlatformAdminTds({
        dateFrom,
        dateTo,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load TDS data",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary;
  const sourceTax = data?.source_tax_data;
  const monthly = data?.monthly_tds ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5">
            <Percent className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              TDS
            </h1>
            <p className="text-sm text-slate-500">
              TDS deduction, deposit and payable reporting.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">TDS Recorded</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.tds_recorded, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">TDS Deducted</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.tds_deducted, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">TDS Deposited</p>
          <p className="mt-2 text-2xl font-semibold text-emerald-700">
            {money(summary?.tds_deposited, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">TDS Payable</p>
          <p className="mt-2 text-2xl font-semibold text-amber-700">
            {money(summary?.tds_payable, summary?.currency)}
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <Landmark className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">TDS Credit</p>
              <p className="text-xl font-semibold text-slate-900">
                {money(summary?.tds_credit, summary?.currency)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Transactions</p>
              <p className="text-xl font-semibold text-slate-900">
                {summary?.transaction_count ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">TDS Ledger</p>
              <p className="text-xl font-semibold text-slate-900">
                Not Configured
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Monthly TDS Summary
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[750px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Month</th>
                <th className="px-5 py-3 text-right">Recorded</th>
                <th className="px-5 py-3 text-right">Deducted</th>
                <th className="px-5 py-3 text-right">Deposited</th>
                <th className="px-5 py-3 text-right">Payable</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {monthly.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center text-slate-500"
                  >
                    No TDS records found.
                  </td>
                </tr>
              ) : (
                monthly.map((item) => (
                  <tr key={item.month} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.month}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {money(item.tds_recorded, summary?.currency)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {money(item.tds_deducted, summary?.currency)}
                    </td>
                    <td className="px-5 py-4 text-right text-emerald-700">
                      {money(item.tds_deposited, summary?.currency)}
                    </td>
                    <td className="px-5 py-4 text-right text-amber-700">
                      {money(item.tds_payable, summary?.currency)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recorded Invoice Tax</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {money(sourceTax?.invoice_tax, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recorded Payment Tax</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {money(sourceTax?.payment_tax, summary?.currency)}
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Recorded Expense Tax</p>
          <p className="mt-2 text-xl font-semibold text-slate-900">
            {money(sourceTax?.expense_tax, summary?.currency)}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-900">
          TDS reporting note
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          {data?.tds_note ??
            "No dedicated TDS ledger is currently configured. TDS amounts are not inferred from GST or other tax amounts."}
        </p>
      </div>
    </div>
  );
}
