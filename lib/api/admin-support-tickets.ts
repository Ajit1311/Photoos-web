import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const ADMIN_SUPPORT_TICKETS_URL =
  getSupabaseFunctionUrl("admin-support-tickets");

export type SupportTicketStatus =
  | "open"
  | "in_review"
  | "waiting_user"
  | "resolved"
  | "closed";

export type SupportTicketRefundStatus =
  | "not_applicable"
  | "pending"
  | "approved"
  | "rejected"
  | "processed";

export interface AdminSupportTicket {
  id: string;
  studio_id: string;
  created_by: string | null;
  assigned_to: string | null;
  ticket_type: string;
  category: string;
  priority: string;
  status: SupportTicketStatus;
  subject: string;
  description: string;
  subscription_id: string | null;
  payment_id: string | null;
  refund_status: SupportTicketRefundStatus;
  refund_amount: number | null;
  refund_currency: string | null;
  refund_transaction_id: string | null;
  refund_processed_at: string | null;
  admin_notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
}

interface SupportTicketsResponse {
  success: boolean;
  message: string;
  data: {
    tickets: AdminSupportTicket[];
  };
}

interface SupportTicketUpdateResponse {
  success: boolean;
  message: string;
  data: {
    ticket: AdminSupportTicket;
  };
}

async function adminSupportTicketsRequest<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const token = getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Platform Admin authentication is required.",
    );
  }

  const response = await fetch(
    ADMIN_SUPPORT_TICKETS_URL,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    },
  );

  let payload: {
    success?: boolean;
    message?: string;
    data?: unknown;
  } | null = null;

  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok || payload?.success === false) {
    throw new Error(
      payload?.message ??
        `Support ticket request failed (${response.status}).`,
    );
  }

  return payload as T;
}

export async function listAdminSupportTickets(
  status?: SupportTicketStatus,
): Promise<AdminSupportTicket[]> {
  const response =
    await adminSupportTicketsRequest<SupportTicketsResponse>({
      action: "list",
      ...(status ? { status } : {}),
    });

  return response.data?.tickets ?? [];
}

export async function updateAdminSupportTicket(
  ticketId: string,
  status: SupportTicketStatus,
  options?: {
    refund_status?: SupportTicketRefundStatus;
    admin_notes?: string;
  },
): Promise<AdminSupportTicket> {
  if (!ticketId.trim()) {
    throw new Error(
      "Support ticket ID is required.",
    );
  }

  const response =
    await adminSupportTicketsRequest<SupportTicketUpdateResponse>({
      action: "update",
      ticket_id: ticketId,
      status,
      ...(options?.refund_status
        ? {
            refund_status:
              options.refund_status,
          }
        : {}),
      ...(options?.admin_notes !== undefined
        ? {
            admin_notes:
              options.admin_notes,
          }
        : {}),
    });

  return response.data.ticket;
}
