"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import {
  getPlatformAdminRenewals,
  type PlatformAdminRenewal,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function formatMoney(value: number, currency = "INR") {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function daysUntil(value: string | null) {
  if (!value) return null;
  return Math.ceil(
    (new Date(value).getTime() - Date.now()) / 86400000,
  );
}

function statusLabel(status: string | null) {
  if (!status) return "Unknown";

  return status
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function statusClass(status: string | null) {
  switch (status) {
    case "overdue":
      return "border-red-200 bg-red-50 text-red-700";
    case "due":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "upcoming":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "requested":
      return "border-violet-200 bg-violet-50 text-violet-700";
    case "renewed":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    default:
      return "border-slate-200 bg-slate-50 text-slate-700";
  }
}

export default function AdminRenewalsPage() {
  const [items, setItems] = useState<PlatformAdminRenewal[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selected, setSelected] =
    useState<PlatformAdminRenewal | null>(null);

  async function loadRenewals() {
    setLoading(true);
    setError(null);

    try {
      const result = await getPlatformAdminRenewals({
        search: search.trim() || undefined,
        status,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        limit: PAGE_SIZE,
        offset: page * PAGE_SIZE,
      });

      setItems(result.items);
      setTotal(result.total);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load renewals.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRenewals();
  }, [page, status, dateFrom, dateTo]);

  const stats = useMemo(
    () => ({
      upcoming: items.filter((x) => x.renewal_status === "upcoming").length,
      due: items.filter((x) => x.renewal_status === "due").length,
      overdue: items.filter((x) => x.renewal_status === "overdue").length,
      requested: items.filter((x) => x.renewal_status === "requested").length,
      renewed: items.filter((x) => x.renewal_status === "renewed").length,
      scheduled: items.filter((x) => x.renewal_status === "scheduled").length,
    }),
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="min-h-full bg-slate-50 p-6">
      <div className="mx-auto max-w-[1600px] space-y-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-slate-900 p-2.5 text-white">
              <RefreshCw className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Renewals
              </h1>
              <p className="text-sm text-slate-500">
                Monitor subscription renewal lifecycle and upcoming billing.
              </p>
            </div>
          </div>

          <button
            onClick={() => void loadRenewals()}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-6">
          <StatCard label="Upcoming 7 Days" value={stats.upcoming} icon={<CalendarClock className="h-5 w-5" />} />
          <StatCard label="Due" value={stats.due} icon={<Clock3 className="h-5 w-5" />} />
          <StatCard label="Overdue" value={stats.overdue} icon={<AlertCircle className="h-5 w-5" />} />
          <StatCard label="Requested" value={stats.requested} icon={<RefreshCw className="h-5 w-5" />} />
          <StatCard label="Renewed" value={stats.renewed} icon={<CheckCircle2 className="h-5 w-5" />} />
          <StatCard label="Scheduled" value={stats.scheduled} icon={<CalendarClock className="h-5 w-5" />} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    setPage(0);
                    void loadRenewals();
                  }
                }}
                placeholder="Search studio, owner, subscription, plan..."
                className="w-full rounded-xl border border-slate-200 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-700 outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="upcoming">Upcoming</option>
              <option value="due">Due</option>
              <option value="overdue">Overdue</option>
              <option value="requested">Requested</option>
              <option value="renewed">Renewed</option>
              <option value="scheduled">Scheduled</option>
            </select>

            <input
              type="date"
              value={dateFrom}
              onChange={(e) => {
                setDateFrom(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none"
            />

            <input
              type="date"
              value={dateTo}
              onChange={(e) => {
                setDateTo(e.target.value);
                setPage(0);
              }}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-700 outline-none"
            />

            <button
              onClick={() => {
                setPage(0);
                void loadRenewals();
              }}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              Search
            </button>
          </div>
        </div>

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {error && (
            <div className="m-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1250px] text-left">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Studio</th>
                  <th className="px-5 py-4">Plan</th>
                  <th className="px-5 py-4">Renewal</th>
                  <th className="px-5 py-4">Next Billing</th>
                  <th className="px-5 py-4">Amount</th>
                  <th className="px-5 py-4">Auto Renew</th>
                  <th className="px-5 py-4">Last Payment</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-500">
                      Loading renewals...
                    </td>
                  </tr>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center text-sm text-slate-500">
                      No renewal records found.
                    </td>
                  </tr>
                ) : (
                  items.map((item) => {
                    const days = daysUntil(item.next_billing_at);

                    return (
                      <tr key={item.subscription_id} className="hover:bg-slate-50">
                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-900">
                            {item.studio_name || "Unnamed Studio"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.owner_email || item.studio_email || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <div className="font-medium text-slate-800">
                            {item.plan_name || item.plan_code || "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.billing_cycle || "—"}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-medium ${statusClass(item.renewal_status)}`}>
                            {statusLabel(item.renewal_status)}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm font-medium text-slate-800">
                            {formatDate(item.next_billing_at)}
                          </div>
                          {days !== null && (
                            <div className="mt-1 text-xs text-slate-500">
                              {days < 0
                                ? `${Math.abs(days)} days overdue`
                                : days === 0
                                  ? "Today"
                                  : `${days} days`}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4 font-medium text-slate-800">
                          {formatMoney(item.plan_price, item.plan_currency || "INR")}
                        </td>

                        <td className="px-5 py-4">
                          {item.auto_renew ? (
                            <span className="text-sm font-medium text-emerald-600">
                              Enabled
                            </span>
                          ) : (
                            <span className="text-sm text-slate-500">
                              Disabled
                            </span>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-700">
                            {item.last_payment_status || "—"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {formatDate(item.last_payment_at)}
                          </div>
                        </td>

                        <td className="px-5 py-4">
                          <button
                            onClick={() => setSelected(item)}
                            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Eye className="h-4 w-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <div className="text-sm text-slate-500">
              {total === 0
                ? "0 records"
                : `${page * PAGE_SIZE + 1}–${Math.min(
                    (page + 1) * PAGE_SIZE,
                    total,
                  )} of ${total}`}
            </div>

            <div className="flex items-center gap-2">
              <button
                disabled={page === 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              <span className="px-2 text-sm text-slate-600">
                {page + 1} / {totalPages}
              </span>

              <button
                disabled={page + 1 >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-lg border border-slate-200 p-2 disabled:opacity-40"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
          <div className="h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Renewal Details
                </h2>
                <p className="text-xs text-slate-500">
                  {selected.subscription_id}
                </p>
              </div>

              <button
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-6 p-6">
              <DetailSection title="Studio">
                <DetailRow label="Studio" value={selected.studio_name} />
                <DetailRow label="Code" value={selected.studio_code} />
                <DetailRow label="Email" value={selected.studio_email} />
                <DetailRow label="Owner" value={selected.owner_name} />
              </DetailSection>

              <DetailSection title="Renewal">
                <DetailRow label="Renewal Status" value={statusLabel(selected.renewal_status)} />
                <DetailRow label="Subscription Status" value={statusLabel(selected.subscription_status)} />
                <DetailRow label="Next Billing" value={formatDate(selected.next_billing_at)} />
                <DetailRow label="Auto Renew" value={selected.auto_renew ? "Enabled" : "Disabled"} />
              </DetailSection>

              <DetailSection title="Plan & Billing">
                <DetailRow label="Plan" value={selected.plan_name} />
                <DetailRow label="Plan Code" value={selected.plan_code} />
                <DetailRow label="Price" value={formatMoney(selected.plan_price, selected.plan_currency || "INR")} />
                <DetailRow label="Billing Cycle" value={selected.billing_cycle} />
                <DetailRow label="Currency" value={selected.plan_currency} />
              </DetailSection>

              <DetailSection title="Payment">
                <DetailRow label="Last Payment Status" value={selected.last_payment_status} />
                <DetailRow label="Last Payment" value={formatDate(selected.last_payment_at)} />
                <DetailRow label="Payment ID" value={selected.latest_payment_id} />
                <DetailRow label="Invoice ID" value={selected.current_invoice_id} />
              </DetailSection>

              <DetailSection title="Renewal Event">
                <DetailRow label="Latest Event" value={selected.latest_renewal_event} />
                <DetailRow label="Event Time" value={formatDate(selected.latest_renewal_event_at)} />
              </DetailSection>

              <DetailSection title="Lifecycle">
                <DetailRow label="Subscription Start" value={formatDate(selected.subscription_start_at)} />
                <DetailRow label="Subscription End" value={formatDate(selected.subscription_end_at)} />
                <DetailRow label="Trial Start" value={formatDate(selected.trial_start_at)} />
                <DetailRow label="Trial End" value={formatDate(selected.trial_end_at)} />
              </DetailSection>

              <DetailSection title="Provider">
                <DetailRow label="Provider" value={selected.payment_provider} />
                <DetailRow label="Customer ID" value={selected.provider_customer_id} />
                <DetailRow label="Subscription ID" value={selected.provider_subscription_id} />
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
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <div className="rounded-lg bg-slate-100 p-2 text-slate-600">
          {icon}
        </div>
        <span className="text-2xl font-semibold text-slate-900">{value}</span>
      </div>
      <div className="text-xs font-medium text-slate-500">{label}</div>
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
      <h3 className="mb-3 text-sm font-semibold text-slate-900">{title}</h3>
      <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
        {children}
      </div>
    </section>
  );
}

function DetailRow({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 px-4 py-3">
      <span className="text-xs text-slate-500">{label}</span>
      <span className="max-w-[65%] break-all text-right text-sm font-medium text-slate-800">
        {value || "—"}
      </span>
    </div>
  );
}
