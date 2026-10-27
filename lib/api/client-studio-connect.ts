import { supabase } from "@/lib/supabase/client";
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";

const FUNCTION_NAME = "client-studio-connect";

export interface ClientStudioConnectTokenResponse {
  success: boolean;
  token: string;
  studioId: string;
  expiresAt: string;
}

export async function createClientStudioConnectToken(
  studioId: string,
  clientId: string,
): Promise<ClientStudioConnectTokenResponse> {
  const accessToken = await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to create a client studio connection.",
    );
  }

  const { data, error } = await supabase.functions.invoke(
    FUNCTION_NAME,
    {
      method: "POST",
      body: {
        action: "create",
        studioId,
        clientId,
      },
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {
    throw new Error(
      data?.error?.message ??
        data?.error ??
        "Failed to create client studio connection.",
    );
  }

  return data as ClientStudioConnectTokenResponse;
}
