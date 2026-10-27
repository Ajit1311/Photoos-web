import {
  supabaseUrl,
  publishableKey,
} from "@/lib/supabase/config";

import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

const FUNCTION_NAME =
  "bootstrap";

export async function getBootstrap(): Promise<BootstrapResponse> {

  const {
    data: {
      session,
    },
    error: sessionError,
  } =
    await supabase.auth.getSession();

  if (sessionError) {
    throw sessionError;
  }

  const accessToken =
    session?.access_token ?? null;

  if (!accessToken) {

    throw new Error(
      "User is not authenticated.",
    );

  }



  const response =
    await fetch(
      `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
          apikey:
            publishableKey,
          "Content-Type":
            "application/json",
        },
      },
    );

  const data =
    await response.json().catch(
      () => null,
    );

  if (!response.ok) {

    console.error(
      "BOOTSTRAP DIRECT FETCH ERROR:",
      {
        status: response.status,
        data,
      },
    );

    throw new Error(
      data?.error?.message ??
      data?.message ??
      `Bootstrap request failed with status ${response.status}.`,
    );

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
