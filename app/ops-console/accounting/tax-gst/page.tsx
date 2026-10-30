"use client";

import { useCallback, useEffect, useState } from "react";
import {
  FileText,
  Percent,
  RefreshCw,
  ReceiptIndianRupee,
  ShieldCheck,
} from "lucide-react";
import {
  getPlatformAdminTaxGst,
  type PlatformAdminTaxGst,
} from "@/lib/api/platform-admin";

function money(value: number | null | undefined, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

function percent(value: number | null | undefined) {
  return `${Number(value ?? 0).toFixed(2)}%`;
}

export default function TaxGstPage() {
  const [data, setData] = useState<PlatformAdminTaxGst | null>(null);
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

      const result = await getPlatformAdminTaxGst({
        dateFrom,
        dateTo,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to load Tax/GST data",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const summary = data?.summary;
  const monthlyTax = data?.monthly_tax ?? [];
  const breakdown = data?.invoice_tax_breakdown ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5">
            <Percent className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Tax / GST
            </h1>
            <p className="text-sm text-slate-500">
              Tax visibility across invoices, payments and expenses.
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
          <p className="text-sm text-slate-500">Invoice Tax</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.invoice_tax, summary?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.taxable_invoice_count ?? 0} taxable invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Payment Tax</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.payment_tax, summary?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.taxable_payment_count ?? 0} taxable payments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expense Tax</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.expense_tax, summary?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.taxable_expense_count ?? 0} taxable expenses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Net Tax</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(
              Number(summary?.invoice_tax ?? 0) +
                Number(summary?.payment_tax ?? 0) -
                Number(summary?.expense_tax ?? 0),
              summary?.currency,
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Invoices</p>
              <p className="text-xl font-semibold text-slate-900">
                {summary?.invoice_count ?? 0}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ReceiptIndianRupee className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">Taxable Transactions</p>
              <p className="text-xl font-semibold text-slate-900">
                {(summary?.taxable_invoice_count ?? 0) +
                  (summary?.taxable_payment_count ?? 0) +
                  (summary?.taxable_expense_count ?? 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-sm text-slate-500">GST Reporting</p>
              <p className="text-xl font-semibold text-slate-900">
                Recorded Data
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Monthly Tax Trend
            </h2>
          </div>

          <div className="p-5">
            {loading ? (
              <p className="py-8 text-center text-sm text-slate-500">
                Loading...
              </p>
            ) : monthlyTax.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No tax data found.
              </p>
            ) : (
              <div className="space-y-4">
                {monthlyTax.map((item) => (
                  <div key={item.month}>
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium text-slate-700">
                        {item.month}
                      </span>
                      <span className="text-sm font-semibold text-slate-900">
                        {money(item.net_tax, summary?.currency)}
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-slate-800"
                        style={{
                          width: `${Math.min(
                            Math.max(Math.abs(Number(item.net_tax)) * 10, 0),
                            100,
                          )}%`,
                        }}
                      />
                    </div>

                    <div className="mt-2 flex gap-4 text-xs text-slate-400">
                      <span>
                        Invoice:{" "}
                        {money(item.invoice_tax, summary?.currency)}
                      </span>
                      <span>
                        Expense:{" "}
                        {money(item.expense_tax, summary?.currency)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              GST / Tax Breakdown
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Tax</th>
                  <th className="px-5 py-3">Rate</th>
                  <th className="px-5 py-3">Invoices</th>
                  <th className="px-5 py-3 text-right">Amount</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {breakdown.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-10 text-center text-slate-500"
                    >
                      No invoice tax records found.
                    </td>
                  </tr>
                ) : (
                  breakdown.map((item, index) => (
                    <tr key={`${item.tax_name}-${item.tax_percentage}-${index}`}>
                      <td className="px-5 py-4 font-medium text-slate-900">
                        {item.tax_name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {percent(item.tax_percentage)}
                      </td>
                      <td className="px-5 py-4 text-slate-600">
                        {item.invoice_count}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-slate-900">
                        {money(item.tax_amount, summary?.currency)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
        <p className="text-sm font-medium text-amber-900">
          Tax / GST reporting note
        </p>
        <p className="mt-1 text-sm leading-6 text-amber-800">
          {data?.gst_note ??
            "GST reporting uses tax amounts already recorded in the financial system."}
        </p>
      </div>
    </div>
  );
}
