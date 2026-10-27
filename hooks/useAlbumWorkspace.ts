"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAlbumDashboard,
  getAlbumWorkspace,
} from "@/lib/api/albums";

export const ALBUM_WORKSPACE_QUERY_KEY =
  ["album", "workspace"] as const;

export function useAlbumWorkspace(
  albumId: string | null,
) {
  const workspaceQuery =
    useQuery({
      queryKey: [
        ...ALBUM_WORKSPACE_QUERY_KEY,
        albumId,
      ],

      enabled:
        Boolean(albumId),

      queryFn:
        async () => {
          if (!albumId) {
            throw new Error(
              "Album ID is missing.",
            );
          }

          return getAlbumWorkspace(
            albumId,
          );
        },

      staleTime:
        1000 * 30,

      gcTime:
        1000 * 60 * 10,

      refetchOnWindowFocus:
        false,

      retry: 2,
    });

  const dashboardQuery =
    useQuery({
      queryKey: [
        "album",
        "dashboard",
        albumId,
      ],

      enabled:
        Boolean(albumId),

      queryFn:
        async () => {
          if (!albumId) {
            throw new Error(
              "Album ID is missing.",
            );
          }

          return getAlbumDashboard(
            albumId,
          );
        },

      staleTime:
        1000 * 30,

      gcTime:
        1000 * 60 * 10,

      refetchOnWindowFocus:
        false,

      retry: 2,
    });

  return {
    workspace:
      workspaceQuery.data ??
      null,

    dashboard:
      dashboardQuery.data ??
      null,

    loading:
      workspaceQuery.isPending ||
      dashboardQuery.isPending,

    refreshing:
      workspaceQuery.isFetching ||
      dashboardQuery.isFetching,

    error:
      workspaceQuery.error ??
      dashboardQuery.error ??
      null,

    refresh:
      async () => {
        await Promise.all([
          workspaceQuery.refetch(),
          dashboardQuery.refetch(),
        ]);
      },
  };
}