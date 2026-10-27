"use client";

import { useAppQuery } from "@/hooks/useAppQuery";
import { useStudioId } from "@/hooks/useStudioId";
import { teamMemberRepository } from "@/lib/repositories/team-member.repository";

import type {
  TeamMember,
} from "@/types/team-member";

export function useTeamMember(
  memberId: string,
) {

  const {
    studioId,
  } = useStudioId();

  const query =
    useAppQuery<TeamMember>({

      queryKey: [
        "team-member",
        studioId,
        memberId,
      ],

      enabled:
        Boolean(
          studioId &&
          memberId,
        ),

      queryFn:
        () =>
          teamMemberRepository.getById(
            studioId!,
            memberId,
          ),

    });

  return {

    member:
      query.data ?? null,

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