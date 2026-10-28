import {
  supabase,
} from "@/lib/supabase/client";

import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";

import {
  getAccessToken,
} from "@/lib/auth/session";

import type {
  WorkspaceSettingsResponse,
} from "@/types/workspace-settings/workspace-setting";


export async function getWorkspaceSettings(
  studioId: string,
): Promise<WorkspaceSettingsResponse> {
  // 1. Try edge function first
  try {
    const accessToken =
      (await getFirebaseIdToken().catch(() => null)) ||
      (await getAccessToken().catch(() => null));

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "workspace-settings",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {
            action: "get",
            studioId,
          },
        },
      );

      if (!error && data?.success && Array.isArray(data.data)) {
        return data.data as WorkspaceSettingsResponse;
      }
    }
  } catch (err) {
    console.warn("[getWorkspaceSettings] Edge function notice, falling back to direct DB:", err);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbSettings, error: dbErr } = await supabase
      .from("workspace_settings")
      .select("*")
      .eq("studio_id", studioId);

    if (!dbErr && dbSettings) {
      return dbSettings as WorkspaceSettingsResponse;
    }
  } catch (dbErr) {
    console.warn("[getWorkspaceSettings] DB fallback notice:", dbErr);
  }

  return [];
}
