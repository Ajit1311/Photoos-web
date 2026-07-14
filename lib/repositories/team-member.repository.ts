import type {
  TeamMember,
} from "@/types/team-member";

import type {
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from "@/types/api/team-member";

import {
  teamMemberService,
  type TeamMemberListResult,
} from "@/lib/services/team-member.service";

class TeamMemberRepository {

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<TeamMemberListResult> {

    return teamMemberService.getAll(
      studioId,
      page,
      limit,
      search,
    );

  }

  async getById(
    studioId: string,
    memberId: string,
  ): Promise<TeamMember> {

    return teamMemberService.getById(
      studioId,
      memberId,
    );

  }

  async create(
    studioId: string,
    payload: CreateTeamMemberRequest,
  ): Promise<TeamMember> {

    return teamMemberService.create(
      studioId,
      payload,
    );

  }

  async update(
    studioId: string,
    memberId: string,
    payload: UpdateTeamMemberRequest,
  ): Promise<TeamMember> {

    return teamMemberService.update(
      studioId,
      memberId,
      payload,
    );

  }

}

export const teamMemberRepository =
  new TeamMemberRepository();