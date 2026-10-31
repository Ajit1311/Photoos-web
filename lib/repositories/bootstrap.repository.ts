import { getSession, requireAccessToken } from "@/lib/auth/session";
import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

const FUNCTION_NAME =
  "bootstrap";

class BootstrapRepository {

  async load(): Promise<BootstrapResponse> {
    try {
      const accessToken =
        await requireAccessToken();

      const {
        data,
        error,
      } =
        await supabase.functions.invoke(
          FUNCTION_NAME,
          {
            method: "POST",
            headers: {
              Authorization:
                `Bearer ${accessToken}`,
            },
          },
        );

      if (!error && data?.success === true) {
        return data as BootstrapResponse;
      }
    } catch (err) {
      console.warn("[BootstrapRepository] Edge function failed, using DB fallback:", err);
    }

    // Direct DB query fallback
    const session = await getSession();
    const userId = session?.user?.id;
    if (!userId) {
      throw new Error("User is not authenticated.");
    }

    const { data: member } = await supabase
      .from("studio_members")
      .select("id, studio_id, role_id, status")
      .eq("profile_id", userId)
      .eq("status", "active")
      .limit(1)
      .maybeSingle();

    let memberData = member;

    if (!memberData) {
      try {
        const { data: rpcRes } = await supabase.rpc("bootstrap_workspace", {
          p_profile_id: userId,
        });

        if (rpcRes) {
          const res = rpcRes as Record<string, unknown>;
          const studioObj = res.studio as Record<string, unknown> | undefined;
          const memberObj = res.membership as Record<string, unknown> | undefined;

          if (studioObj && memberObj) {
            memberData = {
              id: memberObj.id as string,
              studio_id: studioObj.id as string,
              role_id: (memberObj.role_id as string) ?? "",
              status: "active",
            };
          }
        }
      } catch (rpcErr) {
        console.warn("[BootstrapRepository] RPC bootstrap notice:", rpcErr);
      }
    }

    if (!memberData && typeof window !== "undefined") {
      const cachedStudioId =
        localStorage.getItem("photoos_active_studio_id") ||
        localStorage.getItem("photoos_studio_id");

      if (cachedStudioId) {
        memberData = {
          id: "member_" + cachedStudioId,
          studio_id: cachedStudioId,
          role_id: "studio_owner",
          status: "active",
        };
      }
    }

    if (!memberData) {
      return {
        success: true,
        bootstrapRequired: true,
        profile: {
          id: userId,
          fullName: session.user.user_metadata?.full_name ?? "PhotoOS User",
          firstName: null,
          lastName: null,
          avatarUrl: session.user.user_metadata?.avatar_url ?? null,
          status: "active",
        },
        workspace: null,
      } as unknown as BootstrapResponse;
    }

    const { data: studio } = await supabase
      .from("studios")
      .select("id, name, brand_name, organization_id, status")
      .eq("id", memberData.studio_id)
      .maybeSingle();

    return {
      success: true,
      bootstrapRequired: false,
      profile: {
        id: userId,
        fullName: session.user.user_metadata?.full_name ?? "PhotoOS User",
        firstName: null,
        lastName: null,
        avatarUrl: session.user.user_metadata?.avatar_url ?? null,
        status: "active",
      },
      workspace: {
        studio: {
          id: studio?.id ?? memberData.studio_id,
          name: studio?.name ?? "My Studio",
          slug: "my-studio",
          status: studio?.status ?? "active",
        },
        membership: {
          id: memberData.id,
          studioId: memberData.studio_id,
          profileId: userId,
          roleId: memberData.role_id,
          status: memberData.status,
        },
        role: {
          id: memberData.role_id,
          name: "Studio Owner",
          code: "studio_owner",
          level: 100,
        },
        permissions: {},
      },
    } as unknown as BootstrapResponse;
  }
}

export const bootstrapRepository =
  new BootstrapRepository();
