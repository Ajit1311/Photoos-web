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

  // 3. If no member found, try bootstrapping workspace via RPC
  try {
    const { data: rpcRes, error: rpcErr } = await supabase.rpc("bootstrap_workspace", {
      p_profile_id: userId,
    });

    if (!rpcErr && rpcRes) {
      const res = rpcRes as Record<string, unknown>;
      const studioObj = res.studio as Record<string, unknown> | undefined;
      const memberObj = res.membership as Record<string, unknown> | undefined;

      const studioId = (studioObj?.id ?? res.studio_id ?? "") as string;
      const memberId = (memberObj?.id ?? res.membership_id ?? "") as string;
      const roleId = (memberObj?.role_id ?? res.role_id ?? "") as string;

      if (studioId && memberId) {
        return {
          memberId,
          studioId,
          profileId: userId,
          roleId,
          status: "active",
          invitationStatus: "accepted",
          joinedAt: null,
        };
      }
    }
  } catch (rpcErr) {
    console.warn("[resolveUserStudio] RPC bootstrap error:", rpcErr);
  }

  // 4. Check localStorage cached studio fallback
  if (typeof window !== "undefined") {
    const cachedStudioId = localStorage.getItem("photoos_active_studio_id") || localStorage.getItem("photoos_studio_id");
    if (cachedStudioId) {
      return {
        memberId: "cached_" + cachedStudioId,
        studioId: cachedStudioId,
        profileId: userId,
        roleId: "studio_owner",
        status: "active",
        invitationStatus: "accepted",
        joinedAt: null,
      };
    }
  }

  return null;
}
