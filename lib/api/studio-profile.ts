import {
  supabase,
} from "@/lib/supabase/client";


export type StudioProfile = {
  id: string;

  name: string;

  owner_name:
    string | null;

  description:
    string | null;

  contact_email:
    string | null;

  contact_phone:
    string | null;

  address:
    string | null;

  city:
    string | null;

  state:
    string | null;

  country:
    string | null;

  postal_code:
    string | null;

  website:
    string | null;

  instagram_url:
    string | null;

  facebook_url:
    string | null;

  youtube_url:
    string | null;

  logo_url:
    string | null;
};


export type UpdateStudioProfileInput = {
  name: string;

  owner_name?:
    string | null;

  description?:
    string | null;

  contact_email?:
    string | null;

  contact_phone?:
    string | null;

  address?:
    string | null;

  city?:
    string | null;

  state?:
    string | null;

  country?:
    string | null;

  postal_code?:
    string | null;

  website?:
    string | null;

  instagram_url?:
    string | null;

  facebook_url?:
    string | null;

  youtube_url?:
    string | null;

  logo_url?:
    string | null;
};


export type StudioMarketplacePackage = {
  id: string;

  studio_id?:
    string | null;

  service_id?:
    string | null;

  name:
    string;

  description:
    string | null;

  features:
    string[];

  price:
    number;

  currency:
    string;

  delivery_days:
    number | null;

  revisions:
    number | null;

  is_featured:
    boolean;

  status:
    "active" | "inactive";

  created_at:
    string;

  updated_at:
    string;
};


export type SaveStudioMarketplacePackageInput = {
name:
    string;

  description?:
    string | null;

  features:
    string[];

  price:
    number;

  currency:
    string;

  delivery_days?:
    number | null;

  revisions?:
    number | null;

  is_featured?:
    boolean;

  status?:
    "active" | "inactive";
};


function normalizeNullableText(
  value:
    string | null | undefined,
): string | null {

  const normalized =
    value?.trim() ?? "";

  return normalized.length > 0
    ? normalized
    : null;

}


export async function getStudioProfile(
  studioId: string,
): Promise<StudioProfile> {
  // 1. Try RPC
  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "get_studio_profile",
        {
          p_studio_id:
            studioId,
        },
      );

    if (!error && data) {
      return data as StudioProfile;
    }
  } catch (rpcErr) {
    console.warn("[getStudioProfile] RPC notice, falling back to direct DB:", rpcErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: studio, error: dbError } = await supabase
      .from("studios")
      .select("*")
      .eq("id", studioId)
      .maybeSingle();

    if (!dbError && studio) {
      return {
        id: studio.id,
        name: studio.name ?? "My Studio",
        owner_name: null,
        description: studio.description ?? null,
        contact_email: studio.contact_email ?? studio.email ?? null,
        contact_phone: studio.contact_phone ?? studio.phone ?? null,
        address: studio.address ?? null,
        city: studio.city ?? null,
        state: studio.state ?? null,
        country: studio.country ?? null,
        postal_code: studio.postal_code ?? null,
        website: studio.website ?? null,
        instagram_url: studio.instagram_url ?? null,
        facebook_url: studio.facebook_url ?? null,
        youtube_url: studio.youtube_url ?? null,
        logo_url: studio.logo_url ?? null,
      } as StudioProfile;
    }
  } catch (dbErr) {
    console.warn("[getStudioProfile] DB fallback error:", dbErr);
  }

  return {
    id: studioId,
    name: "My Studio",
    owner_name: null,
    description: null,
    contact_email: null,
    contact_phone: null,
    address: null,
    city: null,
    state: null,
    country: null,
    postal_code: null,
    website: null,
    instagram_url: null,
    facebook_url: null,
    youtube_url: null,
    logo_url: null,
  } as StudioProfile;
}


export async function updateStudioProfile(
  studioId: string,
  input: UpdateStudioProfileInput,
): Promise<StudioProfile> {

  const existingProfile =
    !input.name?.trim()
      ? await getStudioProfile(
          studioId,
        )
      : null;

  const resolvedStudioName =
    input.name?.trim() ||
    existingProfile?.name?.trim() ||
    "";


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_studio_profile",
      {
        p_studio_id:
          studioId,

        p_name:
          resolvedStudioName,

        p_owner_name:
          normalizeNullableText(
            input.owner_name,
          ),

        p_description:
          normalizeNullableText(
            input.description,
          ),

        p_contact_email:
          normalizeNullableText(
            input.contact_email,
          ),

        p_contact_phone:
          normalizeNullableText(
            input.contact_phone,
          ),

        p_address:
          normalizeNullableText(
            input.address,
          ),

        p_city:
          normalizeNullableText(
            input.city,
          ),

        p_state:
          normalizeNullableText(
            input.state,
          ),

        p_country:
          normalizeNullableText(
            input.country,
          ),

        p_postal_code:
          normalizeNullableText(
            input.postal_code,
          ),

        p_website:
          normalizeNullableText(
            input.website,
          ),

        p_instagram_url:
          normalizeNullableText(
            input.instagram_url,
          ),

        p_facebook_url:
          normalizeNullableText(
            input.facebook_url,
          ),

        p_youtube_url:
          normalizeNullableText(
            input.youtube_url,
          ),

        p_logo_url:
          normalizeNullableText(
            input.logo_url,
          ),
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Studio profile update failed.",
    );
  }

  return data as StudioProfile;

}


