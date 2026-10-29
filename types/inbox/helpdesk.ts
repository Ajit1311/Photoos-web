export type UserRole =
  | "SUPER_ADMIN"
  | "MARKETING_AGENT"
  | "SUPPORT_AGENT"
  | "BILLING_AGENT";

export type Department =
  | "all"
  | "support"
  | "billing"
  | "marketing"
  | "founder_legal";

export type TicketStatus = "all" | "unread" | "open" | "pending" | "resolved";

export type TicketPriority = "urgent" | "high" | "normal" | "low";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  roleTitle: string;
  allowedDepartment: Department; // 'all' for SUPER_ADMIN, specific for agents
  avatar: string;
}

export interface EmailAttachment {
  name: string;
  size: string;
  type: string;
}

export interface EmailMessage {
  id: string;
  threadId: string;
  senderType: "customer" | "agent";
  senderName: string;
  senderEmail: string;
  departmentEmail: string;
  body: string;
  timestamp: string;
  attachments?: EmailAttachment[];
}

export interface EmailThread {
  id: string;
  department: Exclude<Department, "all">;
  departmentEmail: string;
  subject: string;
  snippet: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  customerAvatar?: string;
  customerPlan: "Free Trial" | "Growth Studio" | "Pro Studio" | "Enterprise" | "Prospective Partner";
  status: "open" | "pending" | "resolved";
  priority: TicketPriority;
  unread: boolean;
  assignedTo?: string;
  createdAt: string;
  lastUpdated: string;
  messages: EmailMessage[];
}

export interface CannedResponse {
  id: string;
  title: string;
  department: Department;
  content: string;
}

