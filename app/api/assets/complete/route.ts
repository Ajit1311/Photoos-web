import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function getServerSupabase() {
  const url =
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

  return createClient(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
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

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const supabaseAdmin = getServerSupabase();

    const assetId = rawBody.asset_id || rawBody.assetId;
    if (!assetId) {
      return NextResponse.json(
        { success: false, error: "asset_id is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const updateFields: Record<string, any> = {
      processing_status: "ready",
      status: "active",
      updated_at: new Date().toISOString(),
    };

    if (rawBody.storage_path || rawBody.storagePath) {
      updateFields.storage_path = rawBody.storage_path || rawBody.storagePath;
    }
    if (rawBody.file_size || rawBody.fileSize) {
      updateFields.file_size = Number(rawBody.file_size || rawBody.fileSize);
    }
    if (rawBody.width) {
      updateFields.width = Number(rawBody.width);
    }
    if (rawBody.height) {
      updateFields.height = Number(rawBody.height);
    }
    if (rawBody.checksum) {
      updateFields.checksum = rawBody.checksum;
    }

    const { data: updated, error } = await supabaseAdmin
      .from("assets")
      .update(updateFields)
      .eq("id", assetId)
      .select()
      .single();

    if (error) {
      console.error("[/api/assets/complete] Update error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        id: updated.id,
        asset_id: updated.id,
        studio_id: updated.studio_id,
        album_id: updated.album_id,
        storage_bucket: updated.storage_bucket || "assets",
        storage_path: updated.storage_path,
        storage_filename: updated.storage_filename,
        mime_type: updated.mime_type,
        file_size: updated.file_size,
        width: updated.width,
        height: updated.height,
        processing_status: updated.processing_status,
      },
    }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("[/api/assets/complete] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
