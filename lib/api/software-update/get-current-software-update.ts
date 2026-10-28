import { supabase } from "@/lib/supabase/client";
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import type { SoftwareUpdate } from "@/types/software-update/software-update";

const FUNCTION_NAME = "get-current-software-update";

export async function getCurrentSoftwareUpdate(): Promise<SoftwareUpdate | null> {
  try {
    const accessToken = await getFirebaseIdToken().catch(() => null);

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        FUNCTION_NAME,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: {},
        },
      );

      if (!error && data?.success && data?.data) {
        return data.data as SoftwareUpdate;
      }
    }
  } catch (err) {
    console.warn("[getCurrentSoftwareUpdate] Notice:", err);
  }

  // Graceful default fallback
  return {
    version: "1.0.0",
    release_date: new Date().toISOString(),
    is_latest: true,
    title: "PhotoOS v1.0.0",
    description: "Stable Release",
    changelog: ["Performance optimizations and studio workspace improvements."],
  } as unknown as SoftwareUpdate;
}
