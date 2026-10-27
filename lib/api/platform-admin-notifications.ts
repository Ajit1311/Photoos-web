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
    `${FUNCTION_URL}?${params.toString()}`,
  );
}

export async function getPlatformAdminNotificationCount() {
  return request<number>(
    `${FUNCTION_URL}?action=count`,
  );
}

export async function markPlatformAdminNotificationRead(
  id: string,
) {
  return request<PlatformAdminNotification>(
    `${FUNCTION_URL}?action=read`,
    {
      method: "POST",
      body: JSON.stringify({ id }),
    },
  );
}

export async function markAllPlatformAdminNotificationsRead() {
  return request<number>(
    `${FUNCTION_URL}?action=read-all`,
    {
      method: "POST",
      body: JSON.stringify({}),
    },
  );
}
