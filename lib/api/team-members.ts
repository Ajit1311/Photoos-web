import { supabase } from "@/lib/supabase/client";

import type {
  TeamMemberDto,
  GetTeamMembersResponse,
  CreateTeamMemberRequest,
  UpdateTeamMemberRequest,
} from "@/types/api/team-member";

const FUNCTION_NAME = "team-members";

export async function getTeamMembers(
  studioId: string,
  page = 1,
  limit = 25,
  search = "",
): Promise<GetTeamMembersResponse> {

  const query =
    new URLSearchParams();

  query.set(
    "page",
    page.toString(),
  );

  query.set(
    "limit",
    limit.toString(),
  );

  if (search.trim()) {

    query.set(
      "search",
      search.trim(),
    );

  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    `${FUNCTION_NAME}?${query.toString()}`,
    {
      method: "GET",

      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data as GetTeamMembersResponse;

}

export async function getTeamMember(
  studioId: string,
  memberId: string,
): Promise<TeamMemberDto> {

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    `${FUNCTION_NAME}/${memberId}`,
    {
      method: "GET",

      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data as TeamMemberDto;

}

export async function createTeamMember(
  studioId: string,
  payload: CreateTeamMemberRequest,
): Promise<TeamMemberDto> {

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    FUNCTION_NAME,
    {
      method: "POST",

      body: payload,

      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data as TeamMemberDto;

}

export async function updateTeamMember(
  studioId: string,
  memberId: string,
  payload: UpdateTeamMemberRequest,
): Promise<TeamMemberDto> {

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    `${FUNCTION_NAME}/${memberId}`,
    {
      method: "PUT",

      body: payload,

      headers: {
        "x-studio-id": studioId,
      },
    },
  );

  if (error) {
    throw error;
  }

  return data as TeamMemberDto;

}