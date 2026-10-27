import type {
  TeamMember,
} from "@/types/team-member";

import type {
  TeamMemberDto,
} from "@/types/api/team-member";

export function mapTeamMemberDtoToTeamMember(
  dto: TeamMemberDto,
): TeamMember {

  return {

    id:
      dto.member_id,

    studioId:
      dto.studio_id,

    profileId:
      dto.profile_id,

    email:
      dto.email ?? null,

    employeeCode:
      dto.employee_code ?? null,

    roleId:
      dto.role_id,

    roleCode:
      dto.role_code,

    roleName:
      dto.role_name,

    roleDescription:
      dto.role_description ?? null,

    roleLevel:
      dto.role_level,

    roleStatus:
      dto.role_status ?? null,

    memberStatus:
      dto.member_status,

    invitationStatus:
      dto.invitation_status,

    joinedAt:
      dto.joined_at ?? null,

    createdAt:
      dto.created_at,

    updatedAt:
      dto.updated_at,

  };

}

export function mapTeamMemberDtosToTeamMembers(
  dtos: TeamMemberDto[],
): TeamMember[] {

  return dtos.map(
    mapTeamMemberDtoToTeamMember,
  );

}
