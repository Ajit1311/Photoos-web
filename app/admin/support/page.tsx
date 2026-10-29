"use client";

import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock3,
  CreditCard,
  Headphones,
  Inbox,
  RefreshCw,
  Ticket,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import {
  getPlatformSupportDashboard,
  type PlatformSupportDashboard,
} from "@/lib/api/platform-admin";
import { getWebsiteAiEnquiryCount } from "@/lib/api/platform-admin-website-ai-enquiries";

function formatDate(value: string | null | undefined) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatNumber(value: number | null | undefined) {
  return new Intl.NumberFormat("en-IN").format(Number(value) || 0);
}

function label(value: string | null | undefined) {
  if (!value) return "Unknown";

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function statusClass(status: string | null) {
  switch (status?.toLowerCase()) {
    case "open":
      return "bg-red-50 text-red-700";
    case "in_progress":
    case "in-progress":
      return "bg-blue-50 text-blue-700";
    case "resolved":
      return "bg-emerald-50 text-emerald-700";
    case "closed":
      return "bg-slate-100 text-slate-700";
    default:
      return "bg-amber-50 text-amber-700";
  }
}

function priorityClass(priority: string | null) {
  switch (priority?.toLowerCase()) {
    case "critical":
    case "urgent":
      return "bg-red-50 text-red-700";
    case "high":
      return "bg-orange-50 text-orange-700";
    case "medium":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-slate-100 text-slate-600";
  }
}

export default function SupportDashboardPage() {
  const [data, setData] =
    useState<PlatformSupportDashboard | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [websiteAiEnquiryCount, setWebsiteAiEnquiryCount] =
    useState(0);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const [response, websiteAiCount] = await Promise.all([
        getPlatformSupportDashboard(),
        getWebsiteAiEnquiryCount(),
      ]);

      setData(response.data);
      setWebsiteAiEnquiryCount(websiteAiCount);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load support dashboard.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const overview = data?.overview;

  return (
    <div className="min-h-full bg-slate-50">
      <div className="mx-auto max-w-[1600px] space-y-6 p-4 md:p-6 lg:p-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-sm text-slate-500">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 hover:text-slate-900"
              >
                <ArrowLeft className="h-4 w-4" />
                Admin
              </Link>
              <span>/</span>
              <span>Support</span>
            </div>

            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Support Dashboard
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Monitor support tickets, priorities and service workload.
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                loading ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<Ticket className="h-5 w-5" />}
            label="Total Tickets"
            value={overview?.total_tickets ?? 0}
          />

          <MetricCard
            icon={<Inbox className="h-5 w-5" />}
            label="Open"
            value={overview?.open_tickets ?? 0}
          />

          <MetricCard
            icon={<Clock3 className="h-5 w-5" />}
            label="In Progress"
            value={overview?.in_progress_tickets ?? 0}
          />

          <MetricCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Resolved"
            value={overview?.resolved_tickets ?? 0}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Closed"
            value={overview?.closed_tickets ?? 0}
          />

          <MetricCard
            icon={<AlertTriangle className="h-5 w-5" />}
            label="High Priority"
            value={overview?.high_priority_tickets ?? 0}
          />

          <MetricCard
            icon={<UserX className="h-5 w-5" />}
            label="Unassigned"
            value={overview?.unassigned_tickets ?? 0}
          />

          <MetricCard
            icon={<CreditCard className="h-5 w-5" />}
            label="Refund Related"
            value={overview?.refund_tickets ?? 0}
          />

          <MetricCard
            icon={<Headphones className="h-5 w-5" />}
            label="Website AI Enquiries"
            value={websiteAiEnquiryCount}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <BreakdownCard
            title="Ticket Status"
            items={data?.status_breakdown ?? []}
            nameKey="status"
          />

          <BreakdownCard
            title="Priority"
            items={data?.priority_breakdown ?? []}
            nameKey="priority"
          />

          <BreakdownCard
            title="Category"
            items={data?.category_breakdown ?? []}
            nameKey="category"
          />
        </div>

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 p-5">
            <div>
              <h2 className="font-semibold text-slate-900">
                Recent Tickets
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Latest support activity from the platform.
              </p>
            </div>

            <Link
              href="/admin/support-tickets"
              className="text-sm font-medium text-slate-700 hover:text-slate-900"
            >
              View all
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1000px] w-full">
              <thead className="bg-slate-50">
                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <th className="px-5 py-4">Ticket</th>
                  <th className="px-5 py-4">Category</th>
                  <th className="px-5 py-4">Priority</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Assigned</th>
                  <th className="px-5 py-4">Created</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      Loading support tickets...
                    </td>
                  </tr>
                ) : !data?.recent_tickets?.length ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-5 py-12 text-center text-sm text-slate-500"
                    >
                      No support tickets found.
                    </td>
                  </tr>
                ) : (
                  data.recent_tickets.map((ticket) => (
                    <tr key={ticket.id}>
                      <td className="px-5 py-4">
                        <div className="max-w-sm truncate text-sm font-medium text-slate-900">
                          {ticket.subject ?? "Untitled Ticket"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          {label(ticket.ticket_type)}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {label(ticket.category)}
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityClass(
                            ticket.priority,
                          )}`}
                        >
                          {label(ticket.priority)}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusClass(
                            ticket.status,
                          )}`}
                        >
                          {label(ticket.status)}
                        </span>
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {ticket.assigned_to ? "Assigned" : "Unassigned"}
                      </td>

                      <td className="px-5 py-4 text-sm text-slate-600">
                        {formatDate(ticket.created_at)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {data && (
          <p className="text-right text-xs text-slate-400">
            Updated {formatDate(data.generated_at)}
          </p>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-3 text-slate-500">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>

      <div className="mt-3 text-2xl font-semibold text-slate-900">
        {formatNumber(value)}
      </div>
    </div>
  );
}

function BreakdownCard({
  title,
  items,
  nameKey,
}: {
  title: string;
  items: Array<Record<string, string | number>>;
  nameKey: string;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 p-5">
        <h2 className="font-semibold text-slate-900">{title}</h2>
      </div>

      <div className="space-y-3 p-5">
        {items.length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-500">
            No data available.
          </div>
        ) : (
          items.map((item) => (
            <div
              key={String(item[nameKey])}
              className="flex items-center justify-between rounded-lg border border-slate-100 p-3"
            >
              <span className="text-sm capitalize text-slate-600">
                {label(String(item[nameKey]))}
              </span>

              <span className="text-sm font-semibold text-slate-900">
                {formatNumber(Number(item.count))}
              </span>
            </div>
          ))
        )}
      </div>
    </section>
  );
}
