import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { checkRateLimit, getClientIp, createRateLimitResponse } from "@/lib/security/rate-limit";
import { handleOptionsCors } from "@/lib/security/cors";

export const maxDuration = 30;

export async function OPTIONS(request: Request) {
  return handleOptionsCors(request);
}

export interface MarketplaceStudio {
  id: string;
  name: string;
  brand_name?: string | null;
  city: string;
  area: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  website?: string | null;
  logo_url?: string | null;
  rating: number;
  review_count: number;
  verified: boolean;
  is_sponsored?: boolean;
  plan_tier: "pro" | "trial" | "enterprise";
  starting_price: number;
  services: string[];
  description: string;
}

function calculateProfileCompleteness(s: MarketplaceStudio): number {
  let score = 0;
  if (s.name && s.name.length > 2) score += 10;
  if (s.brand_name) score += 10;
  if (s.logo_url) score += 15;
  if (s.phone) score += 10;
  if (s.email) score += 10;
  if (s.address) score += 10;
  if (s.website) score += 10;
  if (s.description && s.description.length > 20) score += 15;
  if (s.services && s.services.length > 0) score += 10;
  return score;
}

export async function GET(req: NextRequest) {
  const ip = getClientIp(req);
  const rateLimitResult = await checkRateLimit(ip, { limit: 120, windowSeconds: 60, prefix: "marketplace-studios" });
  if (!rateLimitResult.success) {
    return createRateLimitResponse(rateLimitResult);
  }

  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim().toLowerCase();
    const area = searchParams.get("area")?.trim().toLowerCase();
    const search = searchParams.get("search")?.trim().toLowerCase();
    const category = searchParams.get("category")?.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dbStudios: MarketplaceStudio[] = [];

    // Query real studios from database
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: rows, error: dbErr } = await supabase
          .from("studios")
          .select("id, name, brand_name, city, address, state, contact_phone, contact_email, website, logo_url, description, status, metadata")
          .eq("status", "active")
          .order("created_at", { ascending: false })
          .limit(100);

        if (!dbErr && Array.isArray(rows) && rows.length > 0) {
          dbStudios = rows.map((r: Record<string, unknown>) => {
            const meta = (r.metadata && typeof r.metadata === "object") ? (r.metadata as Record<string, unknown>) : {};
            return {
              id: String(r.id),
              name: (typeof r.name === "string" ? r.name : "") || (typeof r.brand_name === "string" ? r.brand_name : "") || "Photography Studio",
              brand_name: typeof r.brand_name === "string" ? r.brand_name : typeof r.name === "string" ? r.name : null,
              city: typeof r.city === "string" ? r.city : "Pune",
              area: typeof meta?.area === "string" ? meta.area : typeof r.city === "string" ? r.city : "Main",
              address: typeof r.address === "string" ? r.address : null,
              phone: typeof r.contact_phone === "string" ? r.contact_phone : null,
              email: typeof r.contact_email === "string" ? r.contact_email : null,
              website: typeof r.website === "string" ? r.website : null,
              logo_url: typeof r.logo_url === "string" ? r.logo_url : null,
              rating: typeof meta?.rating === "number" ? meta.rating : 0,
              review_count: typeof meta?.review_count === "number" ? meta.review_count : 0,
              verified: Boolean(meta?.is_verified ?? false),
              is_sponsored: Boolean(meta?.is_sponsored ?? meta?.sponsored_badge ?? meta?.sponsored ?? false),
              plan_tier: meta?.plan_tier === "enterprise" ? "enterprise" : meta?.plan_tier === "pro" ? "pro" : "trial",
              starting_price: typeof meta?.starting_price === "number" ? meta.starting_price : 0,
              services: Array.isArray(meta?.services) ? (meta.services as string[]) : [],
              description: typeof r.description === "string" ? r.description : "",
            };
          });
        }
      } catch (dbErr) {
        console.warn("[MarketplaceStudios] DB fetch notice:", dbErr);
      }
    }

    // Filter area-wise / city-wise / search / category
    let filtered = dbStudios;

    if (city && city !== "all" && city !== "all cities") {
      filtered = filtered.filter(
        (s) => s.city.toLowerCase() === city || s.city.toLowerCase().includes(city),
      );
    }

    if (area && area !== "all") {
      filtered = filtered.filter(
        (s) => s.area.toLowerCase().includes(area) || s.address?.toLowerCase().includes(area),
      );
    }

    if (search) {
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(search) ||
          (s.brand_name || "").toLowerCase().includes(search) ||
          s.city.toLowerCase().includes(search) ||
          s.area.toLowerCase().includes(search) ||
          (s.address || "").toLowerCase().includes(search) ||
          s.services.some((srv) => srv.toLowerCase().includes(search)),
      );
    }

    if (category && category !== "all" && category !== "all services") {
      filtered = filtered.filter((s) =>
        s.services.some((srv) => srv.toLowerCase().includes(category)),
      );
    }

    // Sort: Sponsored studios first, then top preference for studios with most updated profile
    filtered.sort((a, b) => {
      if (a.is_sponsored && !b.is_sponsored) return -1;
      if (!a.is_sponsored && b.is_sponsored) return 1;

      const scoreA = calculateProfileCompleteness(a);
      const scoreB = calculateProfileCompleteness(b);
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }

      return b.rating - a.rating;
    });

    // Unique cities and areas from real database studios
    const availableCities = Array.from(new Set(dbStudios.map((s) => s.city).filter(Boolean)));
    const availableAreas = Array.from(
      new Set(
        dbStudios
          .map((s) => (s.area && s.city ? `${s.area}, ${s.city}` : s.city))
          .filter(Boolean),
      ),
    );

    return NextResponse.json({
      success: true,
      studios: filtered,
      total: filtered.length,
      cities: availableCities,
      areas: availableAreas,
    });
  } catch (error) {
    console.error("[api/marketplace/studios] error:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Failed to load studios",
      },
      { status: 500 },
    );
  }
}
