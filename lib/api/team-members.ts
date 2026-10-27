import {
  supabase,
} from "@/lib/supabase/client";

import { getAccessToken } from "@/lib/auth/session";

import type {
  CreateTeamMemberRequest,
  CreateTeamMemberResponse,
  GetTeamMembersResponse,
  StudioRoleDto,
  TeamMemberDto,
  UpdateTeamMemberRequest,
} from "@/types/api/team-member";


const FUNCTION_NAME =
  "team-members";


async function getHeaders(
  studioId: string,
): Promise<Record<string, string>> {

  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  return {
    Authorization:
      `Bearer ${accessToken}`,

    "x-studio-id":
      studioId,
  };
}


async function getFunctionErrorMessage(
  error: unknown,
): Promise<string> {

  if (
    error &&
    typeof error === "object" &&
    "context" in error
  ) {
    const context =
      (
        error as {
          context?: Response;
        }
      ).context;

    if (context instanceof Response) {
      try {
        const body =
          await context.clone().json();

        if (
          typeof body?.error?.message ===
          "string"
        ) {
          return body.error.message;
        }

        if (
          typeof body?.message ===
          "string"
        ) {
          return body.message;
        }
      } catch {
        try {
          const text =
            await context.text();

          if (text.trim()) {
            return text;
          }
        } catch {
          // Ignore response parsing failure.
        }
      }
    }
  }

  if (
    error instanceof Error &&
    error.message
  ) {
    if (
      error.message !==
      "Edge Function returned a non-2xx status code"
    ) {
      return error.message;
    }
  }

  return (
    "Unable to complete the team member request."
  );
}


async function throwFunctionError(
  error: unknown,
): Promise<never> {

  const message =
    await getFunctionErrorMessage(
      error,
    );

  throw new Error(
    message,
  );
}


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
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}?${query.toString()}`,
      {
        method:
          "GET",

        headers:
          await getHeaders(
            studioId,
          ),
      },
    );

  if (error) {
    await throwFunctionError(
      error,
    );
  }

  if (!data) {
    throw new Error(
      "Team members returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
      "Failed to load team members.",
    );
  }

  return data.data as
    GetTeamMembersResponse;
}


export async function getTeamMember(
  studioId: string,
  memberId: string,
): Promise<TeamMemberDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}/${memberId}`,
      {
        method:
          "GET",

        headers:
          await getHeaders(
            studioId,
          ),
      },
    );

  if (error) {
    await throwFunctionError(
      error,
    );
  }

  if (!data) {
    throw new Error(
      "Team member returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
      "Failed to load team member.",
    );
  }

  return data.data as
    TeamMemberDto;
}


export async function getStudioTeamRoles(
  studioId: string,
): Promise<StudioRoleDto[]> {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_studio_team_roles",
      {
        p_studio_id:
          studioId,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  const roles =
    (
      data ??
      []
    ) as StudioRoleDto[];

  return roles
    .filter(
      (role) =>
        role.status === "active",
    )
    .sort(
      (a, b) =>
        b.level - a.level,
    );
}


export async function createTeamMember(
  studioId: string,
  payload: CreateTeamMemberRequest,
): Promise<CreateTeamMemberResponse> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      FUNCTION_NAME,
      {
        method:
          "POST",

        headers:
          await getHeaders(
            studioId,
          ),

        body:
          payload,
      },
    );

  if (error) {
    await throwFunctionError(
      error,
    );
  }

  if (!data) {
    throw new Error(
      "Team invitation returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
      "Failed to send team invitation.",
    );
  }

  return data.data as
    CreateTeamMemberResponse;
}


export async function updateTeamMember(
  studioId: string,
  memberId: string,
  payload: UpdateTeamMemberRequest,
): Promise<TeamMemberDto> {

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      `${FUNCTION_NAME}/${memberId}`,
      {
        method:
          "PATCH",

        headers:
          await getHeaders(
            studioId,
          ),

        body:
          payload,
      },
    );

  if (error) {
    await throwFunctionError(
      error,
    );
  }

  if (!data) {
    throw new Error(
      "Team member update returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
      "Failed to update team member.",
    );
  }

  return data.data as
    TeamMemberDto;
}

// =============================================================================
// ACCEPT TEAM INVITATION
// =============================================================================

export interface AcceptTeamInvitationResponse {
  success: boolean;
  studio_id: string;
  role_id: string;
}

export async function acceptTeamInvitation(
  token: string,
): Promise<AcceptTeamInvitationResponse> {

  const { data, error } =
    await supabase.rpc(
      "accept_studio_team_invitation",
      {
        p_token: token,
      },
    );

  if (error) {
    throw new Error(
      error.message,
    );
  }

  if (!data) {
    throw new Error(
      "Team invitation returned an empty response.",
    );
  }

  if (
    typeof data === "object" &&
    !Array.isArray(data)
  ) {

    const response =
      data as AcceptTeamInvitationResponse;

    if (
      response.success !== true
    ) {
      throw new Error(
        "Unable to accept team invitation.",
      );
    }

    return response;
  }

  if (
    Array.isArray(data) &&
    data[0]
  ) {

    return {
      success: true,
      studio_id:
        data[0].studio_id,
      role_id:
        data[0].role_id,
    };

  }

  throw new Error(
    "Team invitation returned an invalid response.",
  );
}


export type StudioTeamMember = {
  member_id: string;
  studio_id: string;
  profile_id: string;
  role_id: string | null;
  role_code: string;
  role_name: string;
  member_status: string;
  joined_at: string | null;
  created_at: string;
  first_name: string | null;
  last_name: string | null;
  full_name: string | null;
  avatar_url: string | null;
  phone: string | null;
};

export async function listStudioTeamMembers(): Promise<
  StudioTeamMember[]
> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "list_studio_team_members",
  );

  if (error) {
    throw error;
  }

  return Array.isArray(data)
    ? data as StudioTeamMember[]
    : [];
}

export async function removeStudioTeamMember(
  memberId: string,
): Promise<void> {
  const {
    error,
  } = await supabase.rpc(
    "remove_studio_team_member",
    {
      p_member_id: memberId,
    },
  );

  if (error) {
    throw error;
  }
}
