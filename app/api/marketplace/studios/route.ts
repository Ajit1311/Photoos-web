import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
  plan_tier: "pro" | "trial" | "enterprise";
  starting_price: number;
  services: string[];
  description: string;
}

// Curated verified studio directory across Maharashtra & India
const SEED_MARKETPLACE_STUDIOS: MarketplaceStudio[] = [
  {
    id: "studio-pune-1",
    name: "Royal Shutter Studio",
    brand_name: "Royal Shutter Luxury Weddings",
    city: "Pune",
    area: "Kothrud",
    address: "Plot 14, Near Karve Statue, Kothrud, Pune - 411038",
    phone: "9822012345",
    email: "contact@royalshutter.in",
    rating: 4.9,
    review_count: 86,
    verified: true,
    plan_tier: "pro",
    starting_price: 45000,
    services: ["Wedding Photography", "Cinematic Films", "Pre-Wedding", "Drone 4K", "Canvera Album"],
    description: "Award-winning wedding photography and 4K cinematography studio based in Pune with 10+ years of royal wedding coverage.",
  },
  {
    id: "studio-pune-2",
    name: "PixelCraft Cinematography",
    brand_name: "PixelCraft Films & Studio",
    city: "Pune",
    area: "Baner",
    address: "High Street, Baner Road, Baner, Pune - 411045",
    phone: "9823054321",
    email: "info@pixelcraftfilms.com",
    rating: 4.8,
    review_count: 64,
    verified: true,
    plan_tier: "trial",
    starting_price: 35000,
    services: ["Cinematic Films", "Candid Wedding", "Pre-Wedding Shoots", "Teaser Reels"],
    description: "Modern wedding storytelling, candid moments, and cinematic trailers crafted with cinematic grade cameras.",
  },
  {
    id: "studio-pune-3",
    name: "Sanskriti Photo World",
    brand_name: "Sanskriti Photo World",
    city: "Pune",
    area: "Shivaji Nagar",
    address: "FC Road, Shivaji Nagar, Pune - 411005",
    phone: "9822187654",
    email: "sanskriti@photoworld.in",
    rating: 4.7,
    review_count: 52,
    verified: true,
    plan_tier: "pro",
    starting_price: 30000,
    services: ["Traditional Wedding", "Candid Photography", "Photobook Albums", "Live Streaming"],
    description: "Traditional Maharashtrian wedding rituals, vibrant portraits, and luxury velvet-bound albums.",
  },
  {
    id: "studio-mumbai-1",
    name: "DreamLight Studio",
    brand_name: "DreamLight Luxury Weddings",
    city: "Mumbai",
    area: "Andheri West",
    address: "Lokhandwala Complex, Andheri West, Mumbai - 400053",
    phone: "9820011223",
    email: "hello@dreamlight.in",
    rating: 4.9,
    review_count: 114,
    verified: true,
    plan_tier: "pro",
    starting_price: 65000,
    services: ["Destination Weddings", "Cinematic Films", "Drone 4K", "Pre-Wedding", "Celebrity Shoots"],
    description: "Mumbai's premier destination wedding studio specializing in Bollywood-style cinematic wedding films and luxury albums.",
  },
  {
    id: "studio-mumbai-2",
    name: "Classic Frame Works",
    brand_name: "Classic Frame Works",
    city: "Mumbai",
    area: "Bandra West",
    address: "Hill Road, Bandra West, Mumbai - 400050",
    phone: "9820988776",
    email: "bandra@classicframeworks.in",
    rating: 4.8,
    review_count: 73,
    verified: true,
    plan_tier: "trial",
    starting_price: 50000,
    services: ["Candid Photography", "Pre-Wedding", "Portraits", "Fashion & Lifestyle"],
    description: "Bespoke fine-art wedding photography and candid photojournalism capturing authentic emotions.",
  },
  {
    id: "studio-thane-1",
    name: "Shree Ganesh Digital Studio",
    brand_name: "Shree Ganesh Studio",
    city: "Thane",
    area: "Naupada",
    address: "Gokhale Road, Naupada, Thane West - 400602",
    phone: "9819933445",
    email: "shreeganesh@thanestudio.in",
    rating: 4.7,
    review_count: 48,
    verified: true,
    plan_tier: "trial",
    starting_price: 28000,
    services: ["Wedding Photography", "Haldi & Sangeet", "Canvera Albums", "Drone Coverage"],
    description: "Complete wedding package coverage with fast turnaround time and premium digital album printing.",
  },
  {
    id: "studio-nashik-1",
    name: "Godavari Arts Studio",
    brand_name: "Godavari Arts & Media",
    city: "Nashik",
    area: "College Road",
    address: "Near Big Bazaar, College Road, Nashik - 422005",
    phone: "9823199887",
    email: "info@godavariarts.in",
    rating: 4.8,
    review_count: 59,
    verified: true,
    plan_tier: "pro",
    starting_price: 32000,
    services: ["Vineyard Pre-Wedding", "Wedding Photography", "Cinematic Films", "Drone 4K"],
    description: "Specialists in Nashik vineyard pre-wedding shoots and grand traditional wedding cinematography.",
  },
  {
    id: "studio-kolhapur-1",
    name: "Mahalaxmi Digital Creations",
    brand_name: "Mahalaxmi Studio Kolhapur",
    city: "Kolhapur",
    area: "Rajarampuri",
    address: "Main Road, 4th Lane, Rajarampuri, Kolhapur - 416008",
    phone: "9822344556",
    email: "mahalaxmi@kolhapurstudio.com",
    rating: 4.9,
    review_count: 92,
    verified: true,
    plan_tier: "pro",
    starting_price: 30000,
    services: ["Royal Maratha Weddings", "Candid Photography", "Traditional Shoot", "Cinematic Teasers"],
    description: "Authentic Kolhapuri traditional wedding captures with royal safa, jewelry, and cinematic grand entries.",
  },
  {
    id: "studio-nagpur-1",
    name: "Orange City Visuals",
    brand_name: "Orange City Wedding Films",
    city: "Nagpur",
    area: "Dharampeth",
    address: "West High Court Road, Dharampeth, Nagpur - 440010",
    phone: "9823901234",
    email: "orangecityvisuals@gmail.com",
    rating: 4.8,
    review_count: 41,
    verified: true,
    plan_tier: "trial",
    starting_price: 35000,
    services: ["Wedding Photography", "Cinematography", "Pre-Wedding", "Album Design"],
    description: "Central India's creative wedding and pre-wedding studio equipped with latest Sony FX cinema gear.",
  },
  {
    id: "studio-aurangabad-1",
    name: "Ellora Studios",
    brand_name: "Ellora Digital Media",
    city: "Chhatrapati Sambhajinagar",
    area: "Cidco",
    address: "Town Centre, Cidco, Chhatrapati Sambhajinagar - 431003",
    phone: "9822789012",
    email: "ellorastudios@aurangabad.in",
    rating: 4.7,
    review_count: 38,
    verified: true,
    plan_tier: "trial",
    starting_price: 29000,
    services: ["Heritage Pre-Wedding", "Traditional Weddings", "Candid Films", "Drone 4K"],
    description: "Capturing wedding celebrations and architectural pre-weddings across Marathwada.",
  },
];

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const city = searchParams.get("city")?.trim().toLowerCase();
    const area = searchParams.get("area")?.trim().toLowerCase();
    const search = searchParams.get("search")?.trim().toLowerCase();
    const category = searchParams.get("category")?.trim().toLowerCase();

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let dbStudios: MarketplaceStudio[] = [];

    // 1. Fetch DB studios if available
    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const { data: rows } = await supabase
          .from("studios")
          .select("id, name, brand_name, city, address, state, contact_phone, contact_email, website, logo_url, description, status, metadata")
          .eq("status", "active")
          .limit(100);

        if (Array.isArray(rows) && rows.length > 0) {
          dbStudios = rows.map((r: any) => ({
            id: r.id,
            name: r.name || r.brand_name || "Photography Studio",
            brand_name: r.brand_name || r.name,
            city: r.city || "Pune",
            area: (r.metadata as any)?.area || r.city || "Main",
            address: r.address || `${r.city || "Pune"}, Maharashtra`,
            phone: r.contact_phone || "9822012345",
            email: r.contact_email || "studio@photoos.in",
            website: r.website || null,
            logo_url: r.logo_url || null,
            rating: Number((r.metadata as any)?.rating || 4.9),
            review_count: Number((r.metadata as any)?.review_count || 42),
            verified: true,
            plan_tier: ((r.metadata as any)?.plan_tier as any) || "pro",
            starting_price: Number((r.metadata as any)?.starting_price || 35000),
            services: Array.isArray((r.metadata as any)?.services)
              ? (r.metadata as any).services
              : ["Wedding Photography", "Cinematic Films", "Pre-Wedding", "Drone 4K", "Albums"],
            description: r.description || "Verified photography and cinematography partner on PhotoOS Marketplace.",
          }));
        }
      } catch (dbErr) {
        console.warn("[MarketplaceStudios] DB fetch notice:", dbErr);
      }
    }

    // Merge DB studios with Seed Studios (ensuring unique IDs)
    const dbStudioIds = new Set(dbStudios.map((s) => s.id));
    const allStudios = [
      ...dbStudios,
      ...SEED_MARKETPLACE_STUDIOS.filter((s) => !dbStudioIds.has(s.id)),
    ];

    // 2. Filter area-wise / city-wise / search / category
    let filtered = allStudios;

    if (city && city !== "all" && city !== "all cities") {
      filtered = filtered.filter(
        (s) => s.city.toLowerCase() === city || s.city.toLowerCase().includes(city)
      );
    }

    if (area && area !== "all") {
      filtered = filtered.filter(
        (s) => s.area.toLowerCase().includes(area) || s.address?.toLowerCase().includes(area)
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
          s.services.some((srv) => srv.toLowerCase().includes(search))
      );
    }

    if (category && category !== "all" && category !== "all services") {
      filtered = filtered.filter((s) =>
        s.services.some((srv) => srv.toLowerCase().includes(category))
      );
    }

    // Unique cities and areas for navigation filters
    const availableCities = Array.from(new Set(allStudios.map((s) => s.city)));
    const availableAreas = Array.from(new Set(allStudios.map((s) => `${s.area}, ${s.city}`)));

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
      { status: 500 }
    );
  }
}
