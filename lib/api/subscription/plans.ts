import {
  supabase,
} from "@/lib/supabase/client";

import type {
  SubscriptionPlan,
} from "@/types/subscription/plan";


function asRecord(
  value: unknown,
): Record<
  string,
  unknown
> {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(
      value,
    )
  ) {
    return value as Record<
      string,
      unknown
    >;
  }

  return {};
}


function normalizePlan(
  value: Record<
    string,
    unknown
  >,
): SubscriptionPlan {
  return {
    id:
      String(
        value.id,
      ),

    plan_code:
      String(
        value.plan_code,
      ),

    name:
      String(
        value.name,
      ),

    description:
      typeof value.description ===
      "string"
        ? value.description
        : null,

    plan_type:
      typeof value.plan_type ===
      "string"
        ? value.plan_type
        : "",

    price:
      Number(
        value.price ??
        0,
      ),

    currency:
      typeof value.currency ===
      "string"
        ? value.currency
        : "INR",

    billing_cycle:
      typeof value.billing_cycle ===
      "string"
        ? value.billing_cycle
        : "monthly",

    trial_days:
      Number(
        value.trial_days ??
        0,
      ),

    limits:
      asRecord(
        value.limits,
      ),

    features:
      asRecord(
        value.features,
      ),

    metadata:
      asRecord(
        value.metadata,
      ),

    is_active:
      value.is_active !==
      false,
  };
}


const FALLBACK_PLANS: SubscriptionPlan[] = [
  {
    id: "business_starter",
    plan_code: "business_starter_monthly",
    name: "Business Starter",
    description: "Essential PhotoOS plan for small photography studios.",
    plan_type: "studio_software",
    price: 399,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { users: 3, storage_gb: 50, events_per_month: 50 },
    features: { dashboard: true, crm: true, events: true, projects: true, gallery: true },
    metadata: { popular: false },
    is_active: true,
  },
  {
    id: "business_booster",
    plan_code: "business_booster_monthly",
    name: "Business Booster",
    description: "Expanded PhotoOS plan for growing photography studios.",
    plan_type: "studio_software",
    price: 799,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { users: 8, storage_gb: 200, events_per_month: 150 },
    features: { dashboard: true, crm: true, events: true, projects: true, gallery: true, reports: true },
    metadata: { popular: true },
    is_active: true,
  },
  {
    id: "business_elite",
    plan_code: "business_elite_monthly",
    name: "Business Elite",
    description: "Complete studio operating system for high-volume photography businesses.",
    plan_type: "studio_software",
    price: 1499,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { users: 20, storage_gb: 1000, events_per_month: 500 },
    features: { dashboard: true, crm: true, events: true, projects: true, gallery: true, reports: true, automation: true },
    metadata: { popular: false },
    is_active: true,
  },
];

export async function getSubscriptionPlans(): Promise<SubscriptionPlan[]> {
  try {
    const { data, error } = await supabase
      .from("subscription_plans")
      .select(`
        id,
        plan_code,
        name,
        description,
        plan_type,
        price,
        currency,
        billing_cycle,
        trial_days,
        limits,
        features,
        metadata,
        is_active
      `)
      .eq("is_active", true);

    if (!error && data && data.length > 0) {
      return data.map((plan) => normalizePlan(plan as Record<string, unknown>));
    }
  } catch (err) {
    console.warn("[getSubscriptionPlans] Failed to fetch from DB, using fallback:", err);
  }

  return FALLBACK_PLANS;
}
