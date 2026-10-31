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

    const albumId = rawBody.album_id || rawBody.albumId;
    if (!albumId) {
      return NextResponse.json(
        { success: false, error: "album_id is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Lookup album to get studio_id and project_id
    const { data: albumRow, error: albumErr } = await supabaseAdmin
      .from("albums")
      .select("id, studio_id, project_id")
      .eq("id", albumId)
      .maybeSingle();

    if (albumErr || !albumRow) {
      console.warn("[/api/assets/prepare] Album lookup warning:", albumErr);
    }

    const studioId = rawBody.studio_id || rawBody.studioId || albumRow?.studio_id;
    const projId = albumRow?.project_id || studioId;
    let orgId = studioId;

    if (studioId) {
      try {
        const { data: std } = await supabaseAdmin
          .from("studios")
          .select("organization_id")
          .eq("id", studioId)
          .maybeSingle();
        if (std?.organization_id) {
          orgId = std.organization_id;
        }
      } catch {}
    }

    const originalFilename = rawBody.original_filename || rawBody.originalFilename || "image.jpg";
    const mimeType = rawBody.mime_type || rawBody.mimeType || "image/jpeg";
    const fileSize = Number(rawBody.file_size || rawBody.fileSize || 0);
    const width = rawBody.width ? Number(rawBody.width) : null;
    const height = rawBody.height ? Number(rawBody.height) : null;
    const checksum = rawBody.checksum || null;

    const rawAssetType = (rawBody.asset_type || rawBody.assetType || "photo").toLowerCase();
    const assetType = ["photo", "video", "raw", "audio", "document", "other"].includes(rawAssetType)
      ? rawAssetType
      : "photo";

    // Resolve sort order
    let nextSortOrder = 1;
    try {
      const { data: maxOrderData } = await supabaseAdmin
        .from("assets")
        .select("sort_order")
        .eq("album_id", albumId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxOrderData?.sort_order) {
        nextSortOrder = Number(maxOrderData.sort_order) + 1;
      }
    } catch {
      nextSortOrder = Math.floor(Date.now() / 1000) % 1000000;
    }

    const assetId = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID()
      : `ast_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    const safeName = originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
    const storageFilename = `${Date.now()}-${safeName}`;
    const storagePath = `${orgId}/${studioId}/${projId}/${albumId}/${assetId}/original/${storageFilename}`;

    // Ensure assets bucket exists
    try {
      await supabaseAdmin.storage.createBucket("assets", { public: true });
    } catch {}

    // Generate signed upload URL so client can stream PUT directly to Supabase Storage without RLS errors
    let uploadUrl: string | null = null;
    let uploadToken: string | null = null;
    try {
      const { data: signedUpload, error: signError } = await supabaseAdmin.storage
        .from("assets")
        .createSignedUploadUrl(storagePath);

      if (signedUpload?.signedUrl) {
        uploadUrl = signedUpload.signedUrl;
        uploadToken = signedUpload.token || null;
      } else if (signError) {
        console.warn("[/api/assets/prepare] createSignedUploadUrl warning:", signError);
      }
    } catch (signErr) {
      console.warn("[/api/assets/prepare] createSignedUploadUrl exception:", signErr);
    }

    const { data: inserted, error: insertError } = await supabaseAdmin
      .from("assets")
      .insert({
        id: assetId,
        studio_id: studioId,
        album_id: albumId,
        asset_type: assetType,
        original_filename: originalFilename,
        storage_filename: storageFilename,
        storage_bucket: "assets",
        storage_path: storagePath,
        mime_type: mimeType,
        file_size: fileSize,
        width,
        height,
        checksum,
        sort_order: nextSortOrder,
        processing_status: "uploading",
        status: "active",
        metadata: {
          width,
          height,
          ...(rawBody.metadata || {}),
        },
      })
      .select()
      .single();

    if (insertError) {
      console.error("[/api/assets/prepare] Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        asset_id: inserted.id,
        id: inserted.id,
        studio_id: studioId,
        album_id: albumId,
        storage_bucket: inserted.storage_bucket || "assets",
        storage_path: inserted.storage_path,
        storage_filename: inserted.storage_filename,
        mime_type: inserted.mime_type,
        file_size: inserted.file_size,
        width: inserted.width,
        height: inserted.height,
        checksum: inserted.checksum,
        status: "uploading",
        upload_url: uploadUrl,
        uploadUrl: uploadUrl,
        upload_token: uploadToken,
      },
    }, { status: 200, headers: corsHeaders });
  } catch (err: any) {
    console.error("[/api/assets/prepare] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal error" },
      { status: 500, headers: corsHeaders }
    );
  }
}
