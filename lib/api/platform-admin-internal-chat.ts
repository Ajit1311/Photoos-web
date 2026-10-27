import {
  getPlatformAdminSessionToken,
} from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const ENDPOINT =
  getSupabaseFunctionUrl("platform-admin-internal-chat");

export type InternalChatEmployee = {
  id: string;
  email: string;
  status: string;
  profile_id: string;
  display_name: string | null;
  employee_code: string | null;
  last_activity_at: string | null;
};

export type InternalChatConversation = {
  conversation_id: string;
  title?: string | null;
  status?: string;
  created_at: string;
  updated_at: string;
  members?: Array<{
    profile_id: string | null;
    client_id?: string | null;
    display_name?: string | null;
    email?: string | null;
    employee_code?: string | null;
    role: string | null;
  }>;
};

export type InternalChatMessage = {
  id: string;
  conversation_id: string;
  sender_id: string;
  message_type: string;
  content: string | null;
  reply_to_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  message_encryption_key_version?: number;
  message_encryption_algorithm?: string;
  message_encryption_status?: string;
  decryption_failed?: boolean;
};

function getSessionToken(): string {
  const token =
    getPlatformAdminSessionToken();

  if (!token) {
    throw new Error("Admin session required.");
  }

  return token;
}


async function request<T>(
  url: string,
  options?: RequestInit,
): Promise<T> {
  const token = getSessionToken();

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options?.headers ?? {}),
    },
    cache: "no-store",
  });

  const result = await response.json().catch(() => null);

  if (!response.ok || result?.success !== true) {
    throw new Error(
      result?.error ??
        result?.message ??
        `Internal chat request failed (${response.status}).`,
    );
  }

  return result.data as T;
}

export async function getInternalChatEmployees() {
  return request<InternalChatEmployee[]>(
    `${ENDPOINT}?action=employees`,
  );
}

export async function getInternalChatConversations() {
  return request<InternalChatConversation[]>(
    `${ENDPOINT}?action=conversations`,
  );
}

export async function getInternalChatMessages(
  conversationId: string,
) {
  return request<InternalChatMessage[]>(
    `${ENDPOINT}?action=messages&conversation_id=${encodeURIComponent(
      conversationId,
    )}`,
  );
}

export async function createInternalChatConversation(
  employeeProfileId: string,
) {
  return request<string>(
    `${ENDPOINT}?action=conversation`,
    {
      method: "POST",
      body: JSON.stringify({
        employee_profile_id: employeeProfileId,
      }),
    },
  );
}

export async function sendInternalChatMessage(
  conversationId: string,
  content: string,
) {
  return request<string>(
    `${ENDPOINT}?action=message`,
    {
      method: "POST",
      body: JSON.stringify({
        conversation_id: conversationId,
        content,
        message_type: "text",
        metadata: {},
      }),
    },
  );
}
