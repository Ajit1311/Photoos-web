import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";

async function getAccessToken() {
  const token = await getFirebaseIdToken();

  if (!token) {
    throw new Error("You must be signed in.");
  }

  return token;
}

export async function getStudioBookingRequests(
  status = "all",
) {
  const token = await getAccessToken();

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

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        result?.message ||
        "Unable to load booking requests.",
    );
  }

  return result.data ?? [];
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
