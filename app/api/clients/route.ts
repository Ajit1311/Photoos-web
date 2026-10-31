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
  // 1. If requestedStudioId is a valid UUID, check if it exists in studios table
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

  // 2. Check studio_members for user's active studio
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

  // 3. Fallback: try bootstrap_workspace RPC
  try {
    const { data: rpcRes } = await supabaseAdmin.rpc("bootstrap_workspace", {
      p_profile_id: userId,
    });
    const studioObj = rpcRes?.studio;
    if (studioObj?.id) {
      return studioObj.id;
    }
  } catch (rpcErr) {
    console.warn("[/api/clients] RPC bootstrap notice:", rpcErr);
  }

  // 4. Auto-create organization, studio, and member if none exists
  let orgId: string | null = null;
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

  if (!orgId) {
    const { data: anyOrg } = await supabaseAdmin.from("organizations").select("id").limit(1).maybeSingle();
    orgId = anyOrg?.id ?? null;
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
    throw new Error("Unable to establish studio for client creation.");
  }

  // Ensure member row
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
      .from("clients")
      .select("*", { count: "exact" })
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(
        `display_name.ilike.%${search}%,company_name.ilike.%${search}%,email.ilike.%${search}%,phone.ilike.%${search}%`,
      );
    }

    const { data: clients, count, error } = await query.range(offset, offset + limit - 1);

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const total = count ?? clients?.length ?? 0;

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: {
        clients: (clients || []).map((c: any) => ({
          ...c,
          metadata: {
            ...(c.metadata || {}),
            projects_count: 0,
          },
        })),
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
      return NextResponse.json({ success: false, error: "You must be signed in to create a client." }, { status: 401 });
    }

    const requestedStudioId = rawBody.studio_id || rawBody.studioId || null;
    const studioId = await resolveValidStudioId(supabaseAdmin, user.id, requestedStudioId);

    const displayName = (rawBody.display_name || `${rawBody.first_name || ""} ${rawBody.last_name || ""}`).trim();
    if (!displayName) {
      return NextResponse.json({ success: false, error: "Client name is required." }, { status: 400 });
    }

    const cleanEmail = typeof rawBody.email === "string" && rawBody.email.trim() ? rawBody.email.trim().toLowerCase() : null;
    const cleanPhone = typeof rawBody.phone === "string" && rawBody.phone.trim() ? rawBody.phone.trim() : null;

    // Check duplicate email in this studio if provided
    if (cleanEmail) {
      const { data: existingClient } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("studio_id", studioId)
        .eq("email", cleanEmail)
        .maybeSingle();

      if (existingClient) {
        return NextResponse.json(
          { success: false, error: "A client with this email already exists in your studio." },
          { status: 409 },
        );
      }
    }

    // Check duplicate phone in this studio if provided
    if (cleanPhone) {
      const { data: existingPhone } = await supabaseAdmin
        .from("clients")
        .select("id")
        .eq("studio_id", studioId)
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (existingPhone) {
        return NextResponse.json(
          { success: false, error: "A client with this phone number already exists in your studio." },
          { status: 409 },
        );
      }
    }

    const randomPart = typeof crypto !== "undefined" && crypto.randomUUID
      ? crypto.randomUUID().slice(0, 8).toUpperCase()
      : Date.now().toString(36).toUpperCase();
    const clientCode = `CLI_${randomPart}`;

    const { data: newClient, error: insertError } = await supabaseAdmin
      .from("clients")
      .insert({
        studio_id: studioId,
        code: clientCode,
        display_name: displayName,
        first_name: rawBody.first_name?.trim() || null,
        last_name: rawBody.last_name?.trim() || null,
        company_name: rawBody.company_name?.trim() || null,
        email: cleanEmail,
        phone: cleanPhone,
        notes: rawBody.notes?.trim() || null,
        status: rawBody.status || "lead",
        metadata: rawBody.metadata || {},
      })
      .select()
      .single();

    if (insertError) {
      console.error("[/api/clients] Insert error:", insertError);
      return NextResponse.json(
        { success: false, error: insertError.message || "Failed to insert client." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      studio_id: studioId,
      data: newClient,
    });
  } catch (err: any) {
    console.error("[/api/clients] Unexpected error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to create client." },
      { status: 500 },
    );
  }
}
