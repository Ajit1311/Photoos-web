import {
  supabase,
} from "@/lib/supabase/client";

import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";


export async function saveWorkspaceSetting(
  studioId: string,

  category: string,

  key: string,

  value: Record<string, unknown>,

  description: string | null = null,
) {

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
          action: "save",
          studioId,
          category,
          key,
          value,
          description,
        },
      },
    );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.message ??
      "Unable to save workspace setting.",
    );
  }

  return data.data;
}
