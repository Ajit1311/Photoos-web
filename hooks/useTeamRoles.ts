"use client";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  teamMemberRepository,
} from "@/lib/repositories/team-member.repository";

import type {
  StudioRoleDto,
} from "@/types/api/team-member";


export function useTeamRoles() {

  const {
    studioId,
  } = useStudioId();

  const query =
    useAppQuery<StudioRoleDto[]>({
      queryKey: [
        "team-roles",
        studioId,
      ],

      enabled:
        Boolean(studioId),

      queryFn:
        () =>
          teamMemberRepository.getRoles(
            studioId!,
          ),
    });

  return {
    roles:
      query.data ?? [],

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