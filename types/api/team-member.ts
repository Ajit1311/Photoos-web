export type TeamMemberStatus =
  | "active"
  | "suspended";

export type InvitationStatus =
  | "pending"
  | "accepted"
  | "declined"
  | "expired"
  | "cancelled";

export type TeamMemberDto = {
  member_id: string;

  studio_id: string;

  profile_id: string;

  email?: string | null;

  employee_code?: string | null;

  role_id: string;

  role_code: string;

  role_name: string;

  role_description?: string | null;

  role_level: number;

  role_status?: string | null;

  member_status: TeamMemberStatus;

  invitation_status: InvitationStatus;

  joined_at?: string | null;

  created_at: string;

  updated_at: string;
};

export type PaginationDto = {
  page: number;

  limit: number;

  total: number;

  total_pages: number;
};

export type GetTeamMembersResponse = {
  members: TeamMemberDto[];

  pagination: PaginationDto;
};

export type StudioRoleDto = {
  role_id: string;

  studio_id: string;

  code: string;

  name: string;

  description: string | null;

  level: number;

  is_system: boolean;

  is_default: boolean;

  status: string;

  permission_count: number;
};

export type CreateTeamMemberRequest = {
  full_name: string;

  email: string;

  phone?: string | null;

  role_id: string;
};

export type CreateTeamMemberResponse = {
  invitation_id: string;

  studio_id: string;

  email: string;

  full_name: string;

  phone?: string | null;

  role_id: string;

  role_code: string;

  role_name: string;

  role_level: number;

  status: InvitationStatus;

  expires_at: string;

  invited_at: string;
};

export type UpdateTeamMemberRequest = {
  employee_code?: string | null;
};