"use client";

import {
  useQueryClient,
} from "@tanstack/react-query";

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
  ProjectDto,
  UpdateProjectRequest,
} from "@/types/api/project";

type UpdateProjectVariables = {
  projectId: string;
  payload: UpdateProjectRequest;
};

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const { studioId } = useStudioId();

  return useAppMutation<
    ProjectDto,
    Error,
    UpdateProjectVariables
  >({
    mutationFn: async ({ projectId, payload }) => {
      if (!studioId) {
        throw new Error("Studio ID is required.");
      }

      return projectsRepository.update(
        studioId,
        projectId,
        payload,
      );
    },

    onSuccess: async (project) => {
      if (!studioId) {
        return;
      }

      // Single project cache update (Optimistic UI sync)
      queryClient.setQueryData(
        QUERY_KEYS.project(studioId, project.id),
        project,
      );

      // Invalidate specific project details cache
      await queryClient.invalidateQueries({
        queryKey: QUERY_KEYS.project(studioId, project.id),
      });
    },

    invalidateKeys: [
      QUERY_KEYS.projects,
    ],
  });
}