"use client";

import { useQuery } from "@tanstack/react-query";

import { useStudioId } from "@/hooks/useStudioId";

import {
  projectsRepository,
} from "@/lib/repositories/projects.repository";

import type {
  GetProjectsResponse,
} from "@/types/api/project";

const PROJECTS_QUERY_KEY = [
  "projects",
] as const;

type UseProjectsOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useProjects(
  options: UseProjectsOptions = {},
) {
  const {
    studioId,
    bootstrapLoading,
  } = useStudioId();

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 25;

  const search =
    options.search ?? "";

  const query =
    useQuery<GetProjectsResponse, Error>({
      queryKey: [
        ...PROJECTS_QUERY_KEY,
        studioId,
        page,
        limit,
        search,
      ],

      enabled:
        !bootstrapLoading &&
        Boolean(studioId),

      queryFn:
        () =>
          projectsRepository.list(
            studioId!,
            page,
            limit,
            search,
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
    data:
      query.data ?? null,

    projects:
      query.data?.projects ?? [],

    pagination:
      query.data?.pagination ?? null,

    loading:
      bootstrapLoading ||
      query.isPending,

    refreshing:
      query.isFetching,

    error:
      query.error ?? null,

    reload:
      query.refetch,
  };
}