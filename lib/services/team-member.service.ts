import {
  createTeamMember,
  getTeamMember,
  getTeamMembers,
  updateTeamMember,
} from "@/lib/api/team-members";

import {
  mapTeamMemberDtoToTeamMember,
  mapTeamMemberDtosToTeamMembers,
} from "@/lib/mappers/team-member.mapper";

import type {
  PaginationDto,
} from "@/types/api/project";

import type {
  TeamMember,
} from "@/types/team-member";

import type {
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from "@/types/api/team-member";

export type TeamMemberListResult = {

  members: TeamMember[];

  pagination: PaginationDto;

};

class TeamMemberService {

  async getAll(
    studioId: string,
    page = 1,
    limit = 25,
    search = "",
  ): Promise<TeamMemberListResult> {

    const response =
      await getTeamMembers(
        studioId,
        page,
        limit,
        search,
      );

    return {

      members:
        mapTeamMemberDtosToTeamMembers(
          response.members,
        ),

      pagination:
        response.pagination,

    };

  }

  async getById(
    studioId: string,
    memberId: string,
  ): Promise<TeamMember> {

    const dto =
      await getTeamMember(
        studioId,
        memberId,
      );

    return mapTeamMemberDtoToTeamMember(
      dto,
    );

  }

  async create(
    studioId: string,
    payload: CreateTeamMemberRequest,
  ): Promise<TeamMember> {

    const dto =
      await createTeamMember(
        studioId,
        payload,
      );

    return mapTeamMemberDtoToTeamMember(
      dto,
    );

  }

  async update(
    studioId: string,
    memberId: string,
    payload: UpdateTeamMemberRequest,
  ): Promise<TeamMember> {

    const dto =
      await updateTeamMember(
        studioId,
        memberId,
        payload,
      );

    return mapTeamMemberDtoToTeamMember(
      dto,
    );

  }

}

export const teamMemberService =
  new TeamMemberService();