"use client";

import {
  useQuery,
} from "@tanstack/react-query";

import {
  getAlbumCards,
} from "@/lib/api/albums";

import {
  useStudioId,
} from "@/hooks/useStudioId";

export const ALBUM_CARDS_QUERY_KEY =
  ["albums", "cards"] as const;

export function useAlbumCards(
  options?: {
    projectId?: string | null;
    clientId?: string | null;
    limit?: number;
    offset?: number;
  },
) {
  const {
    studioId,
    bootstrapLoading,
  } = useStudioId();

  const limit =
    options?.limit ?? 20;

  const offset =
    options?.offset ?? 0;

  const projectId =
    options?.projectId ?? null;

  const clientId =
    options?.clientId ?? null;

  const query =
    useQuery({
      queryKey: [
        ...ALBUM_CARDS_QUERY_KEY,
        studioId,
        projectId,
        clientId,
        limit,
        offset,
      ],

      enabled:
        !bootstrapLoading &&
        Boolean(studioId),

      queryFn:
        async () => {
          if (!studioId) {
            throw new Error(
              "Active studio ID is missing.",
            );
          }

          return getAlbumCards(
            studioId,
            {
              projectId,
              clientId,
              limit,
              offset,
            },
          );
        },

      staleTime:
        1000 * 30,

      gcTime:
        1000 * 60 * 10,

      refetchOnWindowFocus:
        false,
    });

  return {
    data:
      query.data ?? null,

    cards:
      query.data?.cards ?? [],

    totalCount:
      query.data?.total_count ?? 0,

    hasMore:
      query.data?.has_more ?? false,

    loading:
      query.isPending,

    refreshing:
      query.isFetching,

    error:
      query.error ?? null,

    reload:
      query.refetch,
  };
}
