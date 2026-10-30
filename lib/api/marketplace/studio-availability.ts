import { getAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

export type StudioAvailabilityStatus =
  | "available"
  | "half_day"
  | "unavailable";

export type StudioAvailabilityDay = {
  availability_date: string;
  availability_status: StudioAvailabilityStatus;
  start_time: string | null;
  end_time: string | null;
  reason: string | null;
  note: string | null;
  source: "default" | "manual" | "booking";
};

export async function getStudioMarketplaceAvailability(
  studioId: string,
  fromDate: string,
  toDate: string,
): Promise<StudioAvailabilityDay[]> {
  if (!studioId) return [];

  // 1. Try internal Next.js API first
  try {
    const params = new URLSearchParams({
      studio_id: studioId,
      from_date: fromDate,
      to_date: toDate,
    });

    const res = await fetch(`/api/marketplace/availability?${params.toString()}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (res.ok) {
      const result = await res.json();
      if (result.success && Array.isArray(result.data)) {
        return result.data;
      }
    }
  } catch (apiErr) {
    console.warn("[StudioAvailability] Internal API fetch notice, falling back to direct DB:", apiErr);
  }

  // 2. Direct Supabase Client Query Fallback
  try {
    const { data, error } = await supabase
      .from("studio_marketplace_availability")
      .select("availability_date, availability_status, start_time, end_time, reason, note, source")
      .eq("studio_id", studioId)
      .gte("availability_date", fromDate)
      .lte("availability_date", toDate)
      .order("availability_date", { ascending: true });

    if (!error && Array.isArray(data)) {
      return data as StudioAvailabilityDay[];
    }
  } catch (dbErr) {
    console.warn("[StudioAvailability] Direct query notice:", dbErr);
  }

  // If no specific slots configured, return empty array (UI treats non-configured days as available)
  return [];
}

export async function setStudioMarketplaceAvailability(
  input: {
    studioId: string;
    availabilityDate: string;
    availabilityStatus: StudioAvailabilityStatus;
    startTime?: string | null;
    endTime?: string | null;
    reason?: string | null;
    note?: string | null;
  },
): Promise<{ success: boolean; data?: unknown }> {
  const token = await getAccessToken();

  // 1. Try internal Next.js API
  try {
    const res = await fetch("/api/marketplace/availability", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        studio_id: input.studioId,
        availability_date: input.availabilityDate,
        availability_status: input.availabilityStatus,
        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,
        reason: input.reason ?? null,
        note: input.note ?? null,
      }),
    });

    const result = await res.json().catch(() => null);

    if (res.ok && result?.success) {
      return { success: true, data: result.data };
    }

    if (result?.error) {
      throw new Error(result.error);
    }
  } catch (apiErr) {
    if (apiErr instanceof Error && !apiErr.message.includes("fetch")) {
      throw apiErr;
    }
  }

  // 2. Direct Supabase Upsert Fallback
  const { data, error } = await supabase
    .from("studio_marketplace_availability")
    .upsert(
      {
        studio_id: input.studioId,
        availability_date: input.availabilityDate,
        availability_status: input.availabilityStatus,
        start_time: input.startTime ?? null,
        end_time: input.endTime ?? null,
        reason: input.reason ?? null,
        note: input.note ?? null,
        source: "manual",
        updated_at: new Date().toISOString(),
      },
      {
        onConflict: "studio_id,availability_date",
      },
    )
    .select()
    .single();

  if (error) {
    throw new Error(error.message || "Failed to save availability.");
  }

  return { success: true, data };
}
