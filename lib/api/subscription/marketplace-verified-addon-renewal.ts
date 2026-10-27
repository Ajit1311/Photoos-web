import {
  supabase,
} from "@/lib/supabase/client";


export type MarketplaceVerifiedAddonRenewalResult = {
  payment_id: string | null;
  subscription_id: string;
  plan_id: string;
  plan_code: string;
  plan_name: string;
  billing_cycle: string;
  amount: number;
  currency: string;
  payment_required: boolean;
  subscription_status: string;
};


export async function requestMarketplaceVerifiedAddonRenewal(
  subscriptionId: string,
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
        p_subscription_id:
          subscriptionId,
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
