"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Ban,
  CalendarX2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Search,
  X,
} from "lucide-react";

import {
  getPlatformAdminCancelledSubscriptions,
  type PlatformAdminCancelledSubscription,
} from "@/lib/api/platform-admin";

function formatDate(value: string | null) {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatMoney(
  value: number | null,
  currency: string | null,
) {
  if (value == null) return "—";

  try {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return `₹${value}`;
  }
}

export default function CancelledSubscriptionsPage() {
  const [rows, setRows] = useState<
    PlatformAdminCancelledSubscription[]
  >([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [planCode, setPlanCode] = useState("");
  const [billingCycle, setBillingCycle] = useState("");

  const [page, setPage] = useState(0);

  const [total, setTotal] = useState(0);

  const [selected, setSelected] =
    useState<PlatformAdminCancelledSubscription | null>(null);

  const pageSize = 50;

  async function loadCancelled() {
    try {
      setLoading(true);
      setError(null);

      const result =
        await getPlatformAdminCancelledSubscriptions({
          search: search.trim() || undefined,
          planCode: planCode || undefined,
          billingCycle: billingCycle || undefined,
          limit: pageSize,
          offset: page * pageSize,
        });

      setRows(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load cancelled subscriptions.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadCancelled();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, planCode, billingCycle, page]);

  const summary = useMemo(() => {
    const monthly = rows.filter(
      (row) => row.billing_cycle === "monthly",
    ).length;

    const yearly = rows.filter(
      (row) => row.billing_cycle === "yearly",
    ).length;

    return {
      visible: rows.length,
      monthly,
      yearly,
    };
  }, [rows]);

  const totalPages = Math.max(
    1,
    Math.ceil(total / pageSize),
  );

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Ban size={22} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                Cancelled Subscriptions
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review subscriptions cancelled by studios or
                through the subscription lifecycle.
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Cancelled"
            value={total}
            icon={<Ban size={19} />}
          />

          <StatCard
            label="Visible Records"
            value={summary.visible}
            icon={<CalendarX2 size={19} />}
          />

          <StatCard
            label="Monthly"
            value={summary.monthly}
            icon={<CreditCard size={19} />}
          />

          <StatCard
            label="Yearly"
            value={summary.yearly}
            icon={<CalendarX2 size={19} />}
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
                placeholder="Search studio, owner, email or subscription ID..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-slate-400 focus:bg-white"
              />
            </div>

            <select
              value={planCode}
              onChange={(event) => {
                setPage(0);
                setPlanCode(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">All Plans</option>
              <option value="business_starter_monthly">
                Business Starter
              </option>
              <option value="business_pro_monthly">
                Business Pro
              </option>
              <option value="enterprise_monthly">
                Enterprise
              </option>
            </select>

            <select
              value={billingCycle}
              onChange={(event) => {
                setPage(0);
                setBillingCycle(event.target.value);
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none"
            >
              <option value="">All Billing</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1100px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  <Th>Studio</Th>
                  <Th>Owner</Th>
                  <Th>Plan</Th>
                  <Th>Billing</Th>
                  <Th>Status</Th>
                  <Th>Last Payment</Th>
                  <Th>Updated</Th>
                  <Th>Action</Th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-sm text-slate-500"
                    >
                      Loading cancelled subscriptions...
                    </td>
                  </tr>
                ) : error ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center text-sm text-red-600"
                    >
                      {error}
                    </td>
                  </tr>
                ) : rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-16 text-center"
                    >
                      <div className="mx-auto max-w-md">
                        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                          <CalendarX2 size={22} />
                        </div>

                        <p className="font-semibold text-slate-900">
                          No cancelled subscriptions
                        </p>

                        <p className="mt-1 text-sm text-slate-500">
                          No cancelled studio software
                          subscriptions match the current filters.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  rows.map((row) => (
                    <tr
                      key={row.subscription_id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {row.studio_name || "Unnamed Studio"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {row.studio_code || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-800">
                          {row.owner_name || "—"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {row.owner_email ||
                            row.studio_email ||
                            "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-semibold text-slate-800">
                          {row.plan_name || row.plan_code}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {formatMoney(
                            row.plan_price,
                            row.plan_currency,
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <span className="capitalize text-sm text-slate-700">
                          {row.billing_cycle || "—"}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span className="inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                          Cancelled
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm text-slate-700">
                          {row.last_payment_status || "—"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {formatDate(row.last_payment_at)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(row.updated_at)}
                      </td>

                      <td className="px-5 py-4">
                        <button
                          type="button"
                          onClick={() => setSelected(row)}
                          className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
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
                disabled={page + 1 >= totalPages}
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
                  Cancelled Subscription
                </h2>

                <p className="mt-1 break-all text-xs text-slate-500">
                  {selected.subscription_id}
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
              <DetailSection title="Studio">
                <Detail
                  label="Studio"
                  value={selected.studio_name}
                />
                <Detail
                  label="Studio Code"
                  value={selected.studio_code}
                />
                <Detail
                  label="Email"
                  value={selected.studio_email}
                />
                <Detail
                  label="Phone"
                  value={selected.studio_phone}
                />
              </DetailSection>

              <DetailSection title="Owner">
                <Detail
                  label="Name"
                  value={selected.owner_name}
                />
                <Detail
                  label="Email"
                  value={selected.owner_email}
                />
                <Detail
                  label="Employee Code"
                  value={selected.owner_employee_code}
                />
              </DetailSection>

              <DetailSection title="Plan">
                <Detail
                  label="Plan"
                  value={selected.plan_name}
                />
                <Detail
                  label="Plan Code"
                  value={selected.plan_code}
                />
                <Detail
                  label="Billing"
                  value={selected.billing_cycle}
                />
                <Detail
                  label="Price"
                  value={formatMoney(
                    selected.plan_price,
                    selected.plan_currency,
                  )}
                />
              </DetailSection>

              <DetailSection title="Cancellation">
                <Detail
                  label="Status"
                  value={selected.subscription_status}
                />
                <Detail
                  label="Subscription Start"
                  value={formatDate(
                    selected.subscription_start_at,
                  )}
                />
                <Detail
                  label="Subscription End"
                  value={formatDate(
                    selected.subscription_end_at,
                  )}
                />
                <Detail
                  label="Last Updated"
                  value={formatDate(
                    selected.updated_at,
                  )}
                />
                <Detail
                  label="Auto Renew"
                  value={
                    selected.auto_renew == null
                      ? "—"
                      : selected.auto_renew
                        ? "Enabled"
                        : "Disabled"
                  }
                />
              </DetailSection>

              <DetailSection title="Payment">
                <Detail
                  label="Provider"
                  value={selected.payment_provider}
                />
                <Detail
                  label="Last Status"
                  value={selected.last_payment_status}
                />
                <Detail
                  label="Last Payment"
                  value={formatDate(
                    selected.last_payment_at,
                  )}
                />
                <Detail
                  label="Provider Subscription"
                  value={
                    selected.provider_subscription_id
                  }
                />
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

function Th({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
      {children}
    </th>
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
