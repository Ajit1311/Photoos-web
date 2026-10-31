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

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    let user = await getCurrentUser().catch(() => null);
    const supabaseAdmin = getSupabaseAdmin(token);

    if (!user && token) {
      const { data: tokenUser } = await supabaseAdmin.auth.getUser(token).catch(() => ({ data: { user: null } }));
      user = tokenUser?.user ?? null;
    }

    const { data: event, error } = await supabaseAdmin
      .from("events")
      .select("*, projects(*)")
      .eq("id", eventId)
      .maybeSingle();

    if (error || !event) {
      return NextResponse.json({ success: false, error: "Event not found." }, { status: 404 });
    }

    let project = event.projects || null;
    let client = null;
    if (project?.client_id) {
      const { data: cli } = await supabaseAdmin
        .from("clients")
        .select("*")
        .eq("id", project.client_id)
        .maybeSingle();
      client = cli ?? null;
    }

    const workspace = {
      workspace_id: event.id,
      workspaceId: event.id,
      studio_id: event.studio_id,
      studioId: event.studio_id,
      event: event,
      project: project,
      client: client,
      lead_photographer: null,
      finance: (event.metadata?.finance as any) ?? null,
    };

    return NextResponse.json({
      success: true,
      data: {
        ...event,
        event: event,
        project: project,
        client: client,
        workspace: workspace,
        dashboard: {},
        timeline: [],
        summary: null,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const rawBody = await req.json().catch(() => ({}));
    const authHeader = req.headers.get("Authorization") || "";
    const token = authHeader.replace(/^Bearer\s+/i, "").trim();

    let user = await getCurrentUser().catch(() => null);
    const supabaseAdmin = getSupabaseAdmin(token);

    if (!user && token) {
      const { data: tokenUser } = await supabaseAdmin.auth.getUser(token).catch(() => ({ data: { user: null } }));
      user = tokenUser?.user ?? null;
    }

    if (!user) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const updateData: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (rawBody.name !== undefined) updateData.name = rawBody.name;
    if (rawBody.shoot_date !== undefined || rawBody.shootDate !== undefined) {
      updateData.shoot_date = (rawBody.shoot_date || rawBody.shootDate).slice(0, 10);
    }
    if (rawBody.start_time !== undefined || rawBody.startTime !== undefined) {
      updateData.start_time = rawBody.start_time || rawBody.startTime ? new Date(rawBody.start_time || rawBody.startTime).toISOString() : null;
    }
    if (rawBody.end_time !== undefined || rawBody.endTime !== undefined) {
      updateData.end_time = rawBody.end_time || rawBody.endTime ? new Date(rawBody.end_time || rawBody.endTime).toISOString() : null;
    }
    if (rawBody.venue !== undefined) updateData.venue = rawBody.venue;
    if (rawBody.location !== undefined) updateData.location = rawBody.location;
    if (rawBody.status !== undefined) updateData.status = rawBody.status;
    if (rawBody.notes !== undefined) updateData.notes = rawBody.notes;
    if (rawBody.metadata !== undefined) updateData.metadata = rawBody.metadata;

    const { data: updatedEvent, error: updateErr } = await supabaseAdmin
      .from("events")
      .update(updateData)
      .eq("id", eventId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedEvent,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