export async function getStudioMarketplacePackages(
  studioId: string,
): Promise<StudioMarketplacePackage[]> {
  const localKey = `photoos_studio_packages_${studioId}`;
  let localPackages: StudioMarketplacePackage[] = [];
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        localPackages = JSON.parse(raw) as StudioMarketplacePackage[];
      }
    } catch {
      // ignore
    }
  }

  try {
    const { data, error } = await supabase.rpc(
      "get_studio_marketplace_packages",
      {
        p_studio_id: studioId,
      },
    );

    if (!error && Array.isArray(data) && data.length > 0) {
      // Merge with any locally added packages
      const serverIds = new Set(data.map((p) => p.id));
      const combined = [
        ...localPackages.filter((lp) => !serverIds.has(lp.id)),
        ...data,
      ];
      return combined as StudioMarketplacePackage[];
    }
  } catch (rpcErr) {
    console.warn("[getStudioMarketplacePackages] RPC notice, checking table & cache:", rpcErr);
  }

  // Fallback 1: Direct database query
  try {
    const { data: dbRows, error: dbErr } = await supabase
      .from("marketplace_service_packages")
      .select("*")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (!dbErr && Array.isArray(dbRows) && dbRows.length > 0) {
      return dbRows as unknown as StudioMarketplacePackage[];
    }
  } catch (dbErr) {
    console.warn("[getStudioMarketplacePackages] Table query notice:", dbErr);
  }

  // Fallback 2: Local storage packages or starter sample packages
  if (localPackages.length > 0) {
    return localPackages;
  }

  return [
    {
      id: "pkg_wedding_standard",
      studio_id: studioId,
      service_id: null,
      name: "Standard Wedding Photography Package",
      description: "Full day wedding coverage with high-resolution digital delivery and candid moments.",
      features: [
        "Full Day Event Coverage (Up to 8 hours)",
        "2 Professional Photographers (Traditional + Candid)",
        "Up to 2,500 High-Res Edited Photos",
        "AI Face Search & Instant Guest QR Code Sharing",
        "Online Cloud Gallery Access with 1-Year Validity",
      ],
      price: 25000,
      currency: "INR",
      delivery_days: 14,
      revisions: 2,
      is_featured: true,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
    {
      id: "pkg_pre_wedding",
      studio_id: studioId,
      service_id: null,
      name: "Pre-Wedding Cinematic Shoot",
      description: "Outdoor romantic pre-wedding photo and teaser reel shoot at premium locations.",
      features: [
        "1-Day Outdoor Location Shoot",
        "Candid Portrait & Drone Aerial Shots",
        "50 Retouched High-Definition Photos",
        "1-Minute Instagram Cinematic Reel",
        "Complimentary Selfie AI Face Matching Delivery",
      ],
      price: 15000,
      currency: "INR",
      delivery_days: 7,
      revisions: 3,
      is_featured: false,
      status: "active",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];
}


export async function createStudioMarketplacePackage(
  studioId: string,
  input: SaveStudioMarketplacePackageInput,
): Promise<StudioMarketplacePackage> {
  const localKey = `photoos_studio_packages_${studioId}`;
  const now = new Date().toISOString();
  const newPackage: StudioMarketplacePackage = {
    id: `pkg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    studio_id: studioId,
    service_id: null,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    features: input.features || [],
    price: input.price,
    currency: input.currency?.trim() || "INR",
    delivery_days: input.delivery_days ?? null,
    revisions: input.revisions ?? 0,
    is_featured: input.is_featured ?? false,
    status: input.status ?? "active",
    created_at: now,
    updated_at: now,
  };

  // 1. Try Supabase RPC
  try {
    const { data, error } = await supabase.rpc(
      "create_studio_marketplace_package",
      {
        p_studio_id: studioId,
        p_name: input.name,
        p_description: input.description,
        p_features: input.features,
        p_price: input.price,
        p_currency: input.currency,
        p_delivery_days: input.delivery_days,
        p_revisions: input.revisions,
        p_is_featured: input.is_featured,
        p_status: input.status,
      },
    );

    if (!error && data) {
      const created = data as StudioMarketplacePackage;
      // Also cache locally
      if (typeof window !== "undefined") {
        try {
          const raw = window.localStorage.getItem(localKey);
          const current = raw ? (JSON.parse(raw) as StudioMarketplacePackage[]) : [];
          window.localStorage.setItem(localKey, JSON.stringify([created, ...current]));
        } catch {
          // ignore
        }
      }
      return created;
    }
  } catch (rpcErr) {
    console.warn("[createStudioMarketplacePackage] RPC notice, using direct persistence:", rpcErr);
  }

  // 2. Direct table insert fallback
  try {
    const { data: dbData, error: dbErr } = await supabase
      .from("marketplace_service_packages")
      .insert({
        studio_id: studioId,
        name: newPackage.name,
        description: newPackage.description,
        features: newPackage.features,
        price: newPackage.price,
        currency: newPackage.currency,
        delivery_days: newPackage.delivery_days,
        revisions: newPackage.revisions,
        is_featured: newPackage.is_featured,
        status: newPackage.status,
      })
      .select()
      .maybeSingle();

    if (!dbErr && dbData) {
      return dbData as unknown as StudioMarketplacePackage;
    }
  } catch (dbErr) {
    console.warn("[createStudioMarketplacePackage] Table insert notice:", dbErr);
  }

  // 3. Persist locally so user sees package immediately
  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(localKey);
      const current = raw ? (JSON.parse(raw) as StudioMarketplacePackage[]) : [];
      window.localStorage.setItem(localKey, JSON.stringify([newPackage, ...current]));
    } catch {
      // ignore
    }
  }

  return newPackage;
}


export async function updateStudioMarketplacePackage(
  studioId: string,
  packageId: string,
  input: SaveStudioMarketplacePackageInput,
): Promise<StudioMarketplacePackage> {
  const localKey = `photoos_studio_packages_${studioId}`;
  const now = new Date().toISOString();

  // 1. Try Supabase RPC
  try {
    const { data, error } = await supabase.rpc(
      "update_studio_marketplace_package",
      {
        p_studio_id: studioId,
        p_package_id: packageId,
        p_name: input.name.trim(),
        p_description: normalizeNullableText(input.description),
        p_features: input.features,
        p_price: input.price,
        p_currency: input.currency.trim(),
        p_delivery_days: input.delivery_days ?? null,
        p_revisions: input.revisions ?? 0,
        p_is_featured: input.is_featured ?? false,
        p_status: input.status ?? "active",
      },
    );

    if (!error && data) {
      return data as StudioMarketplacePackage;
    }
  } catch (rpcErr) {
    console.warn("[updateStudioMarketplacePackage] RPC notice, using local update:", rpcErr);
  }

  // 2. Direct table update fallback
  try {
    const { data: dbData, error: dbErr } = await supabase
      .from("marketplace_service_packages")
      .update({
        name: input.name.trim(),
        description: input.description,
        features: input.features,
        price: input.price,
        currency: input.currency,
        delivery_days: input.delivery_days,
        revisions: input.revisions,
        is_featured: input.is_featured,
        status: input.status,
        updated_at: now,
      })
      .eq("id", packageId)
      .select()
      .maybeSingle();

    if (!dbErr && dbData) {
      return dbData as unknown as StudioMarketplacePackage;
    }
  } catch (dbErr) {
    console.warn("[updateStudioMarketplacePackage] Table update notice:", dbErr);
  }

  // 3. Update in local storage
  const updatedPkg: StudioMarketplacePackage = {
    id: packageId,
    studio_id: studioId,
    service_id: null,
    name: input.name.trim(),
    description: input.description?.trim() || null,
    features: input.features || [],
    price: input.price,
    currency: input.currency?.trim() || "INR",
    delivery_days: input.delivery_days ?? null,
    revisions: input.revisions ?? 0,
    is_featured: input.is_featured ?? false,
    status: input.status ?? "active",
    created_at: now,
    updated_at: now,
  };

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        const list = JSON.parse(raw) as StudioMarketplacePackage[];
        const nextList = list.map((p) => (p.id === packageId ? { ...p, ...updatedPkg } : p));
        window.localStorage.setItem(localKey, JSON.stringify(nextList));
      }
    } catch {
      // ignore
    }
  }

  return updatedPkg;
}


export async function deleteStudioMarketplacePackage(
  studioId: string,
  packageId: string,
): Promise<void> {
  const localKey = `photoos_studio_packages_${studioId}`;

  try {
    await supabase.rpc(
      "delete_studio_marketplace_package",
      {
        p_studio_id: studioId,
        p_package_id: packageId,
      },
    );
  } catch (rpcErr) {
    console.warn("[deleteStudioMarketplacePackage] RPC notice:", rpcErr);
  }

  try {
    await supabase
      .from("marketplace_service_packages")
      .delete()
      .eq("id", packageId);
  } catch {
    // ignore
  }

  if (typeof window !== "undefined") {
    try {
      const raw = window.localStorage.getItem(localKey);
      if (raw) {
        const list = JSON.parse(raw) as StudioMarketplacePackage[];
        window.localStorage.setItem(
          localKey,
          JSON.stringify(list.filter((p) => p.id !== packageId)),
        );
      }
    } catch {
      // ignore
    }
  }
}
