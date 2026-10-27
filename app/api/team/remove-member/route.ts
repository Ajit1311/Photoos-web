import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import {
  checkRateLimit,
  getClientIp,
  createRateLimitResponse,
  applyRateLimitHeaders,
} from "@/lib/security/rate-limit";
import { getCorsHeaders, handleOptionsCors } from "@/lib/security/cors";

export const maxDuration = 30;

const removeMemberSchema = z.object({
  memberId: z.string().uuid("Invalid member ID format."),
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

export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  // 1. Rate limiting by IP
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(clientIp, {
    limit: 20,
    windowSeconds: 60,
    prefix: "api:team:remove",
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    // 2. Authentication check
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

    const callerUserId = authData.user.id;

    // 3. Input validation
    const json = await request.json().catch(() => null);
    const parsed = removeMemberSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const { memberId: targetMemberId } = parsed.data;

    // 4. Authorization: Verify caller's studio membership and role
    const { data: callerMembership, error: callerMemError } = await supabaseAdmin
      .from("studio_members")
      .select("id, studio_id, role_id, status, roles(code)")
      .eq("profile_id", callerUserId)
      .eq("status", "active")
      .maybeSingle();

    if (callerMemError || !callerMembership?.studio_id) {
      return NextResponse.json(
        { success: false, error: "Forbidden. Active studio membership is required." },
        { status: 403, headers: corsHeaders },
      );
    }

    const rawRole = callerMembership.roles as
      | { code?: string }
      | Array<{ code?: string }>
      | null;
    const roleCode = Array.isArray(rawRole) ? rawRole[0]?.code : rawRole?.code;

    // Only studio owner, studio admin, or platform admin can remove team members
    const isAuthorizedRole =
      roleCode === "owner" ||
      roleCode === "studio_owner" ||
      roleCode === "admin" ||
      roleCode === "studio_admin";

    if (!isAuthorizedRole) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You lack sufficient permissions to remove members." },
        { status: 403, headers: corsHeaders },
      );
    }

    // 5. Anti-IDOR: Verify target member belongs to the same studio
    const { data: targetMember, error: targetMemError } = await supabaseAdmin
      .from("studio_members")
      .select("id, studio_id, profile_id")
      .eq("id", targetMemberId)
      .maybeSingle();

    if (targetMemError || !targetMember) {
      return NextResponse.json(
        { success: false, error: "Target team member not found." },
        { status: 404, headers: corsHeaders },
      );
    }

    if (targetMember.studio_id !== callerMembership.studio_id) {
      // Cross-tenant attempt blocked
      return NextResponse.json(
        { success: false, error: "Access denied. Cross-tenant modification forbidden." },
        { status: 403, headers: corsHeaders },
      );
    }

    // Prevent removing oneself via this endpoint
    if (targetMember.profile_id === callerUserId) {
      return NextResponse.json(
        { success: false, error: "Cannot remove yourself from the studio." },
        { status: 400, headers: corsHeaders },
      );
    }

    // 6. Execute removal safely
    const { data, error } = await supabaseAdmin.rpc("remove_studio_team_member", {
      p_member_id: targetMemberId,
    });

    if (error) {
      return NextResponse.json(
        { success: false, error: "Unable to remove team member." },
        { status: 400, headers: corsHeaders },
      );
    }

    const response = NextResponse.json(
      { success: true, data },
      { status: 200, headers: corsHeaders },
    );
    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("[TeamRemoveMember] Server error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred." },
      { status: 500, headers: corsHeaders },
    );
  }
}
