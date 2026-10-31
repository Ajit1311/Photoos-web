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
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
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

    const { data: client, error } = await supabaseAdmin
      .from("clients")
      .select("*")
      .eq("id", clientId)
      .maybeSingle();

    if (error || !client) {
      return NextResponse.json({ success: false, error: "Client not found." }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        client: {
          ...client,
          metadata: {
            ...(client.metadata || {}),
            projects_count: 0,
          },
        },
        projects: [],
      },
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  try {
    const { clientId } = await params;
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

    if (rawBody.display_name !== undefined) updateData.display_name = rawBody.display_name;
    if (rawBody.first_name !== undefined) updateData.first_name = rawBody.first_name;
    if (rawBody.last_name !== undefined) updateData.last_name = rawBody.last_name;
    if (rawBody.company_name !== undefined) updateData.company_name = rawBody.company_name;
    if (rawBody.email !== undefined) updateData.email = rawBody.email;
    if (rawBody.phone !== undefined) updateData.phone = rawBody.phone;
    if (rawBody.notes !== undefined) updateData.notes = rawBody.notes;
    if (rawBody.status !== undefined) updateData.status = rawBody.status;
    if (rawBody.metadata !== undefined) updateData.metadata = rawBody.metadata;

    const { data: updatedClient, error: updateErr } = await supabaseAdmin
      .from("clients")
      .update(updateData)
      .eq("id", clientId)
      .select()
      .single();

    if (updateErr) {
      return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: updatedClient,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || "Internal error" }, { status: 500 });
  }
}
