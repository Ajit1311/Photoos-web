import {
  supabase,
} from "@/lib/supabase/client";

import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";

import {
  getAccessToken,
} from "@/lib/auth/session";


export async function saveWorkspaceSetting(
  studioId: string,
  category: string,
  key: string,
  value: Record<string, unknown>,
  description: string | null = null,
) {
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
            action: "save",
            studioId,
            category,
            key,
            value,
            description,
          },
        },
      );

      if (!error && data?.success) {
        return data.data;
      }
    }
  } catch (err) {
    console.warn("[saveWorkspaceSetting] Edge function notice, falling back to direct DB:", err);
  }

  // 2. Direct Supabase DB upsert fallback
  try {
    const { data: upserted, error: dbErr } = await supabase
      .from("workspace_settings")
      .upsert(
        {
          studio_id: studioId,
          category,
          key,
          value,
          description,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "studio_id,key" },
      )
      .select()
      .single();

    if (!dbErr && upserted) {
      return upserted;
    }
  } catch (dbErr) {
    console.warn("[saveWorkspaceSetting] DB fallback error:", dbErr);
  }

  return { studio_id: studioId, category, key, value, description };
}
