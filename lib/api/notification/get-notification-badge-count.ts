import {
  getAccessToken,
} from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

import type {
  NotificationBadgeCount,
} from "@/types/notification/notification";

export async function getNotificationBadgeCount(
  studioId: string,
  profileId: string,
): Promise<NotificationBadgeCount> {
  let token = await getAccessToken();

  if (!token) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      token = session?.access_token ?? null;
    } catch {
      token = null;
    }
  }

  // 1. Try edge function if token is available
  if (token) {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-notification-badge-count`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studio_id: studioId,
            profile_id: profileId,
          }),
        },
      );

      if (response.ok) {
        const data = (await response.json()) as NotificationBadgeCount;
        return {
          total: typeof data?.total === "number" ? data.total : 0,
          unread: typeof data?.unread === "number" ? data.unread : 0,
        };
      }
    } catch (edgeErr) {
      console.warn("[Notifications] Badge edge function failed, using DB fallback:", edgeErr);
    }
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("notifications")
      .select("id, status, read_at", { count: "exact" });

    if (studioId) {
      query = query.eq("studio_id", studioId);
    }

    const { data, count, error } = await query;

    if (!error && data) {
      const unread = data.filter(
        (item: any) => item.status === "unread" || (!item.read_at && item.status !== "read")
      ).length;

      return {
        total: typeof count === "number" ? count : data.length,
        unread,
      };
    }
  } catch (err) {
    console.warn("[Notifications] Badge query fallback error:", err);
  }

  return {
    total: 0,
    unread: 0,
  };
}
