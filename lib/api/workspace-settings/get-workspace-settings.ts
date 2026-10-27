import {
  supabase,
} from "@/lib/supabase/client";

import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";

import type {
  WorkspaceSettingsResponse,
} from "@/types/workspace-settings/workspace-setting";


export async function getWorkspaceSettings(
  studioId: string,
): Promise<WorkspaceSettingsResponse> {

  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "workspace-settings",
      {
        method: "POST",

        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },

        body: {
          action: "get",
          studioId,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.message ??
      "Unable to load workspace settings.",
    );
  }

  return (
    data.data ??
    []
  ) as WorkspaceSettingsResponse;
}
