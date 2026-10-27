"use client";

import { useQuery } from "@tanstack/react-query";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  projectsRepository,
} from "@/lib/repositories/projects.repository";

import type {
  ProjectDto,
} from "@/types/api/project";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

export function useProject(
  projectId: string,
) {

  const {
    studioId,
    bootstrapLoading,
  } = useStudioId();

  const query =
    useQuery<ProjectDto, Error>({

      queryKey:
        QUERY_KEYS.project(
          studioId ?? "",
          projectId,
        ),

      enabled:
        Boolean(
          studioId &&
          projectId &&
          !bootstrapLoading,
        ),

      queryFn:
        () =>
          projectsRepository.get(
            studioId!,
            projectId,
          ),

      staleTime:
        1000 * 60,

      gcTime:
        1000 * 60 * 10,

      retry:
        2,

      refetchOnWindowFocus:
        false,

    });

  return {

    project:
      query.data ?? null,

    loading:
      bootstrapLoading ||
      (
        query.isPending &&
        query.fetchStatus === "fetching"
      ),

    refreshing:
      query.isFetching,

    error:
      query.error ?? null,

    reload:
      query.refetch,

  };

}
