import type {
  TeamMember,
  TeamMemberRole,
  TeamMemberStatus,
} from "@/types/team-member";

import type {
  TeamMemberDto,
} from "@/types/api/team-member";

function mapRole(
  role: string,
): TeamMemberRole {

  switch (role) {

    case "owner":
    case "admin":
    case "manager":
    case "photographer":
    case "cinematographer":
    case "drone_operator":
    case "editor":
    case "designer":
    case "sales":
    case "assistant":
      return role;

    default:
      return "assistant";

  }

}

function mapStatus(
  status: string,
): TeamMemberStatus {

  return status === "inactive"
    ? "inactive"
    : "active";

}

export function mapTeamMemberDtoToTeamMember(
  dto: TeamMemberDto,
): TeamMember {

  return {

    id: dto.id,

    fullName:
      dto.full_name,

    email:
      dto.email,

    phone:
      dto.phone,

    avatarUrl:
      dto.avatar_url,

    role:
      mapRole(
        dto.role,
      ),

    status:
      mapStatus(
        dto.status,
      ),

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