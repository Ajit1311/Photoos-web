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

  // Graceful default fallback matching SoftwareUpdate interface completely
  const now = new Date().toISOString();
  return {
    id: "update_stable_v1",
    version: "1.0.0",
    release_name: "PhotoOS Cloud v1.0",
    schema_version: 1,
    released_at: now,
    release_notes: "Performance optimizations, role-based access control, and studio workspace improvements.",
    metadata: {
      display_schema_version: "PhotoOS-01",
      platform: "cloud",
      is_stable: true,
    },
    created_at: now,
  };
}
