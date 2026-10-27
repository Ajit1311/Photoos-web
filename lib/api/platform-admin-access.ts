import {
  getFirebaseIdToken,
} from "@/lib/auth/firebase-auth.service";
import { getSupabaseFunctionUrl } from "@/lib/supabase/config";

export async function verifyPlatformAdminAccess(): Promise<boolean> {
  const token =
    await getFirebaseIdToken();

  if (!token) {
    return false;
  }

  const response =
    await fetch(
      getSupabaseFunctionUrl("platform-admin-access"),
      {
        method: "GET",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
      },
    );

  if (!response.ok) {
    return false;
  }

  const data =
    await response.json();

  return data?.success === true &&
    data?.data?.authorized === true;
}
