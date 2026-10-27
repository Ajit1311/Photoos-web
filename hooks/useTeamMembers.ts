"use client";

import {
  useAppQuery,
} from "@/hooks/useAppQuery";

import {
  useStudioId,
} from "@/hooks/useStudioId";

import {
  QUERY_KEYS,
} from "@/hooks/query-keys";

import {
  teamMemberRepository,
} from "@/lib/repositories/team-member.repository";

import type {
  TeamMemberListResult,
} from "@/lib/services/team-member.service";

type UseTeamMembersOptions = {
  page?: number;
  limit?: number;
  search?: string;
};

export function useTeamMembers(
  options: UseTeamMembersOptions = {},
) {

  const {
    studioId,
  } = useStudioId();

  const page =
    options.page ?? 1;

  const limit =
    options.limit ?? 25;

  const search =
    options.search ?? "";

  const query =
    useAppQuery<TeamMemberListResult>({

      queryKey: [
        ...QUERY_KEYS.teamMembers,
        studioId,
        page,
        limit,
        search,
      ],

      enabled:
        Boolean(studioId),

      queryFn:
        () =>
          teamMemberRepository.getAll(
            studioId!,
            page,
            limit,
            search,
          ),

    });

  return {

    data:
      query.data ?? null,

    members:
      query.data?.members ?? [],

    pagination:
      query.data?.pagination ?? null,

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