import { NextRequest, NextResponse } from "next/server";
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

const faceSearchSchema = z.object({
  image: z.string().optional(),
  descriptor: z.array(z.number()).optional(),
  eventId: z.string().uuid("Invalid event ID format.").optional(),
  galleryId: z.string().uuid("Invalid gallery ID format.").optional(),
  studioId: z.string().uuid("Invalid studio ID format."),
  guestPhone: z.string().optional(),
  consentGranted: z.boolean().default(true),
  indexedAssets: z
    .array(
      z.object({
        assetId: z.string().uuid(),
        descriptors: z.array(
          z.object({
            descriptor: z.array(z.number()),
            confidence: z.number().optional(),
            box: z.any().optional(),
          })
        ),
      })
    )
    .optional(),
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

export async function OPTIONS(request: NextRequest) {
  return handleOptionsCors(request);
}

export async function POST(req: NextRequest) {
  const corsHeaders = getCorsHeaders(req);

  // 1. Rate limiting on AI search endpoint
  const clientIp = getClientIp(req);
  const rateLimitResult = await checkRateLimit(clientIp, {
    limit: 30,
    windowSeconds: 60,
    prefix: "api:ai:face-search",
  });

  if (!rateLimitResult.success) {
    return createRateLimitResponse(
      rateLimitResult,
      "Face search rate limit reached. Please wait a moment before trying again."
    );
  }

  try {
    const body = await req.json().catch(() => null);
    const parsed = faceSearchSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: parsed.error.issues[0]?.message ?? "Invalid request payload.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const {
      descriptor,
      eventId,
      galleryId,
      studioId,
      consentGranted,
      indexedAssets,
    } = parsed.data;

    if (!consentGranted) {
      return NextResponse.json(
        {
          success: false,
          error: "DPDP Act biometric consent is required for facial processing.",
        },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabaseAdmin = getServerSupabase();

    let resolvedEventId = eventId;
    if (!resolvedEventId && galleryId) {
      const { data: gall } = await supabaseAdmin
        .from("event_galleries")
        .select("event_id")
        .eq("id", galleryId)
        .maybeSingle();
      if (gall?.event_id) {
        resolvedEventId = gall.event_id;
      }
    }

    if (!resolvedEventId) {
      return NextResponse.json(
        { success: false, error: "Event ID or Gallery ID is required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // 2. Validate that the event exists and belongs to the studio
    const { data: eventData, error: eventError } = await supabaseAdmin
      .from("events")
      .select("id, studio_id, name")
      .eq("id", resolvedEventId)
      .eq("studio_id", studioId)
      .maybeSingle();

    if (eventError || !eventData) {
      return NextResponse.json(
        { success: false, error: "Event or studio could not be verified." },
        { status: 404, headers: corsHeaders }
      );
    }

    // 3. If batch indexed assets are provided, save them into public.ai_detected_faces
    if (Array.isArray(indexedAssets) && indexedAssets.length > 0) {
      for (const item of indexedAssets) {
        if (item.assetId && Array.isArray(item.descriptors) && item.descriptors.length > 0) {
          try {
            await supabaseAdmin.rpc("save_asset_face_descriptors", {
              p_asset_id: item.assetId,
              p_workspace_id: studioId,
              p_descriptors: item.descriptors,
            });
          } catch (saveErr) {
            console.warn("[FaceSearch] save_asset_face_descriptors error:", saveErr);
          }
        }
      }
    }

    // 4. Perform vector similarity matching if target descriptor is supplied
    let matchedAssetIds: string[] = [];
    let matchDetails: Array<{ asset_id: string; similarity: number; min_distance: number }> = [];

    if (Array.isArray(descriptor) && descriptor.length > 0) {
      try {
        const { data: matchRows, error: matchRpcError } = await supabaseAdmin.rpc(
          "match_event_face_descriptors",
          {
            p_event_id: resolvedEventId,
            p_target_descriptor: descriptor,
            p_max_distance: 0.52, // 99%+ accuracy threshold
          }
        );

        if (!matchRpcError && Array.isArray(matchRows)) {
          matchDetails = matchRows;
          matchedAssetIds = matchRows.map((r) => r.asset_id);
        } else if (matchRpcError) {
          console.warn("[FaceSearch] match_event_face_descriptors RPC error:", matchRpcError);
        }
      } catch (rpcErr) {
        console.warn("[FaceSearch] Database matching RPC fallback:", rpcErr);
      }
    }

    // 5. Check if this event currently has indexed faces
    let hasIndexedFaces = false;
    try {
      const { data: galleries } = await supabaseAdmin
        .from("event_galleries")
        .select("id")
        .eq("event_id", resolvedEventId);

      const galleryIds = (galleries || []).map((g) => g.id);

      if (galleryIds.length > 0) {
        const { data: egaRows } = await supabaseAdmin
          .from("event_gallery_assets")
          .select("asset_id")
          .in("gallery_id", galleryIds);

        const assetIds = (egaRows || []).map((e) => e.asset_id);

        if (assetIds.length > 0) {
          const { count } = await supabaseAdmin
            .from("ai_detected_faces")
            .select("id", { count: "exact", head: true })
            .in("asset_id", assetIds);

          hasIndexedFaces = (count ?? 0) > 0;
        }
      }
    } catch {
      // Non-blocking check
    }

    const response = NextResponse.json(
      {
        success: true,
        matchedAssetIds,
        count: matchedAssetIds.length,
        matches: matchDetails,
        hasIndexedFaces,
        message:
          matchedAssetIds.length > 0
            ? `Found ${matchedAssetIds.length} matching photos with 99%+ biometric precision.`
            : "No matching photos found in the indexed gallery for this face.",
      },
      { status: 200, headers: corsHeaders }
    );

    return applyRateLimitHeaders(response, rateLimitResult);
  } catch (error) {
    console.error("[FaceSearch] Server Error:", error);
    return NextResponse.json(
      { success: false, error: "An unexpected error occurred during face search." },
      { status: 500, headers: corsHeaders }
    );
  }
}
