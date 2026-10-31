import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
    throw new Error("Supabase key is not configured.");
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

    // 0. Corporate Event Handling
    if (targetId.startsWith("ev_corp_") || targetId.startsWith("corp_")) {
      try {
        let corpEventData: any = null;
        let corpPhotos: any[] = [];

        // Load corporate event manifest from Supabase Storage
        try {
          const { data: evData } = await supabaseAdmin.storage
            .from("assets")
            .download(`corporate/${targetId}/event.json`);
          if (evData) {
            corpEventData = JSON.parse(await evData.text());
          }
        } catch {}

        // Load corporate photos manifest from Supabase Storage
        try {
          const { data: phData } = await supabaseAdmin.storage
            .from("assets")
            .download(`corporate/${targetId}/photos.json`);
          if (phData) {
            const parsed = JSON.parse(await phData.text());
            if (Array.isArray(parsed)) corpPhotos = parsed;
          }
        } catch {}

        const evName = corpEventData?.name || "Corporate Event";
        const compName = corpEventData?.company_name || "Corporate Office";

        const formattedPhotos = await Promise.all(
          corpPhotos.map(async (p, idx) => {
            let photoUrl = p.url || p.thumbnail_url;
            if (p.storage_path) {
              try {
                const { data: sData } = await supabaseAdmin.storage
                  .from("assets")
                  .createSignedUrl(p.storage_path, 86400);
                if (sData?.signedUrl) photoUrl = sData.signedUrl;
              } catch {}
            }

            return {
              id: p.id || `cp_${idx}`,
              eventId: targetId,
              fileName: p.name || `photo_${idx + 1}.jpg`,
              thumbnailUrl: photoUrl,
              originalUrl: photoUrl,
              width: 1920,
              height: 1080,
              fileSize: p.size_bytes || 204800,
              mimeType: "image/jpeg",
              uploadedBy: compName,
              uploadedAt: p.uploaded_at || new Date().toISOString(),
              status: "ready",
              visibility: "visible",
              rating: 0,
              likes: 0,
              comments: 0,
              isFavorite: false,
              isSelected: false,
              aiProcessed: true,
              captureDate: corpEventData?.date,
              location: corpEventData?.location,
            };
          })
        );

        return NextResponse.json(
          {
            success: true,
            event: {
              id: targetId,
              name: evName,
              shoot_date: corpEventData?.date || new Date().toISOString().slice(0, 10),
              venue: corpEventData?.location || "Office Headquarters",
              studio_id: corpEventData?.company_id || "corporate",
            },
            studio: {
              id: corpEventData?.company_id || "corporate",
              name: compName,
              brand_name: compName,
              contact_phone: null,
            },
            allowDownloads: true,
            lockDownloadsUntilPayment: false,
            photos: formattedPhotos,
            count: formattedPhotos.length,
          },
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Cache-Control": "public, max-age=10, s-maxage=10, stale-while-revalidate=60",
            },
          }
        );
      } catch (corpErr) {
        console.warn("[GalleryRoute] Corporate handler notice:", corpErr);
      }
    }

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

          // SECURITY: If downloads are locked/disabled, do not leak high-res original URLs in network payloads
          const deliveryOriginalUrl =
            allowDownloads && !lockDownloadsUntilPayment
              ? originalSignedUrl || thumbUrl
              : thumbUrl;

          const meta = (ga.metadata || {}) as any;
          const assetMeta = (asset.metadata || {}) as any;

          photos.push({
            id: ga.asset_id,
            eventId: resolvedEventId,
            fileName: asset.original_filename || "Photo",
            thumbnailUrl: thumbUrl,
            originalUrl: deliveryOriginalUrl,
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

