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
    console.warn("[/api/projects] RPC bootstrap notice:", rpcErr);
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
    throw new Error("Unable to establish studio for project creation.");
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
    const clientId = searchParams.get("clientId");
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
      .from("projects")
      .select("*, clients(id, display_name)", { count: "exact" })
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (clientId && UUID_REGEX.test(clientId)) {
      query = query.eq("client_id", clientId);
    }

    if (search) {
      query = query.or(`title.ilike.%${search}%,code.ilike.%${search}%`);
    }

    const { data: projects, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = count ?? projects?.length ?? 0;

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: {
        projects: projects || [],
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
      return NextResponse.json({ success: false, error: "You must be signed in to create a project." }, { status: 401 });
    }

    const requestedStudioId = rawBody.studio_id || rawBody.studioId || null;
    const studioId = await resolveValidStudioId(supabaseAdmin, user.id, requestedStudioId);

    const title = (rawBody.title || "").trim();
    if (!title) {
      return NextResponse.json({ success: false, error: "Project title is required." }, { status: 400 });
    }

    // Resolve or fallback client_id
    let validClientId = rawBody.client_id;
    if (!validClientId || !UUID_REGEX.test(validClientId)) {
      const { data: existingClient } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("studio_id", studioId)
        .limit(1)
        .maybeSingle();

      if (existingClient?.id) {
        validClientId = existingClient.id;
      } else {
        // Auto-create a default client so project is never blocked
        const defaultCode = `CLI_${Date.now().toString(36).toUpperCase()}`;
        const { data: createdClient } = await supabaseAdmin
          .from("clients")
          .insert({
            studio_id: studioId,
            code: defaultCode,
            display_name: "General Client",
            status: "active",
          })
          .select("id")
          .single();

        validClientId = createdClient?.id ?? null;
      }
    }

    if (!validClientId) {
      return NextResponse.json({ success: false, error: "A valid client is required." }, { status: 400 });
    }

    const budget = Number(rawBody.budget || 0);
    const advanceAmount = Number(rawBody.advance_amount || 0);
    const balanceAmount = Math.max(0, budget - advanceAmount);

    const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const projectCode = `PRJ_${randomPart}`;

    const { data: newProject, error: insertError } = await supabaseAdmin
      .from("projects")
      .insert({
        studio_id: studioId,
        client_id: validClientId,
        code: projectCode,
        title: title,
        description: rawBody.description?.trim() || null,
        event_type: rawBody.event_type?.trim() || "wedding",
        event_date: rawBody.event_date ? new Date(rawBody.event_date).toISOString() : null,
        delivery_deadline: rawBody.delivery_deadline ? new Date(rawBody.delivery_deadline).toISOString() : null,
        priority: rawBody.priority || "medium",
        status: rawBody.status || "draft",
        budget,
        advance_amount: advanceAmount,
        balance_amount: balanceAmount,
        currency: rawBody.currency || "INR",
        notes: rawBody.notes?.trim() || null,
        metadata: rawBody.metadata || {},
      })
      .select("*, clients(id, display_name)")
      .single();

    if (insertError) {
      console.error("[/api/projects] Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to create project." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: newProject,
    });
  } catch (err: any) {
    console.error("[/api/projects] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create project." },
      { status: 500 },
    );
  }
}
