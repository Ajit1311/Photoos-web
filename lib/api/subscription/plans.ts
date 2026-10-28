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

  // Yearly / Annual plans (Annual Shield: 2 months free + 1 bonus month = 13 months total)
  {
    id: "starter-yearly-plan",
    plan_code: "business_starter_yearly",
    name: "Business Starter (Annual Shield)",
    description: "Ideal for growing photographers. Includes Annual Shield: 13 months total, covering off-season completely.",
    plan_type: "studio_software",
    price: 4990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 50, events_per_month: 2, watermark_photos: 10000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true },
    metadata: { popular: false, yearly_savings: 998, annual_shield: true, annual_shield_badge: "Annual Shield (13 Months)", bonus_months: "2 Free + 1 Bonus Month" },
    is_active: true,
  },
  {
    id: "booster-yearly-plan",
    plan_code: "business_booster_yearly",
    name: "Business Booster (Annual Shield)",
    description: "For active professional studios. Includes Annual Shield: 13 months total with full off-season covered.",
    plan_type: "studio_software",
    price: 8990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 100, events_per_month: 6, watermark_photos: 25000 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true, whatsapp: true, automation: true },
    metadata: { popular: true, yearly_savings: 1798, annual_shield: true, annual_shield_badge: "Annual Shield (13 Months)", bonus_months: "2 Free + 1 Bonus Month" },
    is_active: true,
  },
  {
    id: "elite-yearly-plan",
    plan_code: "business_elite_yearly",
    name: "Business Elite (Annual Shield)",
    description: "For established high-volume studios. Includes Annual Shield: 13 months total with zero monsoon downtime.",
    plan_type: "studio_software",
    price: 14990,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 7,
    limits: { storage_gb: 200, events_per_month: 15, watermark_photos: -1 },
    features: { crm: true, events: true, gallery: true, dashboard: true, watermark: true, whatsapp: true, automation: true, ai_features: true, reports: true },
    metadata: { popular: false, yearly_savings: 2998, annual_shield: true, annual_shield_badge: "Annual Shield (13 Months)", bonus_months: "2 Free + 1 Bonus Month" },
    is_active: true,
  },

  // Studio Vault: Monsoon Retention & Pause Architecture
  {
    id: "studio-vault-monthly-plan",
    plan_code: "studio_vault_monthly",
    name: "Studio Vault (Monthly Pause)",
    description: "Off-season pause for wedding photographers (June to Sept). Keep existing galleries 100% live with AI search & downloads; new event creation paused.",
    plan_type: "studio_software",
    price: 199,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 0,
    limits: { storage_gb: 0, events_per_month: 0, upload_paused: true, galleries_active: true },
    features: { dashboard: true, gallery: true, qr_sharing: true, client_selfie_upload: true, face_matching: true, matched_photo_delivery: true, crm: true, projects: true, chat: true, finance: true, events: false },
    metadata: { popular: false, is_vault: true, badge: "Monsoon Retention", target: "No active shoots in monsoon; keep client galleries live" },
    is_active: true,
  },
  {
    id: "studio-vault-seasonal-plan",
    plan_code: "studio_vault_seasonal",
    name: "Studio Vault (4-Month Monsoon Shield)",
    description: "₹599 flat for 4 full off-season months (June–September). 100% active client galleries, zero data pruning, 1-click reactivation in October.",
    plan_type: "studio_software",
    price: 599,
    currency: "INR",
    billing_cycle: "yearly",
    trial_days: 0,
    limits: { storage_gb: 0, events_per_month: 0, upload_paused: true, galleries_active: true, seasonal_months: 4 },
    features: { dashboard: true, gallery: true, qr_sharing: true, client_selfie_upload: true, face_matching: true, matched_photo_delivery: true, crm: true, projects: true, chat: true, finance: true, events: false },
    metadata: { popular: false, is_vault: true, badge: "Best Off-Season Value", savings_percent: 25, target: "4 Months complete off-season cover (June to September)" },
    is_active: true,
  },

  // Modular High-Margin Add-Ons (Peak Season Expansion)
  {
    id: "addon-extra-event-pass",
    plan_code: "addon_extra_event_pass",
    name: "Extra Event Pass",
    description: "Expand dynamically during peak wedding months. Includes 1 additional event up to 2,500 photos and standard R2 allocation.",
    plan_type: "addon",
    price: 149,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 0,
    limits: { events_per_month: 1, watermark_photos: 2500 },
    features: { events: true },
    metadata: { is_addon: true, unit: "per event", category: "event_expansion" },
    is_active: true,
  },
  {
    id: "addon-storage-50gb",
    plan_code: "addon_storage_50gb",
    name: "Cloud Storage Booster (+50 GB)",
    description: "Expand Cloudflare R2 storage allocation by 50 GB during high-demand shoot months.",
    plan_type: "addon",
    price: 99,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 0,
    limits: { storage_gb: 50 },
    features: { gallery: true },
    metadata: { is_addon: true, unit: "per month", category: "storage" },
    is_active: true,
  },
  {
    id: "addon-storage-100gb",
    plan_code: "addon_storage_100gb",
    name: "Cloud Storage Booster (+100 GB)",
    description: "Expand Cloudflare R2 storage allocation by 100 GB for high-volume studio shoots.",
    plan_type: "addon",
    price: 179,
    currency: "INR",
    billing_cycle: "monthly",
    trial_days: 0,
    limits: { storage_gb: 100 },
    features: { gallery: true },
    metadata: { is_addon: true, unit: "per month", category: "storage", popular: true },
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
      const dbPlans = data.map((plan) => normalizePlan(plan as Record<string, unknown>));
      const existingCodes = new Set(dbPlans.map((p) => p.plan_code.toLowerCase().trim()));

      // Merge any catalog fallback plans that are not yet in the remote DB (e.g. Studio Vault, Modular Add-Ons)
      const missingFallbacks = FALLBACK_PLANS.filter(
        (fallbackPlan) => !existingCodes.has(fallbackPlan.plan_code.toLowerCase().trim()),
      );

      // Enrich yearly plans with Annual Shield badge if not set
      const enrichedDbPlans = dbPlans.map((p) => {
        if (p.billing_cycle === "yearly" && !p.metadata?.annual_shield) {
          return {
            ...p,
            name: p.name.includes("Annual Shield") ? p.name : `${p.name} (Annual Shield)`,
            metadata: {
              ...p.metadata,
              annual_shield: true,
              annual_shield_badge: "Annual Shield (13 Months)",
              bonus_months: "2 Free + 1 Bonus Month",
            },
          };
        }
        return p;
      });

      return [...enrichedDbPlans, ...missingFallbacks];
    }
  } catch (err) {
    console.warn("[getSubscriptionPlans] Failed to fetch from DB, using fallback:", err);
  }

  return FALLBACK_PLANS;
}
