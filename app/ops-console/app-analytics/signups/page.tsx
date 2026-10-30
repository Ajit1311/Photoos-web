"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, UserPlus } from "lucide-react";
import {
  getPlatformAdminAppAnalytics,
  type PlatformAdminAppAnalyticsSignupsResponse,
} from "@/lib/api/platform-admin";

function date(v: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(v));
}

export default function SignupsPage() {
  const [data, setData] = useState<PlatformAdminAppAnalyticsSignupsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    setError(null);
    refresh ? setRefreshing(true) : setLoading(true);
    try {
      setData(await getPlatformAdminAppAnalytics<PlatformAdminAppAnalyticsSignupsResponse>("signups"));
    } catch (e: unknown) {
      setError("Unable to load sign-ups.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => { void load(); }, []);

  if (loading) return <State text="Loading sign-ups..." />;

  return (
    <main className="mx-auto max-w-7xl p-6 lg:p-8">
      <Header onRefresh={() => void load(true)} refreshing={refreshing} />
      {error ? <Error message={error} retry={() => void load(true)} /> : (
        <section className="mt-8 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <span className="text-sm font-semibold text-slate-900">{data?.count ?? 0} sign-ups in the last 30 days</span>
          </div>
          <div className="divide-y divide-slate-100">
            {(data?.users ?? []).map((u) => (
              <div key={`${u.profile_id}-${u.signed_up_at}`} className="flex flex-col gap-2 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="font-semibold text-slate-900">{u.full_name || "Unnamed User"}</div>
                  <div className="text-xs text-slate-400">{u.phone || u.profile_id}</div>
                </div>
                <div className="text-sm text-slate-500">{date(u.signed_up_at)}</div>
              </div>
            ))}
          </div>
          {!data?.users.length && <div className="px-5 py-12 text-center text-sm text-slate-500">No sign-ups found.</div>}
        </section>
      )}
    </main>
  );
}

function Header({ onRefresh, refreshing }: { onRefresh: () => void; refreshing: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white"><UserPlus className="h-5 w-5" /></div>
        <div><h1 className="text-2xl font-bold tracking-tight text-slate-950">Sign-ups</h1><p className="mt-1 text-sm text-slate-500">New Client App users registered in the last 30 days.</p></div>
      </div>
      <button type="button" onClick={onRefresh} disabled={refreshing} className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm disabled:opacity-60"><RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />Refresh</button>
    </div>
  );
}

function State({ text }: { text: string }) { return <div className="flex min-h-[calc(100vh-76px)] items-center justify-center text-sm font-medium text-slate-500">{text}</div>; }
function Error({ message, retry }: { message: string; retry: () => void }) { return <div className="mt-8 rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{message}<button onClick={retry} className="ml-4 rounded-lg bg-[#0A3F61] px-3 py-1.5 text-white">Retry</button></div>; }
