"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  TicketCheck,
} from "lucide-react";

import {
  AdminSupportTicket,
  listAdminSupportTickets,
  SupportTicketStatus,
  updateAdminSupportTicket,
} from "@/lib/api/admin-support-tickets";

const STATUS_OPTIONS: Array<
  SupportTicketStatus | "all"
> = [
  "all",
  "open",
  "in_review",
  "waiting_user",
  "resolved",
  "closed",
];

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(new Date(value));
}

function statusLabel(
  status:
    | SupportTicketStatus
    | "not_applicable"
    | "pending"
    | "approved"
    | "rejected"
    | "processed",
) {
  return status
    .split("_")
    .map(
      (part) =>
        part.charAt(0).toUpperCase() +
        part.slice(1),
    )
    .join(" ");
}

function statusClass(
  status: SupportTicketStatus,
) {
  switch (status) {
    case "open":
      return "bg-amber-50 text-amber-700 ring-amber-200";
    case "in_review":
      return "bg-blue-50 text-blue-700 ring-blue-200";
    case "waiting_user":
      return "bg-purple-50 text-purple-700 ring-purple-200";
    case "resolved":
      return "bg-emerald-50 text-emerald-700 ring-emerald-200";
    case "closed":
      return "bg-slate-100 text-slate-600 ring-slate-200";
    default:
      return "bg-slate-100 text-slate-600 ring-slate-200";
  }
}

function isCancellationTicket(
  ticket: AdminSupportTicket,
) {
  return (
    ticket.ticket_type ===
      "subscription_cancellation" ||
    ticket.category ===
      "subscription_cancellation" ||
    ticket.subject
      .toLowerCase()
      .includes("subscription cancellation")
  );
}

