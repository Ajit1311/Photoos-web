"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Download,
  FileSpreadsheet,
  FileText,
  RefreshCw,
  ShieldCheck,
} from "lucide-react";
import {
  getPlatformAdminCaItrExport,
  type PlatformAdminCaItrExport,
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

export default function CaItrExportPage() {
  const [data, setData] = useState<PlatformAdminCaItrExport | null>(null);
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
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

      const result = await getPlatformAdminCaItrExport({
        dateFrom,
        dateTo,
      });

      setData(result);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to load CA / ITR export data",
      );
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const downloadJson = () => {
    if (!data) return;

    try {
      setExporting(true);

      const blob = new Blob(
        [JSON.stringify(data, null, 2)],
        { type: "application/json" },
      );

      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");

      anchor.href = url;
      anchor.download = `photoos-ca-itr-export-${dateFrom}-to-${dateTo}.json`;

      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    } finally {
      setExporting(false);
    }
  };

  const summary = data?.summary;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-slate-100 p-2.5">
            <FileSpreadsheet className="h-5 w-5 text-slate-700" />
          </div>

          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              CA / ITR Export
            </h1>
            <p className="text-sm text-slate-500">
              Accounting data package for CA review and ITR preparation.
            </p>
          </div>
        </div>

        <div className="flex gap-2">
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

          <button
            type="button"
            onClick={downloadJson}
            disabled={!data || exporting}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Export JSON
          </button>
        </div>
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
              Generate Export Data
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
          <p className="text-sm text-slate-500">Payment Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.payment_amount, data?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.payment_count ?? 0} completed payments
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Invoice Total</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.invoice_total, data?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.invoice_count ?? 0} invoices
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Expense Amount</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(summary?.expense_amount, data?.currency)}
          </p>
          <p className="mt-1 text-xs text-slate-400">
            {summary?.expense_count ?? 0} expenses
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500">Tax Recorded</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {money(
              Number(summary?.payment_tax ?? 0) +
                Number(summary?.expense_tax ?? 0) +
                Number(summary?.invoice_tax ?? 0),
              data?.currency,
            )}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center gap-3">
            <FileText className="h-5 w-5 text-slate-500" />
            <div>
              <h2 className="font-semibold text-slate-900">
                Export Summary
              </h2>
              <p className="text-sm text-slate-500">
                {data?.date_from ?? dateFrom} —{" "}
                {data?.date_to ?? dateTo}
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-500">Payments</span>
              <span className="font-medium">
                {summary?.payment_count ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Invoices</span>
              <span className="font-medium">
                {summary?.invoice_count ?? 0}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-500">Expenses</span>
              <span className="font-medium">
                {summary?.expense_count ?? 0}
              </span>
            </div>

            <div className="flex justify-between border-t border-slate-100 pt-3">
              <span className="font-medium text-slate-700">
                Payment Tax
              </span>
              <span>
                {money(summary?.payment_tax, data?.currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-slate-700">
                Expense Tax
              </span>
              <span>
                {money(summary?.expense_tax, data?.currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="font-medium text-slate-700">
                Invoice Tax
              </span>
              <span>
                {money(summary?.invoice_tax, data?.currency)}
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
          <div className="flex items-center gap-3">
            <ShieldCheck className="h-5 w-5 text-emerald-700" />
            <h2 className="font-semibold text-emerald-900">
              CA / ITR Ready Data
            </h2>
          </div>

          <p className="mt-4 text-sm leading-6 text-emerald-800">
            The export contains financial records currently stored in
            PhotoOS for the selected period. It can be provided to a CA
            for review and preparation.
          </p>

          <div className="mt-4 rounded-xl border border-emerald-200 bg-white/70 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">
              Important
            </p>
            <p className="mt-1 text-sm text-emerald-800">
              This export is not an ITR filing, tax certification or
              statutory filing calculation.
            </p>
          </div>

          <button
            type="button"
            onClick={downloadJson}
            disabled={!data || exporting}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-800 disabled:opacity-50"
          >
            <Download className="h-4 w-4" />
            Download Accounting Export
          </button>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="font-semibold text-slate-900">
            Payments Included
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Payment #</th>
                <th className="px-5 py-3">Date</th>
                <th className="px-5 py-3">Method</th>
                <th className="px-5 py-3">Type</th>
                <th className="px-5 py-3 text-right">Amount</th>
                <th className="px-5 py-3 text-right">Tax</th>
                <th className="px-5 py-3 text-right">Total</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    Loading export data...
                  </td>
                </tr>
              ) : (data?.payments ?? []).length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-500">
                    No payments found.
                  </td>
                </tr>
              ) : (
                data!.payments.map((payment) => (
                  <tr key={payment.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4 font-medium text-slate-900">
                      #{payment.payment_number}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {dateLabel(payment.payment_date)}
                    </td>
                    <td className="px-5 py-4 uppercase text-slate-600">
                      {payment.payment_method}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {payment.payment_type.replaceAll("_", " ")}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {money(payment.amount, payment.currency)}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {money(payment.tax_amount, payment.currency)}
                    </td>
                    <td className="px-5 py-4 text-right font-medium">
                      {money(payment.total_amount, payment.currency)}
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
