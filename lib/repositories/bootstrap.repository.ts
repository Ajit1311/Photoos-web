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

    if (!member) {
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
      .eq("id", member.studio_id)
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
          id: studio?.id ?? member.studio_id,
          name: studio?.name ?? "My Studio",
          slug: "my-studio",
          status: studio?.status ?? "active",
        },
        membership: {
          id: member.id,
          studioId: member.studio_id,
          profileId: userId,
          roleId: member.role_id,
          status: member.status,
        },
        role: {
          id: member.role_id,
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
