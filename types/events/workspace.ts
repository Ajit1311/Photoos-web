export const WORKSPACE_TABS = [
  "overview",
  "gallery",
  "face-gallery",
  "albums",
  "payments",
  "chat",
  "reminder",
  "settings",
] as const;


export type WorkspaceTab =
  (
    typeof WORKSPACE_TABS
  )[number];


/* -------------------------------------------------------------------------- */
/* Overview DTOs                                                              */
/* -------------------------------------------------------------------------- */

export interface EventSummary {

  title:
    string;

  clientName:
    string;

  eventType:
    string;

  eventDate:
    string;

  venue?:
    string
    | null;

  status:
    | "draft"
    | "active"
    | "published"
    | "completed"
    | "archived";

}


export interface FinanceSummary {

  packageAmount:
    number;

  advanceAmount:
    number;

  discount:
    number;

  balanceAmount:
    number;

  paymentStatus:
    | "pending"
    | "partial"
    | "paid"
    | "overdue";

  paymentDueDate?:
    string
    | null;

}


export interface TodayTask {

  id:
    string;

  title:
    string;

  status:
    | "pending"
    | "completed";

  priority:
    | "low"
    | "medium"
    | "high";

}


export interface TeamMemberSummary {

  id:
    string;

  name:
    string;

  role:
    string;

  status:
    | "assigned"
    | "confirmed"
    | "pending";

}


export interface RecentActivity {

  id:
    string;

  title:
    string;

  description:
    string;

  time:
    string;

  type:
    | "upload"
    | "payment"
    | "team"
    | "gallery"
    | "general";

}


/* -------------------------------------------------------------------------- */
/* Workspace                                                                  */
/* -------------------------------------------------------------------------- */

export interface EventWorkspace {

  id:
    string;

  summary:
    EventSummary;

  finance:
    FinanceSummary;

  tasks:
    TodayTask[];

  team:
    TeamMemberSummary[];

  activities:
    RecentActivity[];

}