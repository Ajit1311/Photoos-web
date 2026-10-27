import {
  supabase,
} from "@/lib/supabase/client";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";


export async function getDashboardSummary(): Promise<
  DashboardSummaryResponse
> {

    const {
      getAccessToken,
    } =
      await import("@/lib/auth/session");

    const accessToken =
      await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to load the dashboard.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "dashboard-metrics",
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
      data?.error ??
      "Unable to load dashboard.",
    );
  }

  return data.data;
}
