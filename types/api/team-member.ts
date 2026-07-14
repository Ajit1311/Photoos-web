import type {
  PaginationDto,
} from "@/types/api/project";

export type TeamMemberDto = {

  id: string;

  full_name: string;

  email: string | null;

  phone: string | null;

  avatar_url: string | null;

  role: string;

  status: string;

  created_at: string;

  updated_at: string;

};

export type GetTeamMembersResponse = {

  members: TeamMemberDto[];

  pagination: PaginationDto;

};

export type CreateTeamMemberRequest = {

  full_name: string;

  email: string | null;

  phone: string | null;

  avatar_url: string | null;

  role: string;

};

export type UpdateTeamMemberRequest = {

  full_name?: string;

  email?: string | null;

  phone?: string | null;

  avatar_url?: string | null;

  role?: string;

  status?: string;

};