import { getAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

export type ResolvedStudioMembership = {
  memberId: string;
  studioId: string;
  profileId: string;
  roleId: string;
  status: string;
  invitationStatus: string;
  joinedAt: string | null;
};

export async function resolveUserStudio(): Promise<ResolvedStudioMembership | null> {
  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    return null;
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "bootstrap",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
        "Unable to resolve PhotoOS workspace.",
    );
  }

  const response =
    data as BootstrapResponse;

  const workspace =
    response.workspace;

  if (
    response.bootstrapRequired ||
    !workspace?.membership ||
    !workspace?.studio
  ) {
    return null;
  }

  const membership =
    workspace.membership;

  return {
    memberId: membership.id,
    studioId: membership.studioId,
    profileId: membership.profileId,
    roleId: membership.roleId,
    status: membership.status,
    invitationStatus: "accepted",
    joinedAt: null,
  };
}
