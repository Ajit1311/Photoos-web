import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
  try {
    const resolvedParams = await params;
    const targetId = resolvedParams.eventId;

    if (!targetId) {
      return NextResponse.json(
        { success: false, error: "Missing event ID." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = getServerSupabase();

    // 1. Resolve Event Details
    let event: any = null;
    let resolvedEventId = targetId;

    // First try querying as event_id
    const { data: directEvent } = await supabaseAdmin
      .from("events")
      .select("id, name, shoot_date, venue, studio_id, metadata")
      .eq("id", targetId)
      .maybeSingle();

    if (directEvent) {
      event = directEvent;
      resolvedEventId = directEvent.id;
    } else {
      // Check if targetId is actually a gallery_id
      const { data: gallRecord } = await supabaseAdmin
        .from("event_galleries")
        .select("id, event_id")
        .eq("id", targetId)
        .maybeSingle();

      if (gallRecord?.event_id) {
        resolvedEventId = gallRecord.event_id;
        const { data: linkedEvent } = await supabaseAdmin
          .from("events")
          .select("id, name, shoot_date, venue, studio_id, metadata")
          .eq("id", resolvedEventId)
          .maybeSingle();
        event = linkedEvent;
      }
    }

    // 2. Resolve Studio Details and Workspace Settings
    let studio: any = null;
    let allowDownloads = false;
    let lockDownloadsUntilPayment = false;

    if (event?.studio_id) {
      const [{ data: studioData }, { data: settingsData }] = await Promise.all([
        supabaseAdmin
          .from("studios")
          .select("id, name, brand_name")
          .eq("id", event.studio_id)
          .maybeSingle(),
        supabaseAdmin
          .from("workspace_settings")
          .select("key, value")
          .eq("studio_id", event.studio_id)
          .in("key", ["client_downloads", "allow_downloads", "download_protection"]),
      ]);
      studio = studioData;

      // Strict Download Enforcement:
      // If either studio settings or event settings turns OFF downloads, downloads MUST be completely disabled.
      const eventMeta = (event.metadata || {}) as any;
      const clientDownloadsSetting = (settingsData || []).find(
        (s) => s.key === "client_downloads" || s.key === "allow_downloads"
      );
      const downloadProtectionSetting = (settingsData || []).find(
        (s) => s.key === "download_protection"
      );

      const studioExplicitlyDisabled =
        (clientDownloadsSetting?.value && (clientDownloadsSetting.value as any).enabled === false) ||
        (downloadProtectionSetting?.value && (downloadProtectionSetting.value as any).enabled === true);

      const eventExplicitlyDisabled = eventMeta && eventMeta.allowDownload === false;

      if (studioExplicitlyDisabled || eventExplicitlyDisabled) {
        allowDownloads = false;
      } else {
        const studioExplicitlyEnabled = Boolean(
          clientDownloadsSetting?.value && (clientDownloadsSetting.value as any).enabled === true
        );
        const eventExplicitlyEnabled = Boolean(eventMeta && eventMeta.allowDownload === true);
        allowDownloads = studioExplicitlyEnabled || eventExplicitlyEnabled;
      }

      if (typeof eventMeta.lockDownloadsUntilPayment === "boolean") {
        lockDownloadsUntilPayment = eventMeta.lockDownloadsUntilPayment;
      }
    }

    // 3. Find Galleries for this event
    const { data: galleries } = await supabaseAdmin
      .from("event_galleries")
      .select("id")
      .eq("event_id", resolvedEventId);

    const galleryIds = (galleries || []).map((g) => g.id);
    const photos: any[] = [];

    if (galleryIds.length > 0) {
      // 4. Fetch Gallery Assets
      const { data: galleryAssets, error: gaErr } = await supabaseAdmin
        .from("event_gallery_assets")
        .select("id, asset_id, display_order, is_featured, metadata, created_at")
        .in("gallery_id", galleryIds)
        .order("display_order", { ascending: true });

      if (!gaErr && galleryAssets && galleryAssets.length > 0) {
        const assetIds = galleryAssets.map((ga) => ga.asset_id);

        // 5. Fetch Full Asset Records
        const { data: assetRecords } = await supabaseAdmin
          .from("assets")
          .select("id, original_filename, storage_bucket, storage_path, thumbnail_path, mime_type, file_size, metadata")
          .in("id", assetIds);

        const assetMap = new Map((assetRecords || []).map((a) => [a.id, a]));

        // 6. Sign URLs for each asset
        for (const ga of galleryAssets) {
          const asset = assetMap.get(ga.asset_id);
          if (!asset) continue;

          const bucket = asset.storage_bucket || "assets";
          let originalSignedUrl = "";
          let thumbnailSignedUrl = "";

          if (asset.storage_path) {
            try {
              const { data: signedOrig } = await supabaseAdmin.storage
                .from(bucket)
                .createSignedUrl(asset.storage_path, 86400); // 24 hours
              originalSignedUrl = signedOrig?.signedUrl || "";
            } catch (e) {
              console.warn("[GalleryRoute] Failed to sign original URL:", asset.id, e);
            }
          }

          if (asset.thumbnail_path) {
            try {
              const { data: signedThumb } = await supabaseAdmin.storage
                .from(bucket)
                .createSignedUrl(asset.thumbnail_path, 86400);
              thumbnailSignedUrl = signedThumb?.signedUrl || "";
            } catch (e) {
              console.warn("[GalleryRoute] Failed to sign thumb URL:", asset.id, e);
            }
          }

          const photoUrl = originalSignedUrl || thumbnailSignedUrl;
          const thumbUrl = thumbnailSignedUrl || originalSignedUrl;

          if (!photoUrl) continue;

          const meta = (ga.metadata || {}) as any;
          const assetMeta = (asset.metadata || {}) as any;

          photos.push({
            id: ga.asset_id,
            eventId: resolvedEventId,
            fileName: asset.original_filename || "Photo",
            thumbnailUrl: thumbUrl,
            originalUrl: photoUrl,
            width: Number(assetMeta?.width || 0),
            height: Number(assetMeta?.height || 0),
            fileSize: Number(asset.file_size || 0),
            mimeType: asset.mime_type || "image/jpeg",
            uploadedBy: "Studio",
            uploadedAt: ga.created_at,
            status: "ready",
            visibility: "visible",
            rating: 0,
            likes: meta?.is_favorite ? 1 : 0,
            comments: Array.isArray(meta?.comments) ? meta.comments.length : 0,
            isFavorite: Boolean(meta?.is_favorite),
            isSelected: Boolean(meta?.isSelected || meta?.is_selected),
            aiProcessed: Boolean(meta?.ai_processed),
            captureDate: meta?.capture_date,
            location: meta?.location,
          });
        }
      }
    }

    return NextResponse.json(
      {
        success: true,
        event,
        studio,
        allowDownloads,
        lockDownloadsUntilPayment,
        photos,
        count: photos.length,
      },
      {
        status: 200,
        headers: {
          ...corsHeaders,
          "Cache-Control": "public, max-age=60, s-maxage=60, stale-while-revalidate=300",
        },
      }
    );
  } catch (err: any) {
    console.error("[GalleryRoute] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: "Failed to load public gallery photos." },
      { status: 500, headers: corsHeaders }
    );
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: corsHeaders,
  });
}

