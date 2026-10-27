"use client";

import {
  useAppMutation,
} from "@/hooks/useAppMutation";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  projectsRepository,
} from "@/lib/repositories/projects.repository";

import type {
  CreateProjectRequest,
  ProjectDto,
} from "@/types/api/project";

export function useCreateProject() {

  const {
    studioId,
  } = useStudioId();

  return useAppMutation<
    ProjectDto,
    Error,
    CreateProjectRequest
  >({

    mutationFn:
      async (
        payload,
      ) => {

        if (!studioId) {

          throw new Error(
            "Studio ID is required.",
          );

        }

        return projectsRepository.create(
          studioId,
          payload,
        );

      },

    invalidateKeys: [

      QUERY_KEYS.projects,

      QUERY_KEYS.clients,

    ],

  });

}