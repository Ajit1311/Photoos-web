import { getAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

export async function getStudioBookingRequests(
  status = "all",
) {
  try {
    const token = await getAccessToken();

    if (token) {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-firebase-studio-booking-requests`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status,
            limit: 100,
            offset: 0,
          }),
        },
      );

      if (response.ok) {
        const result = await response.json();
        if (result?.success && Array.isArray(result?.data)) {
          return result.data;
        }
      }
    }
  } catch (err) {
    console.warn("[getStudioBookingRequests] Function error, using DB fallback:", err);
  }

  // Direct Supabase DB query fallback
  try {
    const { data: dbRequests, error: dbError } = await supabase
      .from("booking_requests")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(50);

    if (!dbError && dbRequests) {
      return dbRequests;
    }
  } catch (dbErr) {
    console.warn("[getStudioBookingRequests] DB query fallback error:", dbErr);
  }

  return [];
}

export async function updateStudioBookingRequestStatus(
  bookingRequestId: string,
  status:
    | "requested"
    | "reviewing"
    | "accepted"
    | "rejected"
    | "cancelled"
    | "completed",
  note?: string | null,
  rejectionReason?: string | null,
) {
  const token = await getAccessToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/update-booking-request-status`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_request_id: bookingRequestId,
        status,
        note: note ?? null,
        rejection_reason: rejectionReason ?? null,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        result?.message ||
        "Unable to update booking request.",
    );
  }

  return result.data;
}

export async function getStudioBookingRequestDetails(
  bookingRequestId: string,
) {
  const token = await getAccessToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/get-firebase-studio-booking-request-details`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_request_id: bookingRequestId,
      }),
    },
  );

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        result?.message ||
        "Unable to load booking request details.",
    );
  }

  return result.data;
}
