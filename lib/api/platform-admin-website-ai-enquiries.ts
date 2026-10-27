import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const PLATFORM_ADMIN_WEBSITE_AI_ENQUIRIES_URL =
  getSupabaseFunctionUrl("platform-admin-website-ai-enquiries");


// =============================================================================
// TYPES
// =============================================================================

export type WebsiteAiEnquiryStatus =
  | "new"
  | "contacted"
  | "follow_up"
  | "converted"
  | "closed";

export interface WebsiteAiEnquiry {
  id: string;
  visitor_id: string | null;
  session_id: string | null;
  status: WebsiteAiEnquiryStatus;
  visitor_name: string | null;
  visitor_email: string | null;
  visitor_phone: string | null;
  source: string | null;
  landing_page: string | null;
  metadata: Record<string, unknown> | null;
  human_requested_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface WebsiteAiMessage {
  id: string;
  conversation_id: string;
  role: "visitor" | "assistant" | "system";
  message_type: "text" | "system";
  content: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}


// =============================================================================
// RESPONSE TYPES
// =============================================================================

interface WebsiteAiEnquiryCountResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  data?: {
    count: number;
  };
}

interface WebsiteAiEnquiryListResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  data?: {
    enquiries: WebsiteAiEnquiry[];
  };
}

interface WebsiteAiEnquiryMessagesResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  data?: {
    messages: WebsiteAiMessage[];
  };
}

interface WebsiteAiEnquiryUpdateResponse {
  success: boolean;
  message?: string;
  error?: {
    code?: string;
    message?: string;
  };
  data?: WebsiteAiEnquiry;
}


// =============================================================================
// COMMON REQUEST
// =============================================================================

async function websiteAiEnquiriesRequest<T>(
  body: Record<string, unknown>,
): Promise<T> {

  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error(
      "Platform Admin authentication is required.",
    );
  }


  const response =
    await fetch(
      PLATFORM_ADMIN_WEBSITE_AI_ENQUIRIES_URL,
      {
        method: "POST",

        headers: {
          "Content-Type":
            "application/json",

          Authorization:
            `Bearer ${token}`,
        },

        body:
          JSON.stringify(body),

        cache: "no-store",
      },
    );


  let payload: T | null = null;

  try {

    payload =
      (await response.json()) as T;

  } catch {

    payload = null;

  }


  if (!response.ok) {

    const errorPayload =
      payload as
        | {
            message?: string;
            error?: {
              message?: string;
            };
          }
        | null;

    throw new Error(
      errorPayload?.error?.message ??
        errorPayload?.message ??
        `Website AI enquiry request failed (${response.status}).`,
    );

  }


  return payload as T;
}


// =============================================================================
// COUNT
// =============================================================================

export async function getWebsiteAiEnquiryCount(): Promise<number> {

  const payload =
    await websiteAiEnquiriesRequest<WebsiteAiEnquiryCountResponse>(
      {
        action: "count",
      },
    );


  if (
    !payload?.success
  ) {

    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        "Unable to load Website AI enquiry count.",
    );

  }


  return Number(
    payload?.data?.count ??
      0,
  );
}


// =============================================================================
// LIST
// =============================================================================

export async function listWebsiteAiEnquiries(
  status?: WebsiteAiEnquiryStatus | null,
  limit = 50,
  offset = 0,
): Promise<WebsiteAiEnquiry[]> {

  const payload =
    await websiteAiEnquiriesRequest<WebsiteAiEnquiryListResponse>(
      {
        action: "list",

        status:
          status ??
          null,

        limit,

        offset,
      },
    );


  if (
    !payload?.success
  ) {

    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        "Unable to load Website AI enquiries.",
    );

  }


  return (
    payload?.data?.enquiries ??
    []
  );
}


// =============================================================================
// MESSAGES
// =============================================================================

export async function getWebsiteAiEnquiryMessages(
  conversationId: string,
): Promise<WebsiteAiMessage[]> {

  if (!conversationId) {

    throw new Error(
      "Conversation ID is required.",
    );

  }


  const payload =
    await websiteAiEnquiriesRequest<WebsiteAiEnquiryMessagesResponse>(
      {
        action: "messages",

        conversation_id:
          conversationId,
      },
    );


  if (
    !payload?.success
  ) {

    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        "Unable to load Website AI conversation.",
    );

  }


  return (
    payload?.data?.messages ??
    []
  );
}


// =============================================================================
// UPDATE
// =============================================================================

export async function updateWebsiteAiEnquiry(
  conversationId: string,
  status: WebsiteAiEnquiryStatus,
  visitorName?: string | null,
  visitorEmail?: string | null,
  visitorPhone?: string | null,
): Promise<WebsiteAiEnquiry> {

  if (!conversationId) {

    throw new Error(
      "Conversation ID is required.",
    );

  }


  const payload =
    await websiteAiEnquiriesRequest<WebsiteAiEnquiryUpdateResponse>(
      {
        action: "update",

        conversation_id:
          conversationId,

        status,

        visitor_name:
          visitorName ??
          null,

        visitor_email:
          visitorEmail ??
          null,

        visitor_phone:
          visitorPhone ??
          null,
      },
    );


  if (
    !payload?.success ||
    !payload?.data
  ) {

    throw new Error(
      payload?.error?.message ??
        payload?.message ??
        "Unable to update Website AI enquiry.",
    );

  }


  return payload.data;
}
