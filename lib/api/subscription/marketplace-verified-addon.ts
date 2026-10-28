import {
  supabase,
} from "@/lib/supabase/client";

import type {
  MarketplaceVerifiedAddonDetails,
} from "@/types/subscription/subscription";


export async function getMarketplaceVerifiedAddon(
  studioId: string,
): Promise<
  MarketplaceVerifiedAddonDetails | null
> {
  try {
    const {
      data,
      error,
    } =
      await supabase.rpc(
        "get_marketplace_verified_addon",
        {
          p_studio_id:
            studioId,
        },
      );

    if (!error && data) {
      const raw =
        Array.isArray(data)
          ? data[0]
          : data;

      if (raw && typeof raw === "object") {
        return raw as MarketplaceVerifiedAddonDetails;
      }
    }
  } catch (err) {
    console.warn("[getMarketplaceVerifiedAddon] RPC notice:", err);
  }

  return null;
}


export type MarketplaceVerifiedAddonRenewalResult = {
  subscription_id: string;
  plan_code: string;
  plan_name: string;
  amount: number;
  currency: string;
  payment_id: string | null;
  status: string;
};


export async function requestMarketplaceVerifiedAddonRenewal(
  studioId: string,
): Promise<MarketplaceVerifiedAddonRenewalResult> {

  const {
    data: {
      user,
    },
    error: userError,
  } =
    await supabase.auth.getUser();


  if (userError) {

    throw new Error(
      userError.message,
    );

  }


  if (!user) {

    throw new Error(
      "You must be signed in to renew this add-on.",
    );

  }


  const {
    data,
    error,
  } =
    await supabase.rpc(
      "request_marketplace_verified_addon_renewal",
      {
        p_studio_id:
          studioId,
      },
    );


  if (error) {

    throw new Error(
      error.message,
    );

  }


  if (!data) {

    throw new Error(
      "Unable to create add-on renewal payment.",
    );

  }


  return (
    Array.isArray(data)
      ? data[0]
      : data
  ) as MarketplaceVerifiedAddonRenewalResult;
}
