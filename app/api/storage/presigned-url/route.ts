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
import {
  isR2Configured,
  createR2PresignedUploadUrl,
  createR2PresignedDownloadUrl,
} from "@/lib/storage/r2-client";

export const maxDuration = 30;

const requestUploadSchema = z.object({
  filename: z.string().min(1, "Filename is required.").max(255),
  contentType: z.string().min(3, "Content-Type is required."),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024, "Max file size is 100MB."),
  studioId: z.string().uuid("Invalid studio ID."),
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
 * POST /api/storage/presigned-url
 * Generates a short-lived presigned upload URL (R2 or Supabase private storage)
 */
export async function POST(request: Request) {
  const corsHeaders = getCorsHeaders(request);

  // Rate limiting (60 upload requests per minute per IP)
  const clientIp = getClientIp(request);
  const rateLimitResult = await checkRateLimit(clientIp, {
    limit: 60,
    windowSeconds: 60,
    prefix: "api:storage:upload-presign",
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    // 1. Authenticate caller
    const token = getBearerToken(request);
    if (!token) {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Token is required." },
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

    // 2. Validate input schema
    const body = await request.json().catch(() => null);
    const parsed = requestUploadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request body.",
        },
        { status: 400, headers: corsHeaders },
      );
    }

    const { filename, contentType, sizeBytes, studioId } = parsed.data;

    // 3. Verify tenant authorization (caller must be an active member of this studio)
    const { data: membership, error: memError } = await supabaseAdmin
      .from("studio_members")
      .select("id, studio_id, status")
      .eq("profile_id", userId)
      .eq("studio_id", studioId)
      .eq("status", "active")
      .maybeSingle();

    if (memError || !membership) {
      return NextResponse.json(
        { success: false, error: "Forbidden. You are not an active member of this studio." },
        { status: 403, headers: corsHeaders },
      );
    }

    // 4. Generate presigned URL
    if (isR2Configured()) {
      const presigned = await createR2PresignedUploadUrl({
        studioId,
        userId,
        filename,
        contentType,
        sizeBytes,
      });

      const response = NextResponse.json(
        {
          success: true,
          provider: "cloudflare-r2",
          uploadUrl: presigned.uploadUrl,
          key: presigned.key,
          expiresInSeconds: presigned.expiresInSeconds,
        },
        { status: 200, headers: corsHeaders },
      );
      return applyRateLimitHeaders(response, rateLimitResult);
    }

    // Fallback to Supabase private storage signed upload URL
    const randomUuid = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2, 15);
    const cleanFilename = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const objectPath = `studios/${studioId}/uploads/${randomUuid}-${cleanFilename}`;

    const { data: signedUpload, error: signError } = await supabaseAdmin.storage
      .from("assets")
      .createSignedUploadUrl(objectPath);

    if (signError || !signedUpload) {
      return NextResponse.json(
        { success: false, error: "Failed to generate storage upload token." },
        { status: 500, headers: corsHeaders },
      );
    }

    const response = NextResponse.json(
      {
        success: true,
        provider: "supabase-storage",
        uploadUrl: signedUpload.signedUrl,
        token: signedUpload.token,
        key: objectPath,
        expiresInSeconds: 900,
      },
      { status: 200, headers: corsHeaders },
    );
    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("[StoragePresign] Server error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to generate presigned upload URL.",
      },
      { status: 500, headers: corsHeaders },
    );
  }
}

/**
 * GET /api/storage/presigned-url?key=...
 * Generates a short-lived download / read URL for a private object.
 */
export async function GET(request: Request) {
  const corsHeaders = getCorsHeaders(request);
  const { searchParams } = new URL(request.url);
  const key = searchParams.get("key");

  if (!key) {
    return NextResponse.json(
      { success: false, error: "Storage object key is required." },
      { status: 400, headers: corsHeaders },
    );
  }

  // Prevent path traversal attacks
  if (key.includes("..") || key.startsWith("/") || key.startsWith("\\")) {
    return NextResponse.json(
      { success: false, error: "Invalid storage object key." },
      { status: 400, headers: corsHeaders },
    );
  }

  // Authenticate caller
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401, headers: corsHeaders },
    );
  }

  const supabaseAdmin = getServerSupabase();
  const { data: authData, error: authError } = await supabaseAdmin.auth.getUser(token);

  if (authError || !authData.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized." },
      { status: 401, headers: corsHeaders },
    );
  }

  try {
    if (isR2Configured()) {
      const downloadUrl = await createR2PresignedDownloadUrl(key, 3600);
      return NextResponse.json(
        {
          success: true,
          provider: "cloudflare-r2",
          url: downloadUrl,
          expiresInSeconds: 3600,
        },
        { status: 200, headers: corsHeaders },
      );
    }

    // Supabase signed download URL
    const { data: signedDownload, error: signError } = await supabaseAdmin.storage
      .from("assets")
      .createSignedUrl(key, 3600);

    if (signError || !signedDownload) {
      return NextResponse.json(
        { success: false, error: "Failed to generate signed download URL." },
        { status: 500, headers: corsHeaders },
      );
    }

    return NextResponse.json(
      {
        success: true,
        provider: "supabase-storage",
        url: signedDownload.signedUrl,
        expiresInSeconds: 3600,
      },
      { status: 200, headers: corsHeaders },
    );
  } catch (error) {
    console.error("[StorageDownload] Error generating signed download URL:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create signed download URL." },
      { status: 500, headers: corsHeaders },
    );
  }
}

