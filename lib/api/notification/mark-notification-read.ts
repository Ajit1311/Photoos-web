
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


  console.log(
    "NOTIFICATION READ RPC RESULT:",
    {
      notificationId,
      data,
      error,
    },
  );


  if (
    error
  ) {

    throw error;

  }


  return (
    typeof data === "number"
      ? data
      : 0
  );

}

