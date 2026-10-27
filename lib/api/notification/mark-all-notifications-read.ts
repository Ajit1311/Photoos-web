import {
  supabase,
} from "@/lib/supabase/client";


export async function markAllNotificationsRead(
  notificationIds:
    string[],
): Promise<
  number
> {

  if (
    notificationIds.length ===
    0
  ) {

    return 0;

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "bulk_mark_notifications_read",
      {
        p_notification_ids:
          notificationIds,
      },
    );


  if (error) {

    throw error;

  }


  return (
    typeof data === "number"
      ? data
      : 0
  );

}
