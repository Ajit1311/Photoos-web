import { getAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

export type ChatUnreadNotification = {
  id: string;
  message_id: string;
  conversation_id: string;
  sender_id: string | null;
  message_type: string;
  title: string;
  body: string;
  created_at: string;
  metadata: Record<string, unknown>;
};

type ChatUnreadNotificationResponse = {
  success: boolean;
  data?: ChatUnreadNotification[];
  error?: unknown;
};

export async function getChatUnreadNotifications(
  limit = 200,
): Promise<ChatUnreadNotification[]> {
  let token = await getAccessToken();

  if (!token) {
    try {
      const session = (await supabase.auth.getSession()).data.session;
      token = session?.access_token ?? null;
    } catch {
      token = null;
    }
  }

  if (!token) {
    return [];
  }

  const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  // 1. Try edge function if configured
  try {
    const response = await fetch(
      `${baseUrl}/functions/v1/get-chat-unread-notifications`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          limit,
        }),
      },
    );

    if (response.ok) {
      const result = (await response.json()) as ChatUnreadNotificationResponse;
      if (result.success === true && Array.isArray(result.data)) {
        return result.data;
      }
    }
  } catch (err) {
    console.warn("[getChatUnreadNotifications] Edge function notice:", err);
  }

  // 2. Direct Supabase query fallback for unread messages
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (user?.id) {
      const { data: messages, error } = await supabase
        .from("chat_messages")
        .select("id, conversation_id, sender_id, message_type, content, created_at, metadata")
        .neq("sender_id", user.id)
        .eq("read_status", false)
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && Array.isArray(messages)) {
        return messages.map((m: Record<string, unknown>) => ({
          id: String(m.id),
          message_id: String(m.id),
          conversation_id: String(m.conversation_id),
          sender_id: typeof m.sender_id === "string" ? m.sender_id : null,
          message_type: typeof m.message_type === "string" ? m.message_type : "text",
          title: "New Chat Message",
          body: typeof m.content === "string" ? m.content : "You have a new message",
          created_at: typeof m.created_at === "string" ? m.created_at : new Date().toISOString(),
          metadata: (m.metadata && typeof m.metadata === "object") ? (m.metadata as Record<string, unknown>) : {},
        }));
      }
    }
  } catch (dbErr) {
    console.warn("[getChatUnreadNotifications] Direct query notice:", dbErr);
  }

  return [];
}
