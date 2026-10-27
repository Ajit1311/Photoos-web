"use client";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  subscriptionUsageRepository,
} from "@/lib/repositories/subscription-usage.repository";

import type {
  SubscriptionUsageSummary,
} from "@/types/subscription/subscription-usage";


export function useSubscriptionUsage() {

  const bootstrap =
    useBootstrapContext();


  const studioId =
    bootstrap
      .data
      ?.workspace
      ?.studio
      ?.id ??
    null;


  const query =
    useAppQuery<
      SubscriptionUsageSummary | null,
      Error
    >({

      queryKey: [
        ...QUERY_KEYS.subscriptionUsage,
        studioId,
      ],

      enabled:
        !!studioId &&
        !bootstrap.loading,

      queryFn: () =>
        subscriptionUsageRepository.load(
          studioId!,
        ),

      retry: 1,

    });


  return {

    data:
      query.data ??
      null,

    loading:
      bootstrap.loading ||
      query.isPending,

    refreshing:
      query.isFetching,

    error:
      bootstrap.error ??
      query.error ??
      null,

    reload:
      query.refetch,

  };

}
