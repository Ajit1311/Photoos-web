"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  LogIn,
  Search,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  getPlatformAdminUserActivity,
  type PlatformAdminUserActivity,
} from "@/lib/api/platform-admin";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function activityIcon(type: string) {
  if (type === "payment") {
    return <CreditCard size={17} />;
  }

  if (type === "subscription") {
    return <ArrowUpRight size={17} />;
  }

  if (type === "studio") {
    return <Users size={17} />;
  }

  return <LogIn size={17} />;
}

function activityLabel(type: string) {
  if (type === "payment") return "Payment";
  if (type === "subscription") return "Subscription";
  if (type === "studio") return "Studio";
  if (type === "authentication") return "Authentication";
  return type;
}

function actionLabel(row: PlatformAdminUserActivity) {
  if (row.activity_type === "authentication") {
    return "Login";
  }

  if (row.activity_type === "subscription") {
    return row.activity_action;
  }

  if (row.activity_type === "payment") {
    return row.activity_action;
  }

  return row.activity_action;
}

export default function UserActivityPage() {
  const [rows, setRows] = useState<
    PlatformAdminUserActivity[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [activityType, setActivityType] =
    useState("all");

  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);

  const [selected, setSelected] =
    useState<PlatformAdminUserActivity | null>(
      null,
    );

  const pageSize = 50;

  async function loadActivity() {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getPlatformAdminUserActivity({
          search: search.trim() || undefined,
          activityType:
            activityType === "all"
              ? undefined
              : activityType,
          limit: pageSize,
          offset: page * pageSize,
        });

      setRows(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load user activity.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadActivity();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, activityType, page]);

  const stats = useMemo(() => {
    return {
      authentication: rows.filter(
        (row) =>
          row.activity_type === "authentication",
      ).length,

      subscriptions: rows.filter(
        (row) =>
          row.activity_type === "subscription",
      ).length,

      payments: rows.filter(
        (row) =>
          row.activity_type === "payment",
      ).length,

      studios: rows.filter(
        (row) => row.activity_type === "studio",
      ).length,
    };
  }, [rows]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Activity size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                User Activity
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Monitor customer authentication,
                subscription, payment and studio activity.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 shadow-sm">
            <Calendar size={16} />
            <span>Latest platform activity</span>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Authentication"
            value={stats.authentication}
            icon={<LogIn size={18} />}
          />

          <StatCard
            label="Subscriptions"
            value={stats.subscriptions}
            icon={<ArrowUpRight size={18} />}
          />

          <StatCard
            label="Payments"
            value={stats.payments}
            icon={<CreditCard size={18} />}
          />

          <StatCard
            label="Studio Activity"
            value={stats.studios}
            icon={<Users size={18} />}
          />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => {
                  setPage(0);
                  setSearch(event.target.value);
                }}
                placeholder="Search user, email, action or activity..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={activityType}
              onChange={(event) => {
                setPage(0);
                setActivityType(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="all">
                All Activity
              </option>
              <option value="authentication">
                Authentication
              </option>
              <option value="subscription">
                Subscription
              </option>
              <option value="payment">
                Payment
              </option>
              <option value="studio">
                Studio
              </option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-semibold text-slate-900">
                  Activity Timeline
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {total.toLocaleString("en-IN")} total
                  activities
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-slate-100">
            {loading ? (
              <div className="px-6 py-16 text-center text-sm text-slate-500">
                Loading user activity...
              </div>
            ) : error ? (
              <div className="px-6 py-16 text-center text-sm text-red-600">
                {error}
              </div>
            ) : rows.length === 0 ? (
              <div className="px-6 py-16 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                  <Activity size={21} />
                </div>

                <p className="mt-3 font-semibold text-slate-900">
                  No activity found
                </p>

                <p className="mt-1 text-sm text-slate-500">
                  No activity matches the current filters.
                </p>
              </div>
            ) : (
              rows.map((row) => (
                <button
                  key={`${row.activity_type}-${row.profile_id}-${row.activity_at}-${row.subscription_id ?? row.payment_id ?? "none"}`}
                  type="button"
                  onClick={() => setSelected(row)}
                  className="flex w-full items-start gap-4 px-5 py-5 text-left transition hover:bg-slate-50"
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    {activityIcon(
                      row.activity_type,
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 md:flex-row md:items-center md:justify-between">
                      <div>
                        <span className="font-semibold text-slate-900">
                          {row.activity_title}
                        </span>

                        <span className="ml-2 inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold text-slate-600">
                          {activityLabel(
                            row.activity_type,
                          )}
                        </span>
                      </div>

                      <span className="text-xs text-slate-400">
                        {formatDate(row.activity_at)}
                      </span>
                    </div>

                    <div className="mt-1 flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <span className="flex items-center gap-1 text-sm font-medium text-slate-700">
                        <UserRound size={14} />
                        {row.user_name}
                      </span>

                      <span className="hidden text-slate-300 sm:inline">
                        •
                      </span>

                      <span className="truncate text-xs text-slate-500">
                        {row.user_email || "No email"}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-medium capitalize text-slate-500">
                      Action: {actionLabel(row)}
                    </div>
                  </div>

                  <ChevronRight
                    size={18}
                    className="mt-2 shrink-0 text-slate-300"
                  />
                </button>
              ))
            )}
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <p className="text-sm text-slate-500">
              Showing{" "}
              {total === 0
                ? 0
                : page * pageSize + 1}{" "}
              –{" "}
              {Math.min(
                (page + 1) * pageSize,
                total,
              )}{" "}
              of {total}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page === 0}
                onClick={() =>
                  setPage((value) =>
                    Math.max(0, value - 1),
                  )
                }
                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={17} />
              </button>

              <span className="px-2 text-sm text-slate-600">
                {page + 1} / {totalPages}
              </span>

              <button
                type="button"
                disabled={
                  page + 1 >= totalPages
                }
                onClick={() =>
                  setPage((value) =>
                    Math.min(
                      totalPages - 1,
                      value + 1,
                    ),
                  )
                }
                className="rounded-lg border border-slate-200 p-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={17} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/40">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Activity Details
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  {formatDate(selected.activity_at)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X size={19} />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <DetailSection title="User">
                <Detail
                  label="Name"
                  value={selected.user_name}
                />

                <Detail
                  label="Email"
                  value={selected.user_email}
                />

                <Detail
                  label="Profile ID"
                  value={selected.profile_id}
                />
              </DetailSection>

              <DetailSection title="Activity">
                <Detail
                  label="Type"
                  value={activityLabel(
                    selected.activity_type,
                  )}
                />

                <Detail
                  label="Title"
                  value={selected.activity_title}
                />

                <Detail
                  label="Action"
                  value={selected.activity_action}
                />

                <Detail
                  label="Date"
                  value={formatDate(
                    selected.activity_at,
                  )}
                />
              </DetailSection>

              <DetailSection title="References">
                <Detail
                  label="Studio ID"
                  value={selected.studio_id}
                />

                <Detail
                  label="Subscription ID"
                  value={selected.subscription_id}
                />

                <Detail
                  label="Payment ID"
                  value={selected.payment_id}
                />
              </DetailSection>

              <DetailSection title="Metadata">
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap break-all p-4 text-xs leading-5 text-slate-600">
                  {JSON.stringify(
                    selected.metadata,
                    null,
                    2,
                  )}
                </pre>
              </DetailSection>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500">
          {label}
        </p>

        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
      </div>

      <p className="mt-3 text-2xl font-bold text-slate-900">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function DetailSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-bold text-slate-900">
        {title}
      </h3>

      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {children}
      </div>
    </section>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs font-medium text-slate-500">
        {label}
      </span>

      <span className="max-w-[65%] break-all text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}
