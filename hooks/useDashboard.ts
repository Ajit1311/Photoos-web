"use client";

import { useBootstrapContext } from "@/context/BootstrapContext";
import { useAppQuery } from "@/hooks/useAppQuery";
import { QUERY_KEYS } from "@/hooks/query-keys";
import { dashboardRepository } from "@/lib/repositories/dashboard.repository";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

export function useDashboard() {
  const bootstrap =
    useBootstrapContext();

  const query =
    useAppQuery<
      DashboardSummaryResponse,
      Error
    >({
      queryKey: QUERY_KEYS.dashboard,

      enabled:
        !!bootstrap.data &&
        !bootstrap.loading,

      queryFn: () =>
        dashboardRepository.load(),

      retry: 1,
    });

  return {
    data: query.data ?? null,

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