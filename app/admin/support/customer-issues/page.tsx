"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  Clock3,
  ExternalLink,
  MessageSquare,
  RefreshCw,
  Search,
  Ticket,
  X,
} from "lucide-react";
import Link from "next/link";
import {
  getPlatformSupportCustomerIssues,
  type PlatformSupportCustomerIssue,
} from "@/lib/api/platform-admin";

const PAGE_SIZE = 20;

function label(value: string | null | undefined) {
  if (!value) return "—";
  return value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function statusClass(status: string) {
  switch (status) {
    case "open":
      return "border-amber-200 bg-amber-50 text-amber-700";
    case "in_review":
      return "border-blue-200 bg-blue-50 text-blue-700";
    case "waiting_user":
      return "border-purple-200 bg-purple-50 text-purple-700";
    case "resolved":
      return "border-emerald-200 bg-emerald-50 text-emerald-700";
    case "closed":
      return "border-slate-200 bg-slate-100 text-slate-600";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

function priorityClass(priority: string) {
  switch (priority) {
    case "high":
      return "border-red-200 bg-red-50 text-red-700";
    case "medium":
      return "border-amber-200 bg-amber-50 text-amber-700";
    default:
      return "border-slate-200 bg-slate-100 text-slate-600";
  }
}

export default function CustomerIssuesPage() {
  const [items, setItems] = useState<PlatformSupportCustomerIssue[]>([]);
  const [total, setTotal] = useState(0);
  const [offset, setOffset] = useState(0);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [priority, setPriority] = useState("");
  const [category, setCategory] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [selected, setSelected] =
    useState<PlatformSupportCustomerIssue | null>(null);

  const load = useCallback(
    async (silent = false) => {
      try {
        setError("");

        if (silent) setRefreshing(true);
        else setLoading(true);

        const result = await getPlatformSupportCustomerIssues({
          search: search.trim() || undefined,
          status: status || undefined,
          priority: priority || undefined,
          category: category || undefined,
          limit: PAGE_SIZE,
          offset,
        });

        setItems(result.items);
        setTotal(result.total);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Unable to load customer issues.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [search, status, priority, category, offset],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => load(), 250);
    return () => window.clearTimeout(timer);
  }, [load]);

  const stats = useMemo(
    () => ({
      open: items.filter((x) => x.status === "open").length,
      review: items.filter((x) => x.status === "in_review").length,
      high: items.filter((x) => x.priority === "high").length,
    }),
    [items],
  );

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const resetPage = () => setOffset(0);

  return (
    <div className="min-h-full bg-[#f5f7fa] p-4 md:p-6">
      <div className="mx-auto max-w-[1600px] space-y-5">

        {/* HEADER */}
        <div className="rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm md:px-7">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
                <MessageSquare className="h-4 w-4" />
                Support / Customer Issues
              </div>

              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Customer Issues
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Manage customer support issues and service requests.
              </p>
            </div>

            <div className="flex gap-2">
              <Link
                href="/admin/support"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Support Dashboard
              </Link>

              <Link
                href="/admin/support-tickets"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#08344f]"
              >
                <Ticket className="h-4 w-4" />
                All Tickets
              </Link>
            </div>
          </div>
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <Stat
            label="Total Issues"
            value={total}
            icon={<MessageSquare className="h-5 w-5" />}
          />

          <Stat
            label="Open"
            value={stats.open}
            icon={<AlertCircle className="h-5 w-5" />}
          />

          <Stat
            label="High Priority"
            value={stats.high}
            icon={<Clock3 className="h-5 w-5" />}
          />
        </div>

        {/* FILTERS */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-5">

            <div className="relative xl:col-span-2">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  resetPage();
                }}
                placeholder="Search studio, email, subject or ticket..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none focus:border-[#3495a1] focus:bg-white"
              />
            </div>

            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                resetPage();
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_review">In Review</option>
              <option value="waiting_user">Waiting User</option>
              <option value="resolved">Resolved</option>
              <option value="closed">Closed</option>
            </select>

            <select
              value={priority}
              onChange={(e) => {
                setPriority(e.target.value);
                resetPage();
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All Priorities</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                resetPage();
              }}
              className="h-11 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none"
            >
              <option value="">All Categories</option>
              <option value="technical">Technical</option>
              <option value="billing">Billing</option>
              <option value="account">Account</option>
              <option value="subscription">Subscription</option>
              <option value="general">General</option>
            </select>
          </div>

          <div className="mt-3 flex justify-end">
            <button
              type="button"
              onClick={() => load(true)}
              disabled={refreshing}
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr className="text-left text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3.5">Customer / Studio</th>
                  <th className="px-5 py-3.5">Issue</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Created</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      {Array.from({ length: 7 }).map((__, j) => (
                        <td key={j} className="px-5 py-5">
                          <div className="h-4 animate-pulse rounded bg-slate-100" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center">
                      <MessageSquare className="mx-auto h-9 w-9 text-slate-300" />

                      <p className="mt-3 text-sm font-semibold text-slate-700">
                        No customer issues found
                      </p>

                      <p className="mt-1 text-xs text-slate-400">
                        No matching support issues exist in the database.
                      </p>
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr
                      key={item.ticket_id}
                      className="transition hover:bg-slate-50/70"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {item.studio_name}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {item.contact_email ||
                            item.legal_name ||
                            "—"}
                        </div>
                      </td>

                      <td className="max-w-[320px] px-5 py-4">
                        <div className="truncate font-medium text-slate-800">
                          {item.subject || "Untitled Issue"}
                        </div>

                        <div className="mt-1 truncate text-xs text-slate-400">
                          {item.ticket_id}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {label(item.category)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${statusClass(
                            item.status,
                          )}`}
                        >
                          {label(item.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityClass(
                            item.priority,
                          )}`}
                        >
                          {label(item.priority)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(item.created_at)}
                      </td>

                      <td className="px-5 py-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelected(item)}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-[#0A3F61] hover:bg-slate-50"
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

          {/* PAGINATION */}
          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-4">
            <span className="text-xs text-slate-500">
              {total === 0
                ? "0 results"
                : `Showing ${offset + 1}–${Math.min(
                    offset + items.length,
                    total,
                  )} of ${total}`}
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={offset === 0}
                onClick={() =>
                  setOffset(Math.max(0, offset - PAGE_SIZE))
                }
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>

              <span className="text-xs font-semibold text-slate-500">
                Page {currentPage} / {totalPages}
              </span>

              <button
                disabled={offset + PAGE_SIZE >= total}
                onClick={() => setOffset(offset + PAGE_SIZE)}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold disabled:opacity-40"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* DETAILS DRAWER */}
      {selected && (
        <div className="fixed inset-0 z-50">
          <button
            type="button"
            aria-label="Close"
            onClick={() => setSelected(null)}
            className="absolute inset-0 bg-slate-950/35"
          />

          <aside className="absolute right-0 top-0 h-full w-full max-w-xl overflow-y-auto bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Customer Issue
                </p>

                <h2 className="mt-1 text-lg font-semibold text-slate-900">
                  {selected.subject || "Untitled Issue"}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-5 p-5">
              <Section title="Customer / Studio">
                <Row label="Studio" value={selected.studio_name} />
                <Row label="Legal Name" value={selected.legal_name} />
                <Row label="Email" value={selected.contact_email} />
                <Row label="Phone" value={selected.contact_phone} />
              </Section>

              <Section title="Issue">
                <Row label="Ticket ID" value={selected.ticket_id} />
                <Row label="Type" value={label(selected.ticket_type)} />
                <Row label="Category" value={label(selected.category)} />
                <Row label="Status" value={label(selected.status)} />
                <Row label="Priority" value={label(selected.priority)} />
                <Row label="Created" value={formatDate(selected.created_at)} />
                <Row label="Updated" value={formatDate(selected.updated_at)} />
                <Row label="Assigned To" value={selected.assigned_to} />
              </Section>

              <Section title="Description">
                <div className="rounded-xl bg-slate-50 p-4 text-sm leading-6 text-slate-600">
                  {selected.description || "No description available."}
                </div>
              </Section>

              {selected.admin_notes && (
                <Section title="Admin Notes">
                  <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-800">
                    {selected.admin_notes}
                  </div>
                </Section>
              )}

              <Link
                href="/admin/support-tickets"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-3 text-sm font-semibold text-white"
              >
                <Ticket className="h-4 w-4" />
                Open Support Tickets
              </Link>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}

function Stat({
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
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-[#0A3F61]">
        {icon}
      </div>

      <div className="mt-4 text-2xl font-semibold text-slate-900">
        {value}
      </div>

      <div className="mt-1 text-sm text-slate-500">{label}</div>
    </div>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-3 text-sm font-semibold text-slate-900">
        {title}
      </h3>

      <div className="rounded-xl border border-slate-200">
        {children}
      </div>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-100 px-4 py-3 last:border-0">
      <span className="text-xs font-medium text-slate-400">
        {label}
      </span>

      <span className="max-w-[65%] text-right text-sm font-medium text-slate-700">
        {value || "—"}
      </span>
    </div>
  );
}
