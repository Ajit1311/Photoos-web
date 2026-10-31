import {
  supabaseUrl,
  publishableKey,
} from "@/lib/supabase/config";

import { supabase } from "@/lib/supabase/client";

import type {
  BootstrapResponse,
} from "@/types/bootstrap/bootstrap";

const FUNCTION_NAME = "bootstrap";

export async function getBootstrap(): Promise<BootstrapResponse> {
  try {
    const {
      data: {
        session,
      },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw sessionError;
    }

    const accessToken = session?.access_token ?? null;

    if (!accessToken) {
      throw new Error("User is not authenticated.");
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/${FUNCTION_NAME}`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          apikey: publishableKey,
          "Content-Type": "application/json",
        },
      },
    );

    if (response.ok) {
      const data = await response.json().catch(() => null);
      if (data && data.success === true) {
        return data as BootstrapResponse;
      }
    }
  } catch (err) {
    console.warn("[getBootstrap] Edge function unavailable, using repository fallback:", err);
  }

  // Graceful fallback to bootstrapRepository
  const { bootstrapRepository } = await import("@/lib/repositories/bootstrap.repository");
  return bootstrapRepository.load();
}
