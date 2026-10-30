"use client";

import { useQuery } from "@tanstack/react-query";
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  CalendarDays,
  IndianRupee,
  RefreshCw,
  Receipt,
  Wallet,
} from "lucide-react";
import { useMemo, useState } from "react";
import {
  getPlatformAdminSalesRevenue,
} from "@/lib/api/platform-admin";

function money(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value);
}

export default function SalesRevenuePage() {
  const today = new Date().toISOString().slice(0, 10);

  const [dateFrom, setDateFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });

  const [dateTo, setDateTo] = useState(today);

  const query = useQuery({
    queryKey: ["platform-admin-sales-revenue", dateFrom, dateTo],
    queryFn: () =>
      getPlatformAdminSalesRevenue({
        dateFrom,
        dateTo,
      }),
    staleTime: 30_000,
  });

  const data = query.data;
  const summary = data?.summary;

  const maxDailyRevenue = useMemo(
    () =>
      Math.max(
        ...(data?.daily_revenue?.map((item) => item.revenue) ?? [0]),
        1,
      ),
    [data],
  );

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            <h1 className="text-2xl font-semibold">Sales / Revenue</h1>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            Platform-wide completed incoming payment revenue analytics.
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
          Failed to load Sales / Revenue data.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Gross Revenue
            </span>
            <ArrowUpRight className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.gross_revenue ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Total Revenue
            </span>
            <IndianRupee className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.total_revenue ?? 0, summary?.currency)}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Payments
            </span>
            <Receipt className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {summary?.payment_count ?? 0}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              Average Payment
            </span>
            <Wallet className="h-5 w-5" />
          </div>
          <div className="mt-3 text-2xl font-semibold">
            {money(summary?.average_payment ?? 0, summary?.currency)}
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-5 xl:col-span-2">
          <div className="mb-5">
            <h2 className="font-semibold">Daily Revenue</h2>
            <p className="text-sm text-muted-foreground">
              Completed incoming payments by payment date.
            </p>
          </div>

          <div className="space-y-4">
            {data?.daily_revenue?.length ? (
              data.daily_revenue.map((item) => (
                <div key={item.date}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span>{item.date}</span>
                    <span className="font-medium">
                      {money(item.revenue, summary?.currency)}
                    </span>
                  </div>

                  <div className="h-3 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-foreground"
                      style={{
                        width: `${Math.max(
                          (item.revenue / maxDailyRevenue) * 100,
                          2,
                        )}%`,
                      }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No revenue found for this period.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Payment Methods</h2>
          <p className="mb-5 text-sm text-muted-foreground">
            Revenue distribution by payment method.
          </p>

          <div className="space-y-4">
            {data?.payment_methods?.length ? (
              data.payment_methods.map((item) => (
                <div
                  key={item.method}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <div className="font-medium uppercase">
                      {item.method}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {item.payment_count} payment
                      {item.payment_count === 1 ? "" : "s"}
                    </div>
                  </div>
                  <div className="font-semibold">
                    {money(item.revenue, summary?.currency)}
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

      <div className="rounded-xl border bg-card p-5">
        <div className="mb-5">
          <h2 className="font-semibold">Revenue by Studio</h2>
          <p className="text-sm text-muted-foreground">
            Platform revenue contribution by studio.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="border-b text-left text-muted-foreground">
                <th className="px-3 py-3">Studio</th>
                <th className="px-3 py-3">Payments</th>
                <th className="px-3 py-3">Revenue</th>
                <th className="px-3 py-3">Tax</th>
                <th className="px-3 py-3">Total</th>
              </tr>
            </thead>

            <tbody>
              {data?.studios?.map((studio) => (
                <tr key={studio.studio_id} className="border-b last:border-0">
                  <td className="px-3 py-3 font-medium">
                    {studio.studio_name}
                  </td>
                  <td className="px-3 py-3">
                    {studio.payment_count}
                  </td>
                  <td className="px-3 py-3">
                    {money(studio.revenue, summary?.currency)}
                  </td>
                  <td className="px-3 py-3">
                    {money(studio.tax, summary?.currency)}
                  </td>
                  <td className="px-3 py-3 font-semibold">
                    {money(studio.total, summary?.currency)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
