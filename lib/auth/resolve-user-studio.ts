import { getAccessToken, getSession } from "@/lib/auth/session";
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
  const session = await getSession();
  const userId = session?.user?.id;

  if (!userId) {
    return null;
  }

  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "bootstrap",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!error && data?.success) {
        const response = data as BootstrapResponse;
        const workspace = response.workspace;

        if (
          !response.bootstrapRequired &&
          workspace?.membership &&
          workspace?.studio
        ) {
          const membership = workspace.membership;
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
      }
    }
  } catch (fnErr) {
    console.warn("[resolveUserStudio] Edge function error, falling back to direct DB:", fnErr);
  }

  // 2. Direct database query fallback
  try {
    const { data: member, error: dbErr } = await supabase
      .from("studio_members")
      .select("id, studio_id, profile_id, role_id, status")
      .eq("profile_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    if (!dbErr && member) {
      return {
        memberId: member.id,
        studioId: member.studio_id,
        profileId: member.profile_id,
        roleId: member.role_id,
        status: member.status,
        invitationStatus: "accepted",
        joinedAt: null,
      };
    }
  } catch (dbErr) {
    console.warn("[resolveUserStudio] DB query fallback error:", dbErr);
  }

  return null;
}