export default function AdminSupportTicketsPage() {
  const [tickets, setTickets] = useState<
    AdminSupportTicket[]
  >([]);

  const [statusFilter, setStatusFilter] =
    useState<SupportTicketStatus | "all">(
      "all",
    );

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [refreshing, setRefreshing] =
    useState(false);

  const [error, setError] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  async function loadTickets(
    showRefresh = false,
  ) {
    try {
      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setError(null);

      const data =
        await listAdminSupportTickets(
          statusFilter === "all"
            ? undefined
            : statusFilter,
        );

      setTickets(data);
    } catch (error) {
      console.error(
        "ADMIN SUPPORT TICKETS ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to load support tickets.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    void loadTickets();
  }, [statusFilter]);

  async function handleStatusChange(
    ticket: AdminSupportTicket,
    nextStatus: SupportTicketStatus,
  ) {
    try {
      setUpdatingId(ticket.id);
      setError(null);

      const updated =
        await updateAdminSupportTicket(
          ticket.id,
          nextStatus,
        );

      setTickets((current) =>
        current.map((item) =>
          item.id === updated.id
            ? updated
            : item,
        ),
      );
    } catch (error) {
      console.error(
        "ADMIN SUPPORT TICKET UPDATE ERROR:",
        error,
      );

      setError(
        error instanceof Error
          ? error.message
          : "Unable to update support ticket.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  const filteredTickets = useMemo(() => {
    const query =
      search.trim().toLowerCase();

    if (!query) {
      return tickets;
    }

    return tickets.filter((ticket) =>
      [
        ticket.subject,
        ticket.description,
        ticket.ticket_type,
        ticket.category,
        ticket.priority,
        ticket.status,
        ticket.studio_id,
        ticket.subscription_id ?? "",
        ticket.payment_id ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [tickets, search]);

  const openCount = tickets.filter(
    (ticket) => ticket.status === "open",
  ).length;

  const reviewCount = tickets.filter(
    (ticket) =>
      ticket.status === "in_review",
  ).length;

  const cancellationCount =
    tickets.filter(isCancellationTicket).length;

  if (loading) {
    return (
      <main className="flex min-h-[70vh] items-center justify-center">
        <div className="flex flex-col items-center">
          <Loader2 className="h-8 w-8 animate-spin text-[#0A3F61]" />
          <p className="mt-4 text-sm font-medium text-slate-500">
            Loading support tickets...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-6 py-8 lg:px-10">
      <section className="rounded-[32px] bg-[#0A3F61] p-8 text-white shadow-xl shadow-blue-900/20 lg:p-10">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.16em] text-sky-100">
              <MessageSquareText className="h-4 w-4" />
              Platform Support
            </div>

            <h1 className="mt-5 text-4xl font-bold tracking-tight">
              Support Tickets
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-sky-100/80">
              Review and manage platform support tickets,
              subscription cancellations and operational
              requests.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              void loadTickets(true);
            }}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/10 px-5 py-3 text-sm font-semibold transition hover:bg-white/20 disabled:cursor-not-allowed"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing
                  ? "animate-spin"
                  : ""
              }`}
            />
            Refresh
          </button>
        </div>
      </section>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          icon={TicketCheck}
          label="Total Tickets"
          value={tickets.length}
        />

        <SummaryCard
          icon={Clock3}
          label="Open"
          value={openCount}
        />

        <SummaryCard
          icon={CheckCircle2}
          label="Cancellations"
          value={cancellationCount}
        />

        <SummaryCard
          icon={AlertTriangle}
          label="In Review"
          value={reviewCount}
        />
      </section>

      {error ? (
        <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="mt-6 rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-500">
              Ticket Queue
            </p>
            <h2 className="mt-1 text-2xl font-bold text-slate-950">
              Platform Support Workspace
            </h2>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search tickets..."
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-4 text-sm outline-none transition focus:border-[#0A3F61] focus:bg-white sm:w-64"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | SupportTicketStatus
                    | "all",
                )
              }
              className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 outline-none focus:border-[#0A3F61]"
            >
              {STATUS_OPTIONS.map((status) => (
                <option
                  key={status}
                  value={status}
                >
                  {status === "all"
                    ? "All statuses"
                    : statusLabel(status)}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 space-y-4">
          {filteredTickets.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-10 text-center">
              <TicketCheck className="mx-auto h-8 w-8 text-slate-300" />
              <p className="mt-4 text-sm font-semibold text-slate-600">
                No support tickets found.
              </p>
              <p className="mt-1 text-xs text-slate-400">
                Try another status or search term.
              </p>
            </div>
          ) : (
            filteredTickets.map((ticket) => (
              <TicketRow
                key={ticket.id}
                ticket={ticket}
                updating={
                  updatingId === ticket.id
                }
                onStatusChange={
                  handleStatusChange
                }
              />
            ))
          )}
        </div>
      </section>
    </main>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">
        <Icon className="h-5 w-5" />
      </div>

      <p className="mt-5 text-sm font-medium text-slate-500">
        {label}
      </p>

      <p className="mt-2 text-3xl font-bold text-slate-950">
        {value.toLocaleString("en-IN")}
      </p>
    </div>
  );
}

function TicketRow({
  ticket,
  updating,
  onStatusChange,
}: {
  ticket: AdminSupportTicket;
  updating: boolean;
  onStatusChange: (
    ticket: AdminSupportTicket,
    status: SupportTicketStatus,
  ) => void;
}) {
  const cancellation =
    isCancellationTicket(ticket);

  return (
    <article className="rounded-2xl border border-slate-200 p-5 transition hover:border-slate-300">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${statusClass(ticket.status)}`}
            >
              {statusLabel(ticket.status)}
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-600">
              {ticket.priority}
            </span>

            {cancellation ? (
              <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">
                Subscription Cancellation
              </span>
            ) : null}
          </div>

          <h3 className="mt-4 text-lg font-bold text-slate-950">
            {ticket.subject}
          </h3>

          <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-600">
            {ticket.description}
          </p>

          <div className="mt-4 grid gap-2 text-xs text-slate-400 sm:grid-cols-2 xl:grid-cols-4">
            <span>
              Ticket: {ticket.id}
            </span>

            <span>
              Studio: {ticket.studio_id}
            </span>

            <span>
              Created: {formatDate(ticket.created_at)}
            </span>

            {ticket.subscription_id ? (
              <span>
                Subscription:{" "}
                {ticket.subscription_id}
              </span>
            ) : null}
          </div>

          <div className="mt-4 rounded-xl border border-slate-100 bg-slate-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
              Refund Status
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-700">
              {ticket.refund_status ===
              "not_applicable"
                ? "Not applicable — standard cancellation has no refund entitlement."
                : statusLabel(
                    ticket.refund_status,
                  )}
            </p>
          </div>
        </div>

        <div className="w-full shrink-0 xl:w-56">
          <label className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-400">
            Ticket Status
          </label>

          <select
            value={ticket.status}
            disabled={updating}
            onChange={(event) =>
              onStatusChange(
                ticket,
                event.target.value as SupportTicketStatus,
              )
            }
            className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#0A3F61] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {STATUS_OPTIONS.filter(
              (status) => status !== "all",
            ).map((status) => (
              <option
                key={status}
                value={status}
              >
                {statusLabel(status)}
              </option>
            ))}
          </select>

          {updating ? (
            <div className="mt-3 flex items-center gap-2 text-xs font-medium text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Updating ticket...
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
