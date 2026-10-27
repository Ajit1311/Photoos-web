import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

const FUNCTION_NAME =
  "bootstrap";

export async function getBootstrap(): Promise<BootstrapResponse> {

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
      FUNCTION_NAME,
      {

        method: "POST",

        headers: {

          Authorization:
            `Bearer ${accessToken}`,

        },

      },
    );

  if (error) {
    throw error;
  }

  if (!data) {

    throw new Error(
      "Bootstrap returned an empty response.",
    );

  }

  if (data.success !== true) {

    throw new Error(
      data.error?.message ??
      "Bootstrap failed.",
    );

  }

  return data as BootstrapResponse;

}