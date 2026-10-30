"use client";

import { useQuery } from "@tanstack/react-query";
import {
  BarChart3,
  CalendarDays,
  CheckCircle2,
  IndianRupee,
  Receipt,
  RefreshCw,
  Wallet,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  getPlatformAdminPurchaseExpenses,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function PurchaseExpensesPage() {
  const today = new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(today);

  const query = useQuery({
    queryKey: ["platform-admin-purchase-expenses", dateFrom, dateTo],
    queryFn: () =>
      getPlatformAdminPurchaseExpenses({
        dateFrom,
        dateTo,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  const maxDaily = useMemo(
    () =>
      Math.max(
        ...(data?.daily_expenses?.map((item) => item.total) ?? [0]),
        1,
      ),
    [data],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Wallet className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">
              Purchase / Expenses
            </h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide purchase and expense analytics.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-lg border px-3 py-2">
            <CalendarDays className="h-4 w-4" />

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />

            <span className="text-muted-foreground">to</span>

            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="bg-transparent text-sm outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => query.refetch()}
            className="inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm hover:bg-muted"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                query.isFetching ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </div>

      {query.isError && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
          Failed to load Purchase / Expenses data.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total Expenses
            </span>
            <IndianRupee className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.total_expenses ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Expense Amount
            </span>
            <BarChart3 className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.expense_amount ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Tax
            </span>
            <Receipt className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.tax_amount ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Expense Count
            </span>
            <Wallet className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {summary?.expense_count ?? 0}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Expense Status</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Current expense workflow distribution.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {data?.statuses?.length ? (
              data.statuses.map((item) => (
                <div
                  key={item.status}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-2">
                    {item.status === "paid" ||
                    item.status === "approved" ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : item.status === "rejected" ||
                      item.status === "cancelled" ? (
                      <XCircle className="h-4 w-4" />
                    ) : (
                      <Receipt className="h-4 w-4" />
                    )}

                    <span className="font-medium capitalize">
                      {item.status}
                    </span>
                  </div>

                  <span className="font-semibold">
                    {money(item.total, summary?.currency)}
                  </span>
                </div>
              ))
            ) : (
              <div className="col-span-full py-10 text-center text-sm text-muted-foreground">
                No expenses found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Payment Methods</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Expense distribution by payment method.
          </p>

          <div className="space-y-3">
            {data?.payment_methods?.length ? (
              data.payment_methods.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <span className="font-medium uppercase">
                    {item.method}
                  </span>

                  <div className="text-right">
                    <div className="font-semibold">
                      {money(item.total, summary?.currency)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.expense_count} expense
                      {item.expense_count === 1 ? "" : "s"}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No payment methods found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Daily Expenses</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Expense trend by date.
          </p>

          <div className="space-y-4">
            {data?.daily_expenses?.length ? (
              data.daily_expenses.map((item) => (
                <div key={item.date}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.date}</span>
                    <span className="font-medium">
                      {money(item.total, summary?.currency)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{
                        width: `${Math.max(
                          (item.total / maxDaily) * 100,
                          2,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No daily expenses found.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Expense Categories</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Purchase and expense distribution by category.
          </p>

          <div className="space-y-3">
            {data?.categories?.length ? (
              data.categories.map((item) => (
                <div
                  key={item.category}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium">
                      {item.category}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.expense_count} expense
                      {item.expense_count === 1 ? "" : "s"}
                    </div>
                  </div>

                  <span className="font-semibold">
                    {money(item.total, summary?.currency)}
                  </span>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No categories found.
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5">
        <h2 className="font-semibold">Expenses by Studio</h2>
        <p className="mb-5 text-sm text-muted-foreground">
          Purchase and expense contribution by studio.
        </p>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-3">Studio</th>
                <th className="px-3 py-3">Expenses</th>
                <th className="px-3 py-3">Amount</th>
                <th className="px-3 py-3">Tax</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {data?.studios?.map((studio) => (
                <tr
                  key={studio.studio_id}
                  className="border-b last:border-0"
                >
                  <td className="px-3 py-3 font-medium">
                    {studio.studio_name}
                  </td>
                  <td className="px-3 py-3">
                    {studio.expense_count}
                  </td>
                  <td className="px-3 py-3">
                    {money(studio.amount, summary?.currency)}
                  </td>
                  <td className="px-3 py-3">
                    {money(studio.tax, summary?.currency)}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {money(studio.total, summary?.currency)}
                  </td>
                </tr>
              ))}

              {!data?.studios?.length && (
                <tr>
                  <td
                    colSpan={5}
                    className="py-10 text-center text-sm text-muted-foreground"
                  >
                    No studio expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
