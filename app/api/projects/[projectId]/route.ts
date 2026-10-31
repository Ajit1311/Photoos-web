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
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
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

    const { data: project, error } = await supabaseAdmin
      .from("projects")
      .select("*, clients(id, display_name)")
      .eq("id", projectId)
      .maybeSingle();

    if (error || !project) {
      return NextResponse.json({ success: false, error: "Project not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: project,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await params;
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

    if (rawBody.title !== undefined) updateData.title = rawBody.title;
    if (rawBody.description !== undefined) updateData.description = rawBody.description;
    if (rawBody.client_id !== undefined) updateData.client_id = rawBody.client_id;
    if (rawBody.event_type !== undefined) updateData.event_type = rawBody.event_type;
    if (rawBody.event_date !== undefined) updateData.event_date = rawBody.event_date ? new Date(rawBody.event_date).toISOString() : null;
    if (rawBody.delivery_deadline !== undefined) updateData.delivery_deadline = rawBody.delivery_deadline ? new Date(rawBody.delivery_deadline).toISOString() : null;
    if (rawBody.priority !== undefined) updateData.priority = rawBody.priority;
    if (rawBody.status !== undefined) updateData.status = rawBody.status;
    if (rawBody.budget !== undefined) updateData.budget = Number(rawBody.budget);
    if (rawBody.advance_amount !== undefined) updateData.advance_amount = Number(rawBody.advance_amount);
    if (rawBody.budget !== undefined || rawBody.advance_amount !== undefined) {
      const b = Number(rawBody.budget ?? 0);
      const a = Number(rawBody.advance_amount ?? 0);
      updateData.balance_amount = Math.max(0, b - a);
    }
    if (rawBody.currency !== undefined) updateData.currency = rawBody.currency;
    if (rawBody.notes !== undefined) updateData.notes = rawBody.notes;
    if (rawBody.metadata !== undefined) updateData.metadata = rawBody.metadata;

    const { data: updatedProject, error: updateErr } = await supabaseAdmin
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .select("*, clients(id, display_name)")
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedProject,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
