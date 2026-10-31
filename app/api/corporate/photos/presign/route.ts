import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { isR2Configured, createR2PresignedUploadUrl } from "@/lib/storage/r2-client";

export const maxDuration = 30;

function getServerSupabase() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder-project.supabase.co";

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!serviceKey) {
    throw new Error("Supabase service key is not configured.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/corporate/photos/presign
// Generates a direct-to-storage presigned upload URL (Supabase Storage or Cloudflare R2)
// Never routes binary file data through Vercel serverless to avoid 4.5MB payload limits.
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    const eventId = body?.eventId as string;
    const filename = (body?.filename as string) || "photo.jpg";
    const contentType = (body?.contentType as string) || "image/jpeg";
    const sizeBytes = Number(body?.sizeBytes) || 0;

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Event ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const cleanName = filename.replace(/[^a-zA-Z0-9._-]/g, "_");
    const photoId = `cphoto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const storagePath = `corporate/${eventId}/photos/${photoId}_${cleanName}`;

    // 1. Check if Cloudflare R2 is configured
    if (isR2Configured()) {
      try {
        const presigned = await createR2PresignedUploadUrl({
          studioId: eventId,
          userId: "corporate",
          filename,
          contentType,
          sizeBytes,
        });

        return NextResponse.json(
          {
            success: true,
            provider: "cloudflare-r2",
            photoId,
            storagePath: presigned.key,
            uploadUrl: presigned.uploadUrl,
            photoUrl: presigned.uploadUrl.split("?")[0],
            expiresInSeconds: presigned.expiresInSeconds,
          },
          { status: 200, headers: corsHeaders }
        );
      } catch (r2Err) {
        console.warn("[CorporatePresign] R2 generation notice, falling back to Supabase Storage:", r2Err);
      }
    }

    // 2. Direct Supabase Storage signed upload URL
    const supabase = getServerSupabase();

    // Ensure assets bucket exists
    try {
      await supabase.storage.createBucket("assets", { public: true });
    } catch {}

    const { data: signedUpload, error: signError } = await supabase.storage
      .from("assets")
      .createSignedUploadUrl(storagePath);

    if (signError || !signedUpload) {
      console.error("[CorporatePresign] Supabase signed upload error:", signError);
      return NextResponse.json(
        {
          success: false,
          error: signError?.message || "Failed to generate storage upload URL.",
        },
        { status: 500, headers: corsHeaders }
      );
    }

    // Resolve public/download URL for the photo
    let photoUrl = "";
    try {
      const { data: signedDownload } = await supabase.storage
        .from("assets")
        .createSignedUrl(storagePath, 315360000); // 10 years
      photoUrl = signedDownload?.signedUrl || "";
    } catch {}

    if (!photoUrl) {
      const { data: pubData } = supabase.storage
        .from("assets")
        .getPublicUrl(storagePath);
      photoUrl = pubData?.publicUrl || "";
    }

    return NextResponse.json(
      {
        success: true,
        provider: "supabase-storage",
        photoId,
        storagePath,
        uploadUrl: signedUpload.signedUrl,
        token: signedUpload.token,
        photoUrl,
        expiresInSeconds: 3600,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[CorporatePresign] Server error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal presign error." },
      { status: 500, headers: corsHeaders }
    );
  }
}

