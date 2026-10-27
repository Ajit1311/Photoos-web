import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const FUNCTION_URL =
  getSupabaseFunctionUrl("platform-admin-announcements");

export type AnnouncementStatus =
  | "draft"
  | "scheduled"
  | "published"
  | "cancelled";

export type AnnouncementPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type AnnouncementAudience =
  | "all_users"
  | "all_studios"
  | "studio_owners"
  | "studio_admins"
  | "platform_admin_employees";

export type AnnouncementChannel =
  | "in_app"
  | "email"
  | "sms"
  | "whatsapp"
  | "push"
  | "webhook";

export type PlatformAnnouncement = {
  id: string;
  title: string;
  body: string;
  status: AnnouncementStatus;
  priority: AnnouncementPriority;
  audience_type: AnnouncementAudience;
  channel: AnnouncementChannel;
  scheduled_at: string | null;
  published_at: string | null;
  created_by: string;
  updated_by: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

async function request<T>(
  url: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getPlatformAdminSessionToken();

  if (!token) {
    throw new Error("Platform admin session expired.");
  }

  const response = await fetch(url, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...(options.headers ?? {}),
    },
    cache: "no-store",
  });

  const json = await response.json().catch(() => null);

  if (!response.ok || !json?.success) {
    throw new Error(
      json?.error?.message ??
        json?.message ??
        "Announcement request failed.",
    );
  }

  return json.data as T;
}

export async function listPlatformAnnouncements(params?: {
  status?: AnnouncementStatus | "";
  keyword?: string;
  limit?: number;
  offset?: number;
}) {
  const search = new URLSearchParams({
    action: "list",
  });

  if (params?.status) search.set("status", params.status);
  if (params?.keyword) search.set("keyword", params.keyword);
  if (params?.limit) search.set("limit", String(params.limit));
  if (params?.offset) search.set("offset", String(params.offset));

  return request<PlatformAnnouncement[]>(
    `${FUNCTION_URL}?${search.toString()}`,
  );
}

export async function getPlatformAnnouncement(id: string) {
  return request<PlatformAnnouncement>(
    `${FUNCTION_URL}?action=get&id=${encodeURIComponent(id)}`,
  );
}

export async function createPlatformAnnouncement(input: {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience_type: AnnouncementAudience;
  channel: AnnouncementChannel;
  status: AnnouncementStatus;
  scheduled_at?: string | null;
}) {
  return request<PlatformAnnouncement>(
    `${FUNCTION_URL}?action=create`,
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  );
}

export async function updatePlatformAnnouncement(input: {
  id: string;
  title?: string;
  body?: string;
  priority?: AnnouncementPriority;
  audience_type?: AnnouncementAudience;
  channel?: AnnouncementChannel;
  status?: AnnouncementStatus;
  scheduled_at?: string | null;
}) {
  return request<PlatformAnnouncement>(
    FUNCTION_URL,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function publishPlatformAnnouncement(id: string) {
  return request<PlatformAnnouncement>(
    `${FUNCTION_URL}?action=publish`,
    {
      method: "POST",
      body: JSON.stringify({ id }),
    },
  );
}

export async function deletePlatformAnnouncement(id: string) {
  return request<boolean>(
    `${FUNCTION_URL}?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
