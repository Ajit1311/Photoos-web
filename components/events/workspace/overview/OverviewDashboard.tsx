"use client";

import EventSummaryCard from "./EventSummaryCard";
import FinanceSnapshotCard from "./FinanceSnapshotCard";
import TodayTasksCard from "./TodayTasksCard";
import TeamSnapshotCard from "./TeamSnapshotCard";
import RecentActivityCard from "./RecentActivityCard";

import { useWorkspace } from "@/hooks/events/useWorkspace";

interface OverviewDashboardProps {
  eventId: string;
}

type ActivityItem = {
  id: string;
  title: string;
  description: string;
  time: string;
  type:
    | "upload"
    | "payment"
    | "team"
    | "gallery"
    | "general";
};

type FinanceSnapshot = {
  packageAmount: number;
  advanceAmount: number;
  discount: number;
  balanceAmount: number;
  paymentStatus:
    | "pending"
    | "partial"
    | "paid"
    | "overdue";
  paymentDueDate: string | null;
};

export default function OverviewDashboard({
  eventId,
}: OverviewDashboardProps) {
  const {
    workspace,
    loading,
    error,
  } = useWorkspace(eventId);

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-8">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div className="xl:col-span-4">
          <div className="h-64 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div className="xl:col-span-6">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        </div>

        <div className="xl:col-span-6">
          <div className="h-72 animate-pulse rounded-2xl bg-slate-100" />
        </div>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6">
        <h2 className="font-semibold text-red-800">
          Unable to load overview
        </h2>

        <p className="mt-1 text-sm text-red-600">
          {error.message}
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Empty Workspace                                                          */
  /* ------------------------------------------------------------------------ */

  if (!workspace) {
    return (
      <div className="rounded-2xl border bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-slate-900">
          Overview unavailable
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Event workspace data is not available.
        </p>
      </div>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Workspace Context                                                        */
  /* ------------------------------------------------------------------------ */

  const event = workspace.event;

  const project = workspace.project;

  const client = workspace.client;

  const backendFinance = workspace.finance;

  /* ------------------------------------------------------------------------ */
  /* Event Summary                                                            */
  /* ------------------------------------------------------------------------ */

  const eventSummary = {
    title:
      event.name ??
      "Untitled Event",

    clientName:
      [
        client?.first_name,
        client?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      "—",

    eventType:
      typeof project?.event_type === "string"
        ? project.event_type
        : "—",

    eventDate:
      event.shootDate ??
      "",

    venue:
      event.venue ??
      "—",

    status:
      normalizeEventStatus(
        event.status,
      ),
  };

  /* ------------------------------------------------------------------------ */
  /* Finance Snapshot                                                         */
  /* ------------------------------------------------------------------------ */

  const finance: FinanceSnapshot = {
    packageAmount:
      toNumber(
        backendFinance?.package_amount,
      ),

    advanceAmount:
      toNumber(
        backendFinance?.advance_amount,
      ),

    discount:
      toNumber(
        backendFinance?.discount,
      ),

    balanceAmount:
      toNumber(
        backendFinance?.balance_amount,
      ),

    paymentStatus:
      normalizePaymentStatus(
        backendFinance?.payment_status,
      ),

    paymentDueDate:
      normalizeOptionalString(
        backendFinance?.payment_due_date,
      ),
  };

  /* ------------------------------------------------------------------------ */
  /* Activities                                                               */
  /* ------------------------------------------------------------------------ */

  /*
   * The current get_event_workspace response does not yet provide
   * timeline/activity records.
   *
   * Do not invent activity data here.
   * This will be connected when the backend timeline payload is available.
   */

  const activities: ActivityItem[] = [];

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="space-y-6">

      {/* -------------------------------------------------------------------- */}
      {/* Summary + Finance                                                    */}
      {/* -------------------------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        <div className="xl:col-span-8">
          <EventSummaryCard
            summary={eventSummary}
          />
        </div>

        <div className="xl:col-span-4">
          <FinanceSnapshotCard
            finance={finance}
          />
        </div>

      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Tasks + Team                                                          */}
      {/* -------------------------------------------------------------------- */}

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">

        <div className="xl:col-span-6">
          <TodayTasksCard
            tasks={[]}
          />
        </div>

        <div className="xl:col-span-6">
          <TeamSnapshotCard
            members={[]}
          />
        </div>

      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Recent Activity                                                       */}
      {/* -------------------------------------------------------------------- */}

      <RecentActivityCard
        activities={activities}
      />

    </div>
  );
}

/* ==========================================================================
 * Helpers
 * ========================================================================== */

/* -------------------------------------------------------------------------- */
/* Event Status                                                               */
/* -------------------------------------------------------------------------- */

function normalizeEventStatus(
  status: string | undefined,
):
  | "draft"
  | "active"
  | "published"
  | "completed"
  | "archived" {
  switch (status) {
    case "active":
    case "scheduled":
    case "in_progress":
      return "active";

    case "published":
      return "published";

    case "completed":
      return "completed";

    case "archived":
    case "cancelled":
      return "archived";

    case "draft":
    default:
      return "draft";
  }
}

/* -------------------------------------------------------------------------- */
/* Payment Status                                                             */
/* -------------------------------------------------------------------------- */

function normalizePaymentStatus(
  status:
    | string
    | null
    | undefined,
):
  | "pending"
  | "partial"
  | "paid"
  | "overdue" {
  switch (status) {
    case "paid":
      return "paid";

    case "overdue":
      return "overdue";

    case "advance_paid":
    case "partial":
    case "partially_paid":
      return "partial";

    case "pending":
    default:
      return "pending";
  }
}

/* -------------------------------------------------------------------------- */
/* Number Normalizer                                                          */
/* -------------------------------------------------------------------------- */

function toNumber(
  value:
    | number
    | string
    | null
    | undefined,
): number {
  if (
    typeof value === "number" &&
    Number.isFinite(value)
  ) {
    return value;
  }

  if (
    typeof value === "string"
  ) {
    const parsed =
      Number(value);

    if (
      Number.isFinite(parsed)
    ) {
      return parsed;
    }
  }

  return 0;
}

/* -------------------------------------------------------------------------- */
/* Optional String Normalizer                                                 */
/* -------------------------------------------------------------------------- */

function normalizeOptionalString(
  value:
    | string
    | null
    | undefined,
): string | null {
  if (
    typeof value !== "string"
  ) {
    return null;
  }

  const trimmed =
    value.trim();

  return trimmed.length > 0
    ? trimmed
    : null;
}

/* -------------------------------------------------------------------------- */
/* Timeline Activities                                                        */
/* -------------------------------------------------------------------------- */

function buildTimelineActivities(
  timeline: unknown,
): ActivityItem[] {
  if (
    !timeline ||
    typeof timeline !== "object"
  ) {
    return [];
  }

  const rawItems =
    Array.isArray(timeline)
      ? timeline
      : Array.isArray(
          (
            timeline as {
              items?: unknown;
            }
          ).items,
        )
        ? (
            timeline as {
              items: unknown[];
            }
          ).items
        : [];

  return rawItems.map(
    (
      item: unknown,
      index: number,
    ) => {
      const row =
        item as {
          event_type?: string;
          title?: string;
          description?: string;
          timestamp?: string;
        };

      return {
        id:
          `${row.event_type ?? "activity"}-${index}`,

        title:
          row.title ??
          "Event Activity",

        description:
          row.description ??
          "",

        time:
          row.timestamp
            ? formatActivityTime(
                row.timestamp,
              )
            : "",

        type:
          mapActivityType(
            row.event_type,
          ),
      };
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Activity Time                                                              */
/* -------------------------------------------------------------------------- */

function formatActivityTime(
  value: string,
): string {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );
}

/* -------------------------------------------------------------------------- */
/* Activity Type                                                              */
/* -------------------------------------------------------------------------- */

function mapActivityType(
  value?: string,
):
  | "upload"
  | "payment"
  | "team"
  | "gallery"
  | "general" {
  switch (value) {
    case "upload":
      return "upload";

    case "payment":
      return "payment";

    case "team":
      return "team";

    case "gallery":
      return "gallery";

    default:
      return "general";
  }
}