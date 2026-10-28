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
  // Monthly plans
  {
    id: "starter-monthly-plan",
    plan_code: "business_starter_monthly",
    name: "Business Starter",
    description: "Ideal for growing photographers looking to streamline studio operations.",
    plan_type: "studio_software",
    price: 499,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { storage_gb: 50, events_per_month: 2, watermark_photos: 10000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: false },
    is_active: true,
  },
  {
    id: "booster-monthly-plan",
    plan_code: "business_booster_monthly",
    name: "Business Booster",
    description: "For active professional studios managing multiple events every month.",
    plan_type: "studio_software",
    price: 899,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { storage_gb: 100, events_per_month: 6, watermark_photos: 25000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: true },
    is_active: true,
  },
  {
    id: "elite-monthly-plan",
    plan_code: "business_elite_monthly",
    name: "Business Elite",
    description: "For established high-volume studios requiring high capacity and unlimited branding.",
    plan_type: "studio_software",
    price: 1499,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { storage_gb: 200, events_per_month: 15, watermark_photos: -1 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: false },
    is_active: true,
  },

  // Yearly / Annual plans (2 months free / 10x monthly)
  {
    id: "starter-yearly-plan",
    plan_code: "business_starter_yearly",
    name: "Business Starter",
    description: "Ideal for growing photographers looking to streamline studio operations.",
    plan_type: "studio_software",
    price: 4990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 50, events_per_month: 2, watermark_photos: 10000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: false, yearly_savings: 998 },
    is_active: true,
  },
  {
    id: "booster-yearly-plan",
    plan_code: "business_booster_yearly",
    name: "Business Booster",
    description: "For active professional studios managing multiple events every month.",
    plan_type: "studio_software",
    price: 8990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 100, events_per_month: 6, watermark_photos: 25000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: true, yearly_savings: 1798 },
    is_active: true,
  },
  {
    id: "elite-yearly-plan",
    plan_code: "business_elite_yearly",
    name: "Business Elite",
    description: "For established high-volume studios requiring high capacity and unlimited branding.",
    plan_type: "studio_software",
    price: 14990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 200, events_per_month: 15, watermark_photos: -1 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: false, yearly_savings: 2998 },
    is_active: true,
  },

  // Free Trial
  {
    id: "trial-plan",
    plan_code: "photoos_free_trial_7_day",
    name: "7-Day Free Trial",
    description: "Start exploring PhotoOS studio management with full core features.",
    plan_type: "studio_software",
    price: 0,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 7,
    limits: { storage_gb: 5, events_per_month: 1, watermark_photos: 0 },
    features: { crm: true, events: true, gallery: true, dashboard: true },
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
