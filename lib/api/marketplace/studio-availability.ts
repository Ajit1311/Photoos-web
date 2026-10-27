import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";

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

async function getAccessToken() {
  const token = await getFirebaseIdToken();

  if (!token) {
    throw new Error("You must be signed in.");
  }

  return token;
}

async function availabilityRequest(
  body: Record<string, unknown>,
) {
  const token = await getAccessToken();

  const response = await fetch(
    `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/firebase-studio-marketplace-availability`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );

  const result = await response.json();

  if (!response.ok || !result?.success) {
    throw new Error(
      result?.error ||
        result?.message ||
        "Unable to process availability.",
    );
  }

  return result;
}

export async function getStudioMarketplaceAvailability(
  studioId: string,
  fromDate: string,
  toDate: string,
): Promise<StudioAvailabilityDay[]> {
  const result = await availabilityRequest({
    action: "list",
    studio_id: studioId,
    from_date: fromDate,
    to_date: toDate,
  });

  return Array.isArray(result.data)
    ? result.data
    : [];
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
) {
  return availabilityRequest({
    action: "set",
    studio_id: input.studioId,
    availability_date: input.availabilityDate,
    availability_status: input.availabilityStatus,
    start_time: input.startTime ?? null,
    end_time: input.endTime ?? null,
    reason: input.reason ?? null,
    note: input.note ?? null,
  });
}
