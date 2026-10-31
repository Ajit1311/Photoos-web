import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getCurrentUser } from "@/lib/auth/session";

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

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function resolveMainAlbumForEvent(supabaseAdmin: any, eventId: string) {
  // 1. Get Event Details
  const { data: event, error: eventErr } = await supabaseAdmin
    .from("events")
    .select("id, studio_id, project_id, name")
    .eq("id", eventId)
    .maybeSingle();

  if (eventErr || !event) {
    throw new Error(eventErr?.message || "Event not found.");
  }

  let studioId = event.studio_id;
  let projectId = event.project_id;

  // 2. Validate / Resolve Project ID
  if (!projectId || !UUID_REGEX.test(projectId)) {
    const { data: existingProject } = await supabaseAdmin
      .from("projects")
      .select("id")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (existingProject?.id) {
      projectId = existingProject.id;
    } else {
      // Auto-create a client & project for this event
      const cliCode = `CLI_${Date.now().toString(36).toUpperCase()}`;
      const { data: cli } = await supabaseAdmin
        .from("clients")
        .insert({
          studio_id: studioId,
          code: cliCode,
          display_name: "General Client",
          status: "active",
        })
        .select("id")
        .single();

      const prjCode = `PRJ_${Date.now().toString(36).toUpperCase()}`;
      const { data: prj } = await supabaseAdmin
        .from("projects")
        .insert({
          studio_id: studioId,
          client_id: cli?.id,
          code: prjCode,
          title: `${event.name || "Event"} Project`,
          status: "confirmed",
        })
        .select("id")
        .single();

      projectId = prj?.id;
    }

    if (projectId) {
      await supabaseAdmin
        .from("events")
        .update({ project_id: projectId })
        .eq("id", eventId);
    }
  }

  if (!projectId) {
    throw new Error("Unable to resolve project for this event.");
  }

  // 3. Check for Existing Albums in this Project
  const { data: existingAlbums } = await supabaseAdmin
    .from("albums")
    .select("id, studio_id, project_id, title, slug, code")
    .eq("project_id", projectId)
    .order("sequence", { ascending: true });

  if (existingAlbums && existingAlbums.length > 0) {
    const main =
      existingAlbums.find((a: any) => a.title === "Main Album") ||
      existingAlbums[0];
    return {
      album: main,
      projectId,
      studioId,
    };
  }

  // 4. Create Main Album
  const randomSuffix = Date.now().toString(36).toUpperCase();
  const albumCode = `ALB_${randomSuffix}`;
  const albumSlug = `main-album-${event.id.slice(0, 8)}-${Date.now().toString(36)}`;

  const { data: newAlbum, error: createAlbumErr } = await supabaseAdmin
    .from("albums")
    .insert({
      studio_id: studioId,
      project_id: projectId,
      title: "Main Album",
      slug: albumSlug,
      code: albumCode,
      sequence: 1,
      album_type: "standard",
      visibility: "private",
      status: "active",
      metadata: {},
    })
    .select("id, studio_id, project_id, title, slug, code")
    .single();

  if (createAlbumErr) {
    // If conflict, re-fetch
    const { data: conflictAlbum } = await supabaseAdmin
      .from("albums")
      .select("id, studio_id, project_id, title, slug, code")
      .eq("project_id", projectId)
      .limit(1)
      .maybeSingle();

    if (conflictAlbum?.id) {
      return {
        album: conflictAlbum,
        projectId,
        studioId,
      };
    }

    throw new Error(createAlbumErr.message || "Failed to create Main Album.");
  }

  return {
    album: newAlbum,
    projectId,
    studioId,
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    const supabaseAdmin = getSupabaseAdmin(token);
    const result = await resolveMainAlbumForEvent(supabaseAdmin, eventId);

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (err: any) {
    console.error("[/api/events/[eventId]/main-album] GET Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to resolve Main Album" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  return GET(req, { params });
}
