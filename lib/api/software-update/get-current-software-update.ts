import { supabase } from "@/lib/supabase/client";
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import type { SoftwareUpdate } from "@/types/software-update/software-update";

const FUNCTION_NAME = "get-current-software-update";

export async function getCurrentSoftwareUpdate(): Promise<SoftwareUpdate | null> {
  const accessToken = await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error("User is not authenticated.");
  }

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

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
        data?.message ??
        "Unable to load software update information.",
    );
  }

  return (data.data ?? null) as SoftwareUpdate | null;
}
