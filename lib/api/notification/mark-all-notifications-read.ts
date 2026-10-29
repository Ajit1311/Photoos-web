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


  try {
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

    if (!error && typeof data === "number") {
      return data;
    }
  } catch (rpcErr) {
    console.warn("RPC failed, falling back to direct table update:", rpcErr);
  }

  // Fallback to direct table update
  const { error: updateErr } = await supabase
    .from("notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString(),
    })
    .in("id", notificationIds);

  if (updateErr) {
    console.warn("Direct mark all read error:", updateErr);
    return 0;
  }

  return notificationIds.length;

}
