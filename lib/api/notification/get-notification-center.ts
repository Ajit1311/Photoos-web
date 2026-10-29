import {
  getAccessToken,
} from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

import type {
  NotificationCenterResponse,
  NotificationItem,
} from "@/types/notification/notification";

export async function getNotificationCenter(
  studioId: string,
  profileId: string | null,
  clientId: string | null = null,
  limit: number = 50,
): Promise<NotificationCenterResponse> {
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
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-notification-center`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            studio_id: studioId,
            profile_id: profileId,
            client_id: clientId,
            limit,
          }),
        },
      );

      if (response.ok) {
        const data = (await response.json()) as NotificationCenterResponse;
        if (data && Array.isArray(data.items)) {
          return {
            count: typeof data.count === "number" ? data.count : data.items.length,
            items: data.items,
          };
        }
      }
    } catch (edgeErr) {
      console.warn("[Notifications] Edge function call failed, using DB fallback:", edgeErr);
    }
  }

  // 2. Direct Supabase DB query fallback
  try {
    let query = supabase
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (studioId) {
      query = query.eq("studio_id", studioId);
    }

    const { data: dbItems, error: dbErr } = await query;

    if (!dbErr && Array.isArray(dbItems)) {
      const items: NotificationItem[] = dbItems.map((n: any) => ({
        id: n.id,
        studio_id: n.studio_id,
        recipient_profile_id: n.recipient_profile_id ?? null,
        recipient_client_id: n.recipient_client_id ?? null,
        notification_type: n.notification_type || "system",
        channel: n.channel || "in_app",
        priority: n.priority ?? 0,
        title: n.title || "Notification",
        body: n.body || "",
        payload: n.payload || {},
        metadata: n.metadata || {},
        status: n.status || "unread",
        scheduled_at: n.scheduled_at ?? null,
        expires_at: n.expires_at ?? null,
        sent_at: n.sent_at ?? null,
        delivered_at: n.delivered_at ?? null,
        read_at: n.read_at ?? null,
        recipient_type: n.recipient_type || "member",
        image_url: n.image_url ?? null,
        action_label: n.action_label ?? null,
        action_url: n.action_url ?? null,
        entity_type: n.entity_type ?? null,
        entity_id: n.entity_id ?? null,
        dismissed_at: n.dismissed_at ?? null,
        deleted_at: n.deleted_at ?? null,
        created_at: n.created_at || new Date().toISOString(),
        updated_at: n.updated_at || n.created_at || new Date().toISOString(),
      }));

      return {
        count: items.length,
        items,
      };
    }
  } catch (err) {
    console.warn("[Notifications] Direct query fallback error:", err);
  }

  return {
    count: 0,
    items: [],
  };
}
