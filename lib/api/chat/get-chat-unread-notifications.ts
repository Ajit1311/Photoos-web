import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";


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

  const token =
    await getFirebaseIdToken();


  if (!token) {

    throw new Error(
      "Firebase authentication token is unavailable.",
    );

  }


  const baseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    "";


  const response =
    await fetch(
      `${baseUrl}/functions/v1/get-chat-unread-notifications`,
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${token}`,

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            limit,
          }),
      },
    );


  const result =
    (
      await response.json()
    ) as ChatUnreadNotificationResponse;


  if (
    !response.ok ||
    result.success !== true
  ) {

    throw new Error(
      typeof result.error === "string"
        ? result.error
        : "Unable to load unread chat notifications.",
    );

  }


  return Array.isArray(
    result.data,
  )
    ? result.data
    : [];

}
