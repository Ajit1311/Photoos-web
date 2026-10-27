"use client";

import { useEffect, useState } from "react";
import { CalendarCheck2, RefreshCcw } from "lucide-react";
import {
  getPlatformAdminAppAnalytics,
  type PlatformAdminAppAnalyticsBookingsResponse,
} from "@/lib/api/platform-admin";

export default function BookingsPage() {
  const [data, setData] = useState<PlatformAdminAppAnalyticsBookingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    setError(null);
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      setData(await getPlatformAdminAppAnalytics<PlatformAdminAppAnalyticsBookingsResponse>("bookings"));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load bookings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <div className="flex min-h-[calc(100vh-76px)] items-center justify-center text-sm font-medium text-slate-500">Loading bookings...</div>;

  return (
    <main className="mx-auto max-w-7xl p-6 lg:p-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white"><CalendarCheck2 className="h-5 w-5" /></div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950">Bookings</h1>
            <p className="mt-1 text-sm text-slate-500">Client App booking activity and recorded booking data.</p>
          </div>
        </div>
        <button type="button" onClick={() => void load(true)} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
      </div>

      {error ? (
        <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Metric title="Bookings (30d)" value={data?.period_count ?? 0} />
            <Metric title="Total Bookings" value={data?.total_count ?? 0} />
          </div>

          <div className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1100px] w-full text-sm">
                <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <tr>
                    <th className="px-5 py-3">Booking</th>
                    <th className="px-5 py-3">Event</th>
                    <th className="px-5 py-3">Date</th>
                    <th className="px-5 py-3">Location</th>
                    <th className="px-5 py-3">Status</th>
                    <th className="px-5 py-3">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(data?.bookings ?? []).map((b) => (
                    <tr key={b.id} className="hover:bg-slate-50">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">{b.booking_number}</div>
                        <div className="text-xs text-slate-400">{b.title}</div>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{b.event_type}</td>
                      <td className="px-5 py-4 text-slate-600">{b.event_date || "—"}</td>
                      <td className="px-5 py-4 text-slate-600">{[b.city, b.state].filter(Boolean).join(", ") || "—"}</td>
                      <td className="px-5 py-4"><span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">{b.status}</span></td>
                      <td className="px-5 py-4 font-semibold text-slate-900">{b.total_amount == null ? "—" : `${b.currency || ""} ${b.total_amount}`}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {!data?.bookings.length && <div className="px-5 py-12 text-center text-sm text-slate-500">No bookings found.</div>}
          </div>
        </>
      )}
    </main>
  );
}

function Metric({ title, value }: { title: string; value: number }) {
  return <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"><div className="text-xs font-medium text-slate-500">{title}</div><div className="mt-1 text-2xl font-bold text-slate-950">{new Intl.NumberFormat("en-IN").format(value)}</div></div>;
}
