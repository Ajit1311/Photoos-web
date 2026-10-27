"use client";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  getPlatformAdminDashboard,
  type PlatformAdminDashboard,
} from "@/lib/api/platform-admin";


export function usePlatformAdminDashboard(
  enabled: boolean,
) {

  const query =
    useAppQuery<
      PlatformAdminDashboard,
      Error
    >({

      queryKey:
        [
          "platform-admin-dashboard",
        ],

      queryFn:
        () =>
          getPlatformAdminDashboard(),

      enabled,

      retry:
        1,

    });


  return {

    data:
      query.data ??
      null,

    loading:
      enabled &&
      query.isPending,

    refreshing:
      query.isFetching,

    error:
      query.error ??
      null,

    reload:
      query.refetch,

  };

}
