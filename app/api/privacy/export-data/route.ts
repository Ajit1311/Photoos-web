import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  createRateLimitResponse,
} from "@/lib/security/rate-limit";
import { getCorsHeaders, handleOptionsCors } from "@/lib/security/cors";

export const maxDuration = 30;

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
 * GET /api/privacy/export-data
 * DPDP Act 2023 Section 11: Right to Access Summary of Personal Data
 */
export async function GET(request: Request) {
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

    // Rate limit per user (max 5 data export requests per hour)
    const rateLimitResult = await checkRateLimit(userId, {
      limit: 5,
      windowSeconds: 3600,
      prefix: "privacy:export",
    });

    if (!rateLimitResult.success) {
      return createRateLimitResponse(
        rateLimitResult,
        "You have reached the maximum data export requests allowed for this hour. Please check back later.",
      );
    }

    // 1. Fetch user profile
    const { data: profile } = await supabaseAdmin
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    // 2. Fetch studio memberships
    const { data: memberships } = await supabaseAdmin
      .from("studio_members")
      .select("id, studio_id, role_id, status, created_at, roles(name, code)")
      .eq("profile_id", userId);

    // 3. Fetch consents granted
    const { data: consents } = await supabaseAdmin
      .from("user_privacy_consents")
      .select("*")
      .eq("profile_id", userId);

    const exportArchive = {
      exportMetadata: {
        timestamp: new Date().toISOString(),
        regulation: "Digital Personal Data Protection Act 2023 (India)",
        dataFiduciary: "PhotoOS Platform",
        userId,
      },
      account: {
        id: authData.user.id,
        email: authData.user.email,
        phone: authData.user.phone,
        createdAt: authData.user.created_at,
        lastSignInAt: authData.user.last_sign_in_at,
      },
      profile: profile ?? null,
      studioMemberships: memberships ?? [],
      privacyConsents: consents ?? [],
    };

    return new NextResponse(JSON.stringify(exportArchive, null, 2), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="photoos-personal-data-${userId.slice(0, 8)}.json"`,
      },
    });
  } catch (error) {
    console.error("[DataExport] Privacy export error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to compile personal data export archive." },
      { status: 500, headers: corsHeaders },
    );
  }
}

