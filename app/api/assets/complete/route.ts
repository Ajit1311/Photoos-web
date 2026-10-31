import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

function getSupabaseAdmin(token?: string) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder-project.supabase.co";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (serviceKey) {
    return createClient(url, serviceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
    });
  }

  return createClient(url, anonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: token ? { headers: { Authorization: `Bearer ${token}` } } : undefined,
  });
}

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const supabaseAdmin = getSupabaseAdmin(token);

    const assetId = rawBody.asset_id || rawBody.assetId;
    if (!assetId) {
      return NextResponse.json({ success: false, error: "asset_id is required." }, { status: 400 });
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
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
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
    });
  } catch (err: any) {
    console.error("[/api/assets/complete] Error:", err);
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
