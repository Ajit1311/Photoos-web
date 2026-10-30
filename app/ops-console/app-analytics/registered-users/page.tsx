"use client";

import { useEffect, useState } from "react";
import { RefreshCcw, Users } from "lucide-react";

import {
  getPlatformAdminAppAnalytics,
  type PlatformAdminAppAnalyticsRegisteredUsersResponse,
} from "@/lib/api/platform-admin";

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export default function RegisteredUsersPage() {
  const [data, setData] =
    useState<PlatformAdminAppAnalyticsRegisteredUsersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load(refresh = false) {
    setError(null);
    if (refresh) setRefreshing(true);
    else setLoading(true);

    try {
      const result =
        await getPlatformAdminAppAnalytics<PlatformAdminAppAnalyticsRegisteredUsersResponse>(
          "registered-users",
        );
      setData(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load users.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  if (loading) {
    return <PageState text="Loading registered users..." />;
  }

  return (
    <PageShell
      title="Registered Users"
      description="Client App users linked to an active client profile."
      icon={<Users className="h-5 w-5" />}
      onRefresh={() => void load(true)}
      refreshing={refreshing}
    >
      {error ? (
        <ErrorState message={error} onRetry={() => void load(true)} />
      ) : (
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <span className="text-sm font-semibold text-slate-900">
              {data?.count ?? 0} registered users
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                <tr>
                  <th className="px-5 py-3">User</th>
                  <th className="px-5 py-3">Studio</th>
                  <th className="px-5 py-3">Registered</th>
                  <th className="px-5 py-3">Last Seen</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(data?.users ?? []).map((user) => (
                  <tr key={`${user.profile_id}-${user.client_id}`} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">
                        {user.full_name || "Unnamed User"}
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {user.phone || user.profile_id}
                      </div>
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {user.studio_id}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(user.linked_at)}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {formatDate(user.last_seen_at)}
                    </td>
                    <td className="px-5 py-4">
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                        {user.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!data?.users.length && (
            <div className="px-5 py-12 text-center text-sm text-slate-500">
              No registered users found.
            </div>
          )}
        </div>
      )}
    </PageShell>
  );
}

function PageShell({
  title,
  description,
  icon,
  onRefresh,
  refreshing,
  children,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-7xl p-6 lg:p-8">
      <Header
        title={title}
        description={description}
        icon={icon}
        onRefresh={onRefresh}
        refreshing={refreshing}
      />
      <div className="mt-8">{children}</div>
    </div>
  );
}

function Header({
  title,
  description,
  icon,
  onRefresh,
  refreshing,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  onRefresh: () => void;
  refreshing: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] text-white">
          {icon}
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950">{title}</h1>
          <p className="mt-1 text-sm text-slate-500">{description}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={onRefresh}
        disabled={refreshing}
        className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
      >
        <RefreshCcw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
        Refresh
      </button>
    </div>
  );
}

function PageState({ text }: { text: string }) {
  return <div className="flex min-h-[calc(100vh-76px)] items-center justify-center text-sm font-medium text-slate-500">{text}</div>;
}

function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
      <div className="text-sm font-semibold text-red-800">Unable to load data</div>
      <div className="mt-1 text-sm text-red-600">{message}</div>
      <button
        type="button"
        onClick={onRetry}
        className="mt-4 rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-semibold text-white"
      >
        Retry
      </button>
    </div>
  );
}
