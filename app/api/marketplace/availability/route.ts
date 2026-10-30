import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rate-limit";
import { handleOptionsCors } from "@/lib/security/cors";
import { getCurrentUser } from "@/lib/auth/session";

export const maxDuration = 30;

export async function OPTIONS(request: Request) {
  return handleOptionsCors(request);
}

const AvailabilityQuerySchema = z.object({
  studio_id: z.string().uuid("Invalid studio ID format"),
  from_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid from_date format (YYYY-MM-DD)"),
  to_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid to_date format (YYYY-MM-DD)"),
});

const AvailabilityUpsertSchema = z.object({
  studio_id: z.string().uuid("Invalid studio ID format"),
  availability_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  availability_status: z.enum(["available", "half_day", "unavailable"]),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  reason: z.string().max(500).nullable().optional(),
  note: z.string().max(1000).nullable().optional(),
});

function getSupabaseServerClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase server configuration is missing.");
  }

  return createClient(url, serviceKey);
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit(ip, { limit: 100, windowSeconds: 60, prefix: "availability-get" });
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { searchParams } = new URL(req.url);
    const parsed = AvailabilityQuerySchema.safeParse({
      studio_id: searchParams.get("studio_id"),
      from_date: searchParams.get("from_date"),
      to_date: searchParams.get("to_date"),
    });

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid query parameters" },
        { status: 400 },
      );
    }

    const { studio_id, from_date, to_date } = parsed.data;
    const supabase = getSupabaseServerClient();

    const { data, error } = await supabase
      .from("studio_marketplace_availability")
      .select("availability_date, availability_status, start_time, end_time, reason, note, source")
      .eq("studio_id", studio_id)
      .gte("availability_date", from_date)
      .lte("availability_date", to_date)
      .order("availability_date", { ascending: true });

    if (error) {
      // Table might not exist on older DB versions or no records yet
      console.warn("[availability-api] Query warning:", error.message);
      return NextResponse.json({ success: true, data: [] });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
    });
  } catch (err) {
    console.error("[availability-api] GET error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit(ip, { limit: 50, windowSeconds: 60, prefix: "availability-post" });
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 });
    }

    const rawBody = await req.json();
    const parsed = AvailabilityUpsertSchema.safeParse(rawBody);

    if (!parsed.success) {
      return NextResponse.json(
        { success: false, error: parsed.error.issues[0]?.message || "Invalid request payload" },
        { status: 400 },
      );
    }

    const { studio_id, availability_date, availability_status, start_time, end_time, reason, note } = parsed.data;
    const supabase = getSupabaseServerClient();

    // Verify user belongs to the studio
    const { data: member } = await supabase
      .from("studio_members")
      .select("id, role")
      .eq("studio_id", studio_id)
      .eq("profile_id", user.id)
      .eq("status", "active")
      .maybeSingle();

    const { data: studio } = await supabase
      .from("studios")
      .select("id, owner_profile_id")
      .eq("id", studio_id)
      .maybeSingle();

    const isAuthorized = Boolean(member) || studio?.owner_profile_id === user.id;
    if (!isAuthorized) {
      return NextResponse.json(
        { success: false, error: "You are not authorized to update availability for this studio." },
        { status: 403 },
      );
    }

    const { data, error } = await supabase
      .from("studio_marketplace_availability")
      .upsert(
        {
          studio_id,
          availability_date,
          availability_status,
          start_time: start_time || null,
          end_time: end_time || null,
          reason: reason || null,
          note: note || null,
          source: "manual",
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "studio_id,availability_date",
        },
      )
      .select()
      .single();

    if (error) {
      console.error("[availability-api] Upsert error:", error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data,
    });
  } catch (err) {
    console.error("[availability-api] POST error:", err);
    return NextResponse.json(
      { success: false, error: err instanceof Error ? err.message : "Internal error" },
      { status: 500 },
    );
  }
}
