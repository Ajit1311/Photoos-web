"use client";

import { useQuery } from "@tanstack/react-query";

import {
  dashboardRepository,
} from "@/lib/repositories/dashboard.repository";

import type {
  DashboardSummaryResponse,
} from "@/types/dashboard/summary";

const DASHBOARD_QUERY_KEY = [
  "dashboard-summary",
];

export function useDashboard() {

  const query =
    useQuery<
      DashboardSummaryResponse,
      Error
    >({
      queryKey:
        DASHBOARD_QUERY_KEY,

      queryFn: () =>
        dashboardRepository.load(),

      staleTime:
        1000 * 60,

      gcTime:
        1000 *
        60 *
        10,

      retry: 2,

      refetchOnWindowFocus:
        false,
    });

  return {

    data:
      query.data ?? null,

    loading:
      query.isPending,

    error:
      query.error ?? null,

    reload:
      async () => {

        await query.refetch();

      },

  };

}