import {
  supabase,
} from "@/lib/supabase/client";


export type SubscriptionStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "past_due"
  | string;


export type SubscriptionAccessStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "past_due"
  | "inactive"
  | string;


export type SubscriptionAccessDetails = {
  subscription_id:
    string | null;

  plan:
    string | null;

  plan_name:
    string | null;

  price:
    number | null;

  currency:
    string | null;

  billing_cycle:
    string | null;

  trial_days:
    number | null;

  status:
    SubscriptionStatus | null;

  access_status:
    SubscriptionAccessStatus | null;

  has_access:
    boolean;

  is_trial:
    boolean;

  is_expiring_soon:
    boolean;

  show_upgrade_prompt:
    boolean;

  days_remaining:
    number | null;

  trial_start_at:
    string | null;

  trial_end_at:
    string | null;

  subscription_start_at:
    string | null;

  subscription_end_at:
    string | null;

  effective_access_end_at:
    string | null;

  next_billing_at:
    string | null;

  limits:
    Record<string, unknown>;

  features:
    Record<string, unknown>;
};


function normalizeSubscriptionAccess(
  value:
    unknown,
):
  SubscriptionAccessDetails | null {

  if (
    !value ||
    typeof value !== "object"
  ) {

    return null;

  }


  const data =
    value as Record<
      string,
      unknown
    >;


  return {
    subscription_id:
      typeof data.subscription_id ===
      "string"
        ? data.subscription_id
        : null,

    plan:
      typeof data.plan ===
      "string"
        ? data.plan
        : null,

    plan_name:
      typeof data.plan_name ===
      "string"
        ? data.plan_name
        : null,

    price:
      typeof data.price ===
      "number"
        ? data.price
        : data.price !== null &&
          data.price !== undefined
          ? Number(
              data.price,
            )
          : null,

    currency:
      typeof data.currency ===
      "string"
        ? data.currency
        : null,

    billing_cycle:
      typeof data.billing_cycle ===
      "string"
        ? data.billing_cycle
        : null,

    trial_days:
      typeof data.trial_days ===
      "number"
        ? data.trial_days
        : data.trial_days !== null &&
          data.trial_days !== undefined
          ? Number(
              data.trial_days,
            )
          : null,

    status:
      typeof data.status ===
      "string"
        ? data.status
        : null,

    access_status:
      typeof data.access_status ===
      "string"
        ? data.access_status
        : null,

    has_access:
      data.has_access ===
      true,

    is_trial:
      data.is_trial ===
      true,

    is_expiring_soon:
      data.is_expiring_soon ===
      true,

    show_upgrade_prompt:
      data.show_upgrade_prompt ===
      true,

    days_remaining:
      typeof data.days_remaining ===
      "number"
        ? data.days_remaining
        : data.days_remaining !== null &&
          data.days_remaining !== undefined
          ? Number(
              data.days_remaining,
            )
          : null,

    trial_start_at:
      typeof data.trial_start_at ===
      "string"
        ? data.trial_start_at
        : null,

    trial_end_at:
      typeof data.trial_end_at ===
      "string"
        ? data.trial_end_at
        : null,

    subscription_start_at:
      typeof data.subscription_start_at ===
      "string"
        ? data.subscription_start_at
        : null,

    subscription_end_at:
      typeof data.subscription_end_at ===
      "string"
        ? data.subscription_end_at
        : null,

    effective_access_end_at:
      typeof data.effective_access_end_at ===
      "string"
        ? data.effective_access_end_at
        : null,

    next_billing_at:
      typeof data.next_billing_at ===
      "string"
        ? data.next_billing_at
        : null,

    limits:
      data.limits &&
      typeof data.limits ===
      "object"
        ? data.limits as Record<
            string,
            unknown
          >
        : {},

    features:
      data.features &&
      typeof data.features ===
      "object"
        ? data.features as Record<
            string,
            unknown
          >
        : {},
  };

}


export async function
getSubscriptionAccessDetails(
  studioId:
    string,
):
  Promise<
    SubscriptionAccessDetails | null
  > {

  const {
    data,
    error,
  } =
    await supabase.rpc(
      "get_subscription_access_details",
      {
        p_studio_id:
          studioId,
      },
    );


  if (error) {

    throw error;

  }


  return normalizeSubscriptionAccess(
    data,
  );

}
