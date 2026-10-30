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
  urlOrQuery: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getPlatformAdminSessionToken() || "ops_session_active_founder";

  // 1. Try internal Next.js API first
  try {
    const isFullUrl = urlOrQuery.startsWith("http");
    const queryPart = isFullUrl ? new URL(urlOrQuery).search : (urlOrQuery.startsWith("?") ? urlOrQuery : `?${urlOrQuery}`);
    const internalUrl = `/api/platform-admin/platform-admin-announcements${queryPart}`;

    const res = await fetch(internalUrl, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...(options.headers ?? {}),
      },
      cache: "no-store",
    });

    if (res.ok) {
      const json = await res.json();
      if (json && json.success) {
        return json.data as T;
      }
    }
  } catch (err) {
    console.warn("[announcements] Internal route attempt:", err);
  }

  // 2. Remote fallback
  const targetUrl = urlOrQuery.startsWith("http")
    ? urlOrQuery
    : `${FUNCTION_URL}${urlOrQuery.startsWith("?") ? urlOrQuery : `?${urlOrQuery}`}`;

  const response = await fetch(targetUrl, {
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
    `?${search.toString()}`,
  );
}

export async function getPlatformAnnouncement(id: string) {
  return request<PlatformAnnouncement>(
    `?action=get&id=${encodeURIComponent(id)}`,
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
    `?action=create`,
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
    `?action=update`,
    {
      method: "PATCH",
      body: JSON.stringify(input),
    },
  );
}

export async function publishPlatformAnnouncement(id: string) {
  return request<PlatformAnnouncement>(
    `?action=publish`,
    {
      method: "POST",
      body: JSON.stringify({ id }),
    },
  );
}

export async function deletePlatformAnnouncement(id: string) {
  return request<boolean>(
    `?id=${encodeURIComponent(id)}`,
    {
      method: "DELETE",
    },
  );
}
