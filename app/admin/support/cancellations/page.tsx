"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  IndianRupee,
  RefreshCw,
  Search,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getPlatformSupportCancellations,
  type PlatformSupportCancellation,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 20;

function formatDate(value: string | null) {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatMoney(value: number | null, currency = "INR") {
  if (value === null || value === undefined) return "—";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function statusClass(status: string) {
  switch (status) {
    case "open":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "in_review":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "waiting_user":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

function priorityClass(priority: string) {
  switch (priority) {
    case "high":
      return "bg-red-50 text-red-700 border-red-200";
    case "medium":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "low":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-slate-100 text-slate-600 border-slate-200";
  }
}

export default function SupportCancellationsPage() {
  const [items, setItems] = useState<PlatformSupportCancellation[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(PAGE_SIZE);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] =
    useState<PlatformSupportCancellation | null>(null);

  const loadData = useCallback(
    async (silent = false) => {
      try {
        setError("");

        if (silent) setRefreshing(true);
        else setLoading(true);

        const result = await getPlatformSupportCancellations({
          search: search.trim() || undefined,
          status: status || undefined,
          limit: PAGE_SIZE,
          offset,
        });

        setItems(result.items);
        setTotal(result.total);
        setLimit(result.limit || PAGE_SIZE);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load cancellation requests."
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [offset, search, status]
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      loadData();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const currentPage = Math.floor(offset / limit) + 1;
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const summary = useMemo(() => {
    const open = items.filter((x) => x.ticket_status === "open").length;
    const review = items.filter((x) => x.ticket_status === "in_review").length;
    const resolved = items.filter(
      (x) => x.ticket_status === "resolved" || x.ticket_status === "closed"
    ).length;
    const refund = items.filter(
      (x) =>
        x.refund_status &&
        x.refund_status !== "not_applicable"
    ).length;

    return { open, review, resolved, refund };
  }, [items]);

  function changeStatus(value: string) {
    setStatus(value);
    setOffset(0);
  }

  function changeSearch(value: string) {
    setSearch(value);
    setOffset(0);
  }

  return (
    <div className="min-h-full bg-[#f5f7fa] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">
        {/* Header */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <Ticket className="h-4 w-4" />
                Support / Cancellations
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Subscription Cancellations
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Review customer cancellation requests and associated support
                tickets.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Link
                href="/admin/support"
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
              >
                Support Dashboard
              </Link>

              <Link
                href="/admin/support-tickets"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#08344f]"
              >
                <Ticket className="h-4 w-4" />
                Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* KPI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            icon={<Ban className="h-5 w-5" />}
            label="Total Requests"
            value={total}
          />

          <KpiCard
            icon={<AlertCircle className="h-5 w-5" />}
            label="Open"
            value={summary.open}
          />

          <KpiCard
            icon={<Clock3 className="h-5 w-5" />}
            label="In Review"
            value={summary.review}
          />

          <KpiCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Resolved / Closed"
            value={summary.resolved}
          />
        </div>

        {/* Filters */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="relative w-full lg:max-w-xl">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => changeSearch(e.target.value)}
                placeholder="Search studio, email, plan or ticket..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm text-slate-800 outline-none transition focus:border-[#3495a1] focus:bg-white focus:ring-2 focus:ring-[#3495a1]/10"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <select
                value={status}
                onChange={(e) => changeStatus(e.target.value)}
                className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-[#3495a1]"
              >
                <option value="">All Statuses</option>
                <option value="open">Open</option>
                <option value="in_review">In Review</option>
                <option value="waiting_user">Waiting User</option>
                <option value="resolved">Resolved</option>
                <option value="closed">Closed</option>
              </select>

              <button
                type="button"
                onClick={() => loadData(true)}
                disabled={loading || refreshing}
                className="inline-flex h-11 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    refreshing ? "animate-spin" : ""
                  }`}
                />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Error */}
        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        ) : null}

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1150px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Studio</th>
                  <th className="px-5 py-3.5">Plan</th>
                  <th className="px-5 py-3.5">Amount</th>
                  <th className="px-5 py-3.5">Cancelled</th>
                  <th className="px-5 py-3.5">Ticket</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Refund</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, index) => (
                    <tr key={index}>
                      {Array.from({ length: 8 }).map((__, cell) => (
                        <td key={cell} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-16 text-center">
                      <Ban className="mx-auto h-9 w-9 text-slate-300" />
                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No cancellation requests found
                      </p>
                      <p className="mt-1 text-xs text-slate-400">
                        Try changing the search or status filter.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.subscription_id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="min-w-[220px]">
                          <div className="font-semibold text-slate-900">
                            {item.studio_name || "Unnamed Studio"}
                          </div>
                          <div className="mt-1 text-xs text-slate-500">
                            {item.contact_email || item.legal_name || "—"}
                          </div>
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-slate-800">
                          {item.plan_name || "—"}
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          {statusLabel(item.subscription_status)}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="inline-flex items-center gap-1 font-semibold text-slate-800">
                          <IndianRupee className="h-3.5 w-3.5" />
                          {item.plan_price ?? "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.cancelled_at)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                            item.ticket_status
                          )}`}
                        >
                          {statusLabel(item.ticket_status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                            item.ticket_priority
                          )}`}
                        >
                          {statusLabel(item.ticket_priority)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-700">
                          {statusLabel(item.refund_status || "not_applicable")}
                        </div>
                        {item.refund_amount !== null ? (
                          <div className="mt-1 text-xs text-slate-400">
                            {formatMoney(
                              item.refund_amount,
                              item.refund_currency || "INR"
                            )}
                          </div>
                        ) : null}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-[#0A3F61] transition hover:bg-slate-50"
                        >
                          View
                          <ExternalLink className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-xs text-slate-500">
              {total === 0
                ? "0 results"
                : `Showing ${offset + 1}–${Math.min(
                    offset + items.length,
                    total
                  )} of ${total}`}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={offset === 0 || loading}
                onClick={() =>
                  setOffset(Math.max(0, offset - limit))
                }
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="px-2 text-xs font-semibold text-slate-500">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={offset + limit >= total || loading}
                onClick={() => setOffset(offset + limit)}
                className="inline-flex h-9 items-center gap-1 rounded-lg border border-slate-200 px-3 text-xs font-semibold text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Details Drawer */}
      {selected ? (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Cancellation Details
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {selected.studio_name || "Unnamed Studio"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <DetailSection title="Studio">
                <DetailRow
                  label="Studio"
                  value={selected.studio_name}
                />
                <DetailRow
                  label="Legal Name"
                  value={selected.legal_name}
                />
                <DetailRow
                  label="Email"
                  value={selected.contact_email}
                />
                <DetailRow
                  label="Phone"
                  value={selected.contact_phone}
                />
              </DetailSection>

              <DetailSection title="Subscription">
                <DetailRow
                  label="Plan"
                  value={selected.plan_name}
                />
                <DetailRow
                  label="Plan Price"
                  value={
                    selected.plan_price !== null
                      ? formatMoney(selected.plan_price)
                      : null
                  }
                />
                <DetailRow
                  label="Status"
                  value={statusLabel(selected.subscription_status)}
                />
                <DetailRow
                  label="Auto Renew"
                  value={selected.auto_renew ? "Enabled" : "Disabled"}
                />
                <DetailRow
                  label="Subscription Start"
                  value={formatDate(selected.subscription_start_at)}
                />
                <DetailRow
                  label="Subscription End"
                  value={formatDate(selected.subscription_end_at)}
                />
                <DetailRow
                  label="Cancelled At"
                  value={formatDate(selected.cancelled_at)}
                />
              </DetailSection>

              <DetailSection title="Support Ticket">
                <DetailRow
                  label="Ticket Status"
                  value={statusLabel(selected.ticket_status)}
                />
                <DetailRow
                  label="Priority"
                  value={statusLabel(selected.ticket_priority)}
                />
                <DetailRow
                  label="Category"
                  value={statusLabel(selected.category)}
                />
                <DetailRow
                  label="Ticket Type"
                  value={statusLabel(selected.ticket_type)}
                />
                <DetailRow
                  label="Subject"
                  value={selected.subject}
                />
                <DetailRow
                  label="Created"
                  value={formatDate(selected.ticket_created_at)}
                />
                <DetailRow
                  label="Assigned To"
                  value={selected.assigned_to}
                />
              </DetailSection>

              <DetailSection title="Description">
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {selected.description || "No description available."}
                </div>
              </DetailSection>

              <DetailSection title="Refund">
                <DetailRow
                  label="Refund Status"
                  value={statusLabel(selected.refund_status || "not_applicable")}
                />
                <DetailRow
                  label="Refund Amount"
                  value={
                    selected.refund_amount !== null
                      ? formatMoney(
                          selected.refund_amount,
                          selected.refund_currency || "INR"
                        )
                      : null
                  }
                />
                <DetailRow
                  label="Transaction ID"
                  value={selected.refund_transaction_id}
                />
                <DetailRow
                  label="Processed At"
                  value={formatDate(selected.refund_processed_at)}
                />
              </DetailSection>

              {selected.admin_notes ? (
                <DetailSection title="Admin Notes">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    {selected.admin_notes}
                  </div>
                </DetailSection>
              ) : null}

              <div className="flex gap-3 pt-2">
                <Link
                  href="/admin/support-tickets"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-3 text-sm font-semibold text-white"
                >
                  <Ticket className="h-4 w-4" />
                  Open Support Tickets
                </Link>

                <button
                  type="button"
                  onClick={() => setSelected(null)}
                  className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700"
                >
                  Close
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}

function KpiCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A3F61]">
          {icon}
        </div>
      </div>

      <div className="mt-4 text-2xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">{label}</div>
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
      <div className="rounded-xl border border-slate-200 bg-white">
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
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
      <span className="text-xs font-medium text-slate-400">{label}</span>
      <span className="max-w-[65%] text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}
