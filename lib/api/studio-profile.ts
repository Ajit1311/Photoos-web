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

  service_id:
    string;

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

  if (error) {
    console.error(
      "[StudioProfile RPC ERROR]",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw error;
  }

  console.log(
    "[StudioProfile RPC DATA]",
    data,
  );

  if (!data) {
    throw new Error(
      "Studio profile was not found.",
    );
  }

  return data as StudioProfile;

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

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_studio_marketplace_packages",
      {
        p_studio_id:
          studioId,
      },
    );

  if (error) {
    throw error;
  }

  return (
    Array.isArray(data)
      ? data
      : []
  ) as StudioMarketplacePackage[];

}


export async function createStudioMarketplacePackage(
  studioId: string,
  input: SaveStudioMarketplacePackageInput,
): Promise<StudioMarketplacePackage> {

  const {
  data,
  error,
} =
  await supabase.rpc(
    "create_studio_marketplace_package",
    {
      p_studio_id:
        studioId,

      p_name:
        input.name,

      p_description:
        input.description,

      p_features:
        input.features,

      p_price:
        input.price,

      p_currency:
        input.currency,

      p_delivery_days:
        input.delivery_days,

      p_revisions:
        input.revisions,

      p_is_featured:
        input.is_featured,

      p_status:
        input.status,
    },
  );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Package creation failed.",
    );
  }

  return data as StudioMarketplacePackage;

}


export async function updateStudioMarketplacePackage(
  studioId: string,
  packageId: string,
  input: SaveStudioMarketplacePackageInput,
): Promise<StudioMarketplacePackage> {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "update_studio_marketplace_package",
      {
        p_studio_id:
          studioId,

        p_package_id:
          packageId,

        p_name:
          input.name.trim(),

        p_description:
          normalizeNullableText(
            input.description,
          ),

        p_features:
          input.features,

        p_price:
          input.price,

        p_currency:
          input.currency.trim(),

        p_delivery_days:
          input.delivery_days ??
          null,

        p_revisions:
          input.revisions ??
          0,

        p_is_featured:
          input.is_featured ??
          false,

        p_status:
          input.status ??
          "active",
      },
    );

  if (error) {
    throw error;
  }

  if (!data) {
    throw new Error(
      "Package update failed.",
    );
  }

  return data as StudioMarketplacePackage;

}


export async function deleteStudioMarketplacePackage(
  studioId: string,
  packageId: string,
): Promise<void> {

  const {
    error,
  } =
    await supabase.rpc(
      "delete_studio_marketplace_package",
      {
        p_studio_id:
          studioId,

        p_package_id:
          packageId,
      },
    );

  if (error) {
    throw error;
  }

}
