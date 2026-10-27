import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import { supabase } from "@/lib/supabase/client";

export type StudioBooking = {
  id: string;
  booking_number: string | null;
  studio_id: string;
  client_id: string;
  project_id: string | null;
  assigned_to: string | null;
  created_by: string;
  updated_by: string | null;
  title: string;
  event_type: string | null;
  status: string;
  payment_status: string | null;
  event_date: string | null;
  event_time: string | null;
  venue_name: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  guest_count: number | null;
  advance_amount: number | null;
  total_amount: number | null;
  currency: string | null;
  notes: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
};

export async function getStudioBookings(options: {
  status?: string | null;
  search?: string | null;
  clientId?: string | null;
  photographerId?: string | null;
  fromDate?: string | null;
  toDate?: string | null;
  limit?: number;
  offset?: number;
} = {}): Promise<StudioBooking[]> {
  const accessToken = await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase.functions.invoke(
    "booking-dashboard",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        status: options.status ?? null,
        search: options.search ?? null,
        clientId: options.clientId ?? null,
        photographerId: options.photographerId ?? null,
        fromDate: options.fromDate ?? null,
        toDate: options.toDate ?? null,
        limit: options.limit ?? 100,
        offset: options.offset ?? 0,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
        data?.message ??
        "Unable to load bookings.",
    );
  }

  return Array.isArray(data.data)
    ? (data.data as StudioBooking[])
    : [];
}

export type StudioBookingCancellationInput = {
  booking_id: string;
  reason_code: string;
  reason_note?: string | null;
  is_genuine?: boolean;
};

export async function cancelStudioBooking(
  input: StudioBookingCancellationInput,
): Promise<{
  success: boolean;
  message?: string;
  data?: StudioBooking;
}> {
  const accessToken = await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error("User is not authenticated.");
  }

  const { data, error } = await supabase.functions.invoke(
    "booking-cancel",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: {
        bookingId: input.booking_id,
        reasonCode: input.reason_code,
        reasonNote: input.reason_note ?? null,
        isGenuine: input.is_genuine ?? true,
        actorType: "studio",
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
        data?.message ??
        "Unable to cancel booking.",
    );
  }

  return data;
}
