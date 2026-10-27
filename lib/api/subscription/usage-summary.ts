import {
  supabase,
} from "@/lib/supabase/client";

import type {
  SubscriptionUsageSummaryResponse,
} from "@/types/subscription/subscription-usage";


export async function getSubscriptionUsageSummary(
  studioId: string,
): Promise<
  SubscriptionUsageSummaryResponse
> {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_subscription_usage_summary",
      {
        p_studio_id:
          studioId,
      },
    );


  if (
    error
  ) {
    throw error;
  }


  return data as
    SubscriptionUsageSummaryResponse;

}
