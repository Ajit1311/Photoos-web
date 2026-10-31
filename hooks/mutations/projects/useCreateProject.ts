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

        const effectiveStudioId =
          studioId ||
          (typeof window !== "undefined"
            ? localStorage.getItem("photoos_active_studio_id") ||
              localStorage.getItem("photoos_studio_id") ||
              ""
            : "");

        return projectsRepository.create(
          effectiveStudioId,
          payload,
        );

      },

    invalidateKeys: [

      QUERY_KEYS.projects,

      QUERY_KEYS.clients,

    ],

  });

}