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

async function resolveValidStudioId(supabaseAdmin: any, userId: string, requestedStudioId?: string | null): Promise<string> {
  if (requestedStudioId && UUID_REGEX.test(requestedStudioId)) {
    const { data: std } = await supabaseAdmin
      .from("studios")
      .select("id")
      .eq("id", requestedStudioId)
      .maybeSingle();

    if (std?.id) {
      return std.id;
    }
  }

  const { data: member } = await supabaseAdmin
    .from("studio_members")
    .select("studio_id")
    .eq("profile_id", userId)
    .eq("status", "active")
    .order("joined_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  if (member?.studio_id) {
    return member.studio_id;
  }

  try {
    const { data: rpcRes } = await supabaseAdmin.rpc("bootstrap_workspace", {
      p_profile_id: userId,
    });
    if (rpcRes?.studio?.id) {
      return rpcRes.studio.id;
    }
  } catch (rpcErr) {
    console.warn("[/api/events] RPC bootstrap notice:", rpcErr);
  }

  let orgId: string | null = null;
  const { data: anyOrg } = await supabaseAdmin.from("organizations").select("id").limit(1).maybeSingle();
  orgId = anyOrg?.id ?? null;

  if (!orgId) {
    const { data: newOrg } = await supabaseAdmin
      .from("organizations")
      .insert({
        legal_name: "My Studio",
        display_name: "My Studio",
        status: "active",
      })
      .select("id")
      .single();
    orgId = newOrg?.id ?? null;
  }

  const { data: newStd } = await supabaseAdmin
    .from("studios")
    .insert({
      organization_id: orgId,
      name: "My Studio",
      brand_name: "My Studio",
      city: "Pune",
      status: "active",
    })
    .select("id")
    .single();

  const studioId = newStd?.id;
  if (!studioId) {
    throw new Error("Unable to establish studio for event creation.");
  }

  await supabaseAdmin.from("studio_members").insert({
    studio_id: studioId,
    profile_id: userId,
    status: "active",
  });

  return studioId;
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const requestedStudioId = searchParams.get("studioId");
    const projectId = searchParams.get("projectId");
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "25", 10)));
    const search = (searchParams.get("search") || "").trim();
    const offset = (page - 1) * limit;

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

    const studioId = await resolveValidStudioId(supabaseAdmin, user.id, requestedStudioId);

    let query = supabaseAdmin
      .from("events")
      .select("*, projects(id, title)", { count: "exact" })
      .eq("studio_id", studioId)
      .order("shoot_date", { ascending: false });

    if (projectId && UUID_REGEX.test(projectId)) {
      query = query.eq("project_id", projectId);
    }

    if (search) {
      query = query.or(`name.ilike.%${search}%,code.ilike.%${search}%,venue.ilike.%${search}%`);
    }

    const { data: events, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = count ?? events?.length ?? 0;

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: {
        events: events || [],
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.max(1, Math.ceil(total / limit)),
        },
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ success: false, error: "You must be signed in to create an event." }, { status: 401 });
    }

    const requestedStudioId = rawBody.studio_id || rawBody.studioId || null;
    const studioId = await resolveValidStudioId(supabaseAdmin, user.id, requestedStudioId);

    const name = (rawBody.name || rawBody.title || "").trim();
    if (!name) {
      return NextResponse.json({ success: false, error: "Event name is required." }, { status: 400 });
    }

    // Resolve or fallback project_id
    let validProjectId = rawBody.project_id || rawBody.projectId;
    if (!validProjectId || !UUID_REGEX.test(validProjectId)) {
      const { data: existingProject } = await supabaseAdmin
        .from("projects")
        .select("id")
        .eq("studio_id", studioId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (existingProject?.id) {
        validProjectId = existingProject.id;
      } else {
        // Auto-create a default client first
        const defaultClientCode = `CLI_${Date.now().toString(36).toUpperCase()}`;
        const { data: createdClient } = await supabaseAdmin
          .from("clients")
          .insert({
            studio_id: studioId,
            code: defaultClientCode,
            display_name: "General Client",
            status: "active",
          })
          .select("id")
          .single();

        const defaultProjectCode = `PRJ_${Date.now().toString(36).toUpperCase()}`;
        const { data: createdProject } = await supabaseAdmin
          .from("projects")
          .insert({
            studio_id: studioId,
            client_id: createdClient?.id,
            code: defaultProjectCode,
            title: `${name} Project`,
            status: "confirmed",
          })
          .select("id")
          .single();

        validProjectId = createdProject?.id ?? null;
      }
    }

    if (!validProjectId) {
      return NextResponse.json({ success: false, error: "A valid project is required." }, { status: 400 });
    }

    // Calculate next event number for project
    let nextEventNumber = 1;
    try {
      const { data: existingEvents } = await supabaseAdmin
        .from("events")
        .select("event_number")
        .eq("project_id", validProjectId)
        .order("event_number", { ascending: false })
        .limit(1);

      if (existingEvents && existingEvents.length > 0 && typeof existingEvents[0].event_number === "number") {
        nextEventNumber = existingEvents[0].event_number + 1;
      }
    } catch {
      nextEventNumber = 1;
    }

    const randomSuffix = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 6).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const eventCode = `EVT-${Date.now().toString(36).toUpperCase()}-${randomSuffix}`;

    const shootDate = rawBody.shoot_date || rawBody.shootDate || rawBody.eventDate || new Date().toISOString().slice(0, 10);
    const startTime = rawBody.start_time || rawBody.startTime || null;
    const endTime = rawBody.end_time || rawBody.endTime || null;

    const { data: newEvent, error: insertError } = await supabaseAdmin
      .from("events")
      .insert({
        studio_id: studioId,
        project_id: validProjectId,
        code: eventCode,
        event_number: nextEventNumber,
        name: name,
        shoot_date: shootDate.slice(0, 10),
        start_time: startTime ? new Date(startTime).toISOString() : null,
        end_time: endTime ? new Date(endTime).toISOString() : null,
        venue: rawBody.venue?.trim() || null,
        location: rawBody.location?.trim() || null,
        timezone: rawBody.timezone || "Asia/Kolkata",
        lead_photographer_id: rawBody.lead_photographer_id || rawBody.leadPhotographerId || null,
        status: rawBody.status || "scheduled",
        notes: rawBody.notes?.trim() || null,
        metadata: rawBody.metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("[/api/events] Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to create event." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: newEvent,
    });
  } catch (err: any) {
    console.error("[/api/events] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create event." },
      { status: 500 },
    );
  }
}
