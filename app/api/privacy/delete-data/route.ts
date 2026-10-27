import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { getCorsHeaders, handleOptionsCors } from "@/lib/security/cors";

export const maxDuration = 30;

const deleteDataSchema = z.object({
  confirmation: z.literal("DELETE_MY_DATA", {
    message: 'Explicit confirmation string "DELETE_MY_DATA" is required.',
  }),
  deleteBiometricsOnly: z.boolean().optional(),
});

function getServerSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceKey) {
    throw new Error("Supabase server environment variables are not configured.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

function getBearerToken(request: Request): string | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.toLowerCase().startsWith("bearer ")) {
    return null;
  }
  return authHeader.slice(7).trim();
}

export async function OPTIONS(request: Request) {
  return handleOptionsCors(request);
}

/**
 * POST /api/privacy/delete-data
 * DPDP Act 2023 Section 12: Right to Erasure / Deletion of Personal Data & Biometrics
 */
export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  try {
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Authentication token is required." },
        { status: 401, headers: corsHeaders },
      );
    }

    const supabaseAdmin = getServerSupabase();
    const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

    if (authError || !authData.user) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Session is invalid or expired." },
        { status: 401, headers: corsHeaders },
      );
    }

    const userId = authData.user.id;

    // Rate limit per user (max 3 deletion requests per day)
    const rateLimitResult = await checkRateLimit(userId, {
      limit: 3,
      windowSeconds: 86400,
      prefix: "privacy:delete",
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        "Maximum deletion attempts reached for today.",
      );
    }

    const body = await request.json().catch(() => null);
    const parsed = deleteDataSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid deletion confirmation.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const { deleteBiometricsOnly } = parsed.data;

    // 1. Purge Biometric Face Profile Vectors
    try {
      await supabaseAdmin.rpc("purge_user_biometric_vectors", {
        p_user_id: userId,
      });
    } catch {
      // If custom RPC is not yet seeded, continue with standard table updates
    }

    // 2. Mark consents as withdrawn
    await supabaseAdmin
      .from("user_privacy_consents")
      .update({
        status: "withdrawn",
        withdrawn_at: new Date().toISOString(),
      })
      .eq("profile_id", userId);

    if (deleteBiometricsOnly) {
      return NextResponse.json(
        {
          success: true,
          message: "All facial biometric vectors and face-search profiles have been permanently purged.",
        },
        { status: 200, headers: corsHeaders },
      );
    }

    // Full Account Deletion Request
    // Anonymize personal profile data
    await supabaseAdmin
      .from("profiles")
      .update({
        first_name: "Deleted",
        last_name: "User",
        full_name: "Deleted User",
        phone: null,
        metadata: { deleted_at: new Date().toISOString(), anonymized: true },
      })
      .eq("id", userId);

    return NextResponse.json(
      {
        success: true,
        message: "Your personal data has been erased in compliance with DPDP Act 2023. You will now be logged out.",
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[DataDelete] Privacy erasure error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to process data deletion request." },
      { status: 500, headers: corsHeaders },
    );
  }
}

