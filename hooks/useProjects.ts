"use client";

import { useQuery } from "@tanstack/react-query";

import {
  projectsRepository,
} from "@/lib/repositories/projects.repository";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import type {
  GetProjectsResponse,
} from "@/types/api/project";

const PROJECTS_QUERY_KEY = [
  "projects",
];

type UseProjectsOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useProjects(
  options: UseProjectsOptions = {},
) {

  const {
    data: bootstrap,
  } = useBootstrapContext();

  const studioId =
    bootstrap?.workspace?.studio?.id;

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
        !!studioId,

      queryFn: () =>
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