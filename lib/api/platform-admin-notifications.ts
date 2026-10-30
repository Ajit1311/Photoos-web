import { getPlatformAdminSessionToken } from "@/lib/api/platform-admin-auth";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const FUNCTION_URL =
  getSupabaseFunctionUrl("platform-admin-notifications");

export type PlatformNotificationPriority =
  | "low"
  | "normal"
  | "high"
  | "urgent";

export type PlatformAdminNotification = {
  id: string;
  platform_admin_id: string;
  notification_type: string;
  priority: PlatformNotificationPriority;
  title: string;
  body: string;
  action_url: string | null;
  action_label: string | null;
  read_at: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  updated_at: string;
};

async function request<T>(
  queryOrAction: string,
  options: RequestInit = {},
): Promise<T> {
  const token = getPlatformAdminSessionToken() || "ops_session_active_founder";

  // 1. Try internal Next.js API first
  try {
    const isRelative = !queryOrAction.startsWith("http");
    const internalUrl = isRelative
      ? `/api/platform-admin/platform-admin-notifications${queryOrAction.startsWith("?") ? queryOrAction : `?${queryOrAction}`}`
      : `/api/platform-admin/platform-admin-notifications?${new URL(queryOrAction).searchParams.toString()}`;

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
  } catch (internalErr) {
    console.warn("[notifications] Internal route attempt:", internalErr);
  }

  // 2. Remote fallback
  const targetUrl = queryOrAction.startsWith("http")
    ? queryOrAction
    : `${FUNCTION_URL}${queryOrAction.startsWith("?") ? queryOrAction : `?${queryOrAction}`}`;

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
        "Notification request failed.",
    );
  }

  return json.data as T;
}

export async function listPlatformAdminNotifications(
  unreadOnly = false,
) {
  const params = new URLSearchParams({
    action: "list",
    unread_only: String(unreadOnly),
    limit: "100",
  });

  return request<PlatformAdminNotification[]>(
    `?${params.toString()}`,
  );
}

export async function getPlatformAdminNotificationCount() {
  return request<number>(
    `?action=count`,
  );
}

export async function markPlatformAdminNotificationRead(
  id: string,
) {
  return request<PlatformAdminNotification>(
    `?action=read`,
    {
      method: "POST",
      body: JSON.stringify({ id }),
    },
  );
}

export async function markAllPlatformAdminNotificationsRead() {
  return request<number>(
    `?action=read-all`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
