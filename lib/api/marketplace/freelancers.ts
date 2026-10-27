import { getAccessToken } from "@/lib/auth/session";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

const FUNCTION_URL =
  getSupabaseFunctionUrl("firebase-marketplace-freelancers");

export interface MarketplaceFreelancer {
  id: string;
  display_name: string;
  bio: string | null;
  profile_image_url: string | null;
  experience_years: number | null;
  primary_role: string | null;
  skills: string[] | null;
  location: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  portfolio_urls: unknown;
  instagram_url: string | null;
  facebook_url: string | null;
  youtube_url: string | null;
  website_url: string | null;
  availability_status: string | null;
  daily_rate: number | null;
  currency: string | null;
  minimum_booking_days: number | null;
  cancellation_policy?: string | null;
}

export interface FreelancerBookedDatesResponse {
  freelancer_id: string;
  from_date: string;
  to_date: string;
  booked_dates: string[];
}


export interface FreelancerProfileUpsertPayload {
  display_name: string;
  bio?: string | null;
  phone?: string | null;
  email?: string | null;
  profile_image_url?: string | null;
  experience_years?: number | null;
  primary_role?: string | null;
  skills?: string[];
  location?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
  portfolio_urls?: string[];
  instagram_url?: string | null;
  facebook_url?: string | null;
  youtube_url?: string | null;
  website_url?: string | null;
  daily_rate?: number | null;
  currency?: string | null;
  minimum_booking_days?: number | null;
  cancellation_policy?: string | null;
}

export async function upsertFreelancerProfile(
  payload: FreelancerProfileUpsertPayload,
): Promise<{ freelancer_id: string; profile_id: string }> {
  return callFreelancerFunction<{
    freelancer_id: string;
    profile_id: string;
  }>({
    action: "upsert",
    ...payload,
  });
}


export interface FreelancerHireRequest {
  studio_id: string;
  freelancer_id: string;
  booking_date: string;
  start_time?: string | null;
  end_time?: string | null;
  studio_note?: string | null;
  number_of_days?: number;
  agreed_amount?: number | null;
}

async function callFreelancerFunction<T>(
  body: Record<string, unknown>,
): Promise<T> {
  const token = await getAccessToken();

  if (!token) {
    throw new Error("Please login to continue.");
  }

  const response = await fetch(FUNCTION_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const result = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      result?.error?.message ??
        result?.message ??
        "Freelancer marketplace request failed.",
    );
  }

  if (result?.success === false) {
    throw new Error(
      result?.error?.message ??
        "Freelancer marketplace request failed.",
    );
  }

  return result?.data as T;
}

export async function getMarketplaceFreelancers(params?: {
  city?: string;
  role?: string;
  limit?: number;
  offset?: number;
}): Promise<MarketplaceFreelancer[]> {
  const data = await callFreelancerFunction<MarketplaceFreelancer[]>({
    action: "list",
    city: params?.city ?? null,
    role: params?.role ?? null,
    limit: params?.limit ?? 50,
    offset: params?.offset ?? 0,
  });

  return Array.isArray(data) ? data : [];
}

export async function getMarketplaceFreelancer(
  freelancerId: string,
): Promise<MarketplaceFreelancer> {
  return callFreelancerFunction<MarketplaceFreelancer>({
    action: "detail",
    freelancer_id: freelancerId,
  });
}

export interface ConfirmedFreelancerContact {
  freelancer_id: string;
  display_name: string;
  phone: string | null;
  email: string | null;
}


export interface FreelancerHiringRequest {
  hiring_id: string;
  studio_id: string;
  studio_name: string;
  freelancer_id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  studio_note: string | null;
  freelancer_note: string | null;
  agreed_amount: number | null;
  currency: string;
  number_of_days: number;
  daily_rate: number | null;
  total_amount: number | null;
  created_at: string;
  updated_at: string;
}


export async function getFreelancerHiringRequests(
  status?: string,
): Promise<FreelancerHiringRequest[]> {
  return callFreelancerFunction<FreelancerHiringRequest[]>({
    action: "freelancer_hirings",
    status: status || null,
  });
}


export interface FreelancerBookingHistory {
  hiring_id: string;
  studio_id: string;
  studio_name: string;
  freelancer_id: string;
  booking_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  studio_note: string | null;
  freelancer_note: string | null;
  agreed_amount: number | null;
  currency: string;
  number_of_days: number;
  daily_rate: number | null;
  total_amount: number | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
}


export async function getFreelancerBookingHistory(params: {
  studioId: string;
  freelancerId: string;
}): Promise<FreelancerBookingHistory[]> {
  return callFreelancerFunction<FreelancerBookingHistory[]>({
    action: "booking_history",
    studio_id: params.studioId,
    freelancer_id: params.freelancerId,
  });
}


export async function acceptFreelancerHiring(
  hiringId: string,
): Promise<string> {
  const data = await callFreelancerFunction<{
    hiring_id: string;
    status: string;
  }>({
    action: "accept_hiring",
    hiring_id: hiringId,
  });

  return data.hiring_id;
}


export async function rejectFreelancerHiring(
  hiringId: string,
  freelancerNote?: string | null,
): Promise<string> {
  const data = await callFreelancerFunction<{
    hiring_id: string;
    status: string;
  }>({
    action: "reject_hiring",
    hiring_id: hiringId,
    freelancer_note: freelancerNote?.trim() || null,
  });

  return data.hiring_id;
}


export async function getConfirmedFreelancerContact(params: {
  studioId: string;
  freelancerId: string;
}): Promise<ConfirmedFreelancerContact> {
  return callFreelancerFunction<ConfirmedFreelancerContact>({
    action: "contact",
    studio_id: params.studioId,
    freelancer_id: params.freelancerId,
  });
}


export async function getFreelancerBookedDates(params: {
  freelancerId: string;
  fromDate: string;
  toDate: string;
}): Promise<FreelancerBookedDatesResponse> {
  return callFreelancerFunction<FreelancerBookedDatesResponse>({
    action: "booked_dates",
    freelancer_id: params.freelancerId,
    from_date: params.fromDate,
    to_date: params.toDate,
  });
}

export async function requestFreelancerHire(
  payload: FreelancerHireRequest,
): Promise<string> {
  const data = await callFreelancerFunction<{
    hiring_id: string;
  }>({
    action: "hire",
    ...payload,
  });

  return data.hiring_id;
}
