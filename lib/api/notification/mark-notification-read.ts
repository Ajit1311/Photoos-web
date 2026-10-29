
import {
  supabase,
} from "@/lib/supabase/client";


export async function markNotificationRead(
  notificationId: string,
): Promise<
  number
> {

  console.log(
    "NOTIFICATION READ START:",
    notificationId,
  );


  const {
    data: sessionData,
    error: sessionError,
  } =
    await supabase.auth.getUser();


  console.log(
    "NOTIFICATION CURRENT USER:",
    {
      userId:
        sessionData.user?.id ??
        null,

      email:
        sessionData.user?.email ??
        null,

      sessionError,
    },
  );


  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "bulk_mark_notifications_read",
        {
          p_notification_ids:
            [
              notificationId,
            ],
        },
      );

    if (!error && typeof data === "number") {
      return data;
    }
  } catch (rpcErr) {
    console.warn("NOTIFICATION READ RPC failed, trying direct table update:", rpcErr);
  }

  // Direct table update fallback
  const { error: updateErr } = await supabase
    .from("notifications")
    .update({
      status: "read",
      read_at: new Date().toISOString(),
    })
    .eq("id", notificationId);

  if (updateErr) {
    console.warn("Direct notification update error:", updateErr);
    return 0;
  }

  return 1;

}

