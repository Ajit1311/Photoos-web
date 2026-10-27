import {
  getSubscriptionUsageSummary,
} from "@/lib/api/subscription/usage-summary";

import type {
  SubscriptionUsageSummaryResponse,
} from "@/types/subscription/subscription-usage";


class SubscriptionUsageRepository {

  async load(
    studioId: string,
  ): Promise<
    SubscriptionUsageSummaryResponse
  > {

    return await getSubscriptionUsageSummary(
      studioId,
    );

  }

}


export const subscriptionUsageRepository =
  new SubscriptionUsageRepository();
