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
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
  try {
    const resolvedParams = await params;
    const eventId = resolvedParams.eventId;
    const body = await req.json().catch(() => ({}));
    const assetId = body.asset_id || body.assetId;

    if (!eventId || !assetId) {
      return NextResponse.json(
        { success: false, error: "eventId and assetId are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = getServerSupabase();

    // 1. Get event details (studio_id)
    const { data: eventRow, error: eventErr } = await supabaseAdmin
      .from("events")
      .select("id, studio_id")
      .eq("id", eventId)
      .maybeSingle();

    if (eventErr || !eventRow) {
      return NextResponse.json(
        { success: false, error: "Event not found." },
        { status: 404, headers: corsHeaders }
      );
    }

    const studioId = body.studio_id || body.studioId || eventRow.studio_id;

    // 2. Find or create Main Gallery in event_galleries
    let { data: galleryRow, error: galleryErr } = await supabaseAdmin
      .from("event_galleries")
      .select("id")
      .eq("event_id", eventId)
      .maybeSingle();

    if (!galleryRow) {
      const { data: createdGallery, error: createGalleryErr } = await supabaseAdmin
        .from("event_galleries")
        .insert({
          event_id: eventId,
          studio_id: studioId,
          name: "Main Gallery",
          slug: "main-gallery",
          gallery_type: "main",
          status: "published",
        })
        .select("id")
        .single();

      if (createGalleryErr) {
        console.error("[gallery-link] Create gallery error:", createGalleryErr);
      } else {
        galleryRow = createdGallery;
      }
    }

    const galleryId = galleryRow?.id;
    if (!galleryId) {
      return NextResponse.json(
        { success: false, error: "Failed to resolve event gallery." },
        { status: 500, headers: corsHeaders }
      );
    }

    // 3. Link asset to event_gallery_assets (check existence first to avoid duplicate errors)
    const { data: existingLink } = await supabaseAdmin
      .from("event_gallery_assets")
      .select("id")
      .eq("gallery_id", galleryId)
      .eq("asset_id", assetId)
      .maybeSingle();

    if (!existingLink) {
      const { error: linkErr } = await supabaseAdmin
        .from("event_gallery_assets")
        .insert({
          gallery_id: galleryId,
          studio_id: studioId,
          asset_id: assetId,
          display_order: 0,
          is_featured: false,
        });

      if (linkErr) {
        console.error("[gallery-link] Link insert error:", linkErr);
        return NextResponse.json(
          { success: false, error: linkErr.message },
          { status: 500, headers: corsHeaders }
        );
      }
    }

    return NextResponse.json(
      { success: true, gallery_id: galleryId, asset_id: assetId },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[gallery-link] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Internal server error" },
      { status: 500, headers: corsHeaders }
    );
  }
}

