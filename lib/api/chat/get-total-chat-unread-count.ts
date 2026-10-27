import {
  getMyChatConversations,
} from "@/lib/api/chat";

export async function getTotalChatUnreadCount(): Promise<number> {
  try {
    const conversations =
      await getMyChatConversations();

    return conversations.reduce(
      (
        total,
        conversation,
      ) =>
        total +
        Number(
          conversation.unread_count ?? 0,
        ),
      0,
    );
  } catch (error) {
    console.warn(
      "[Chat] Unable to load unread count:",
      error,
    );

    return 0;
  }
}
