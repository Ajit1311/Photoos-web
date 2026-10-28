export type PlanFeatureKey =
  | "dashboard"
  | "crm"
  | "projects"
  | "events"
  | "gallery"
  | "chat"
  | "reports"
  | "whatsapp"
  | "analytics"
  | "automation"
  | "ai_features"
  | "priority_support"
  | "qr_sharing"
  | "client_selfie_upload"
  | "face_matching"
  | "matched_photo_delivery"
  | "watermark"
  | "marketing"
  | "finance"
  | "team"
  | "marketplace";

export type PlanFeatures = Record<string, unknown>;
export type PlanLimits = Record<string, unknown>;

export const PLAN_FEATURE_LABELS: Record<PlanFeatureKey, string> = {
  dashboard: "Dashboard",
  crm: "Client CRM",
  projects: "Projects",
  events: "Events",
  gallery: "Gallery",
  chat: "Chat",
  reports: "Reports",
  whatsapp: "WhatsApp Integration",
  analytics: "Analytics",
  automation: "Automation",
  ai_features: "Advanced AI Features",
  priority_support: "Priority Support",
  qr_sharing: "QR Code Sharing",
  client_selfie_upload: "Client Selfie Upload",
  face_matching: "AI Face Matching",
  matched_photo_delivery: "Matched Photo Delivery",
  watermark: "Watermark",
  marketing: "Marketing",
  finance: "Financials & Payments",
  team: "Team Collaboration",
  marketplace: "Studio Marketplace",
};

export type PlanPresetConfig = {
  plan_code: string;
  name: string;
  price: number;
  billing_cycle: "monthly" | "yearly" | "seasonal_4_months" | "one_time";
  features: Record<PlanFeatureKey, boolean>;
  limits: {
    storage_gb: number;
    events_per_month: number;
    users: number;
    watermark_photos: number;
    photos_per_event?: number;
    upload_paused?: boolean;
    galleries_active?: boolean;
  };
  metadata?: Record<string, unknown>;
};

export const PLAN_CONFIGS: Record<string, PlanPresetConfig> = {
  // Free 7-Day Trial (Limited access & usage)
  photoos_free_trial_7_day: {
    plan_code: "photoos_free_trial_7_day",
    name: "7-Day Free Trial",
    price: 0,
    billing_cycle: "monthly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      finance: true,
      watermark: false,
      reports: false,
      whatsapp: false,
      analytics: false,
      automation: false,
      ai_features: false,
      priority_support: false,
      marketing: false,
      team: false,
      marketplace: false,
    },
    limits: {
      storage_gb: 5,
      events_per_month: 1,
      users: 1,
      watermark_photos: 0,
      photos_per_event: 500,
    },
    metadata: {
      is_trial: true,
      trial_days: 7,
    },
  },

  // Business Starter Monthly (₹499/mo)
  business_starter_monthly: {
    plan_code: "business_starter_monthly",
    name: "Business Starter",
    price: 499,
    billing_cycle: "monthly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      reports: true,
      finance: true,
      marketing: true,
      whatsapp: false,
      analytics: false,
      automation: false,
      ai_features: false,
      priority_support: false,
      team: false,
      marketplace: false,
    },
    limits: {
      storage_gb: 50,
      events_per_month: 2,
      users: 3,
      watermark_photos: 10000,
    },
  },

  // Business Starter Yearly (Annual Shield - ₹4,990/yr)
  business_starter_yearly: {
    plan_code: "business_starter_yearly",
    name: "Business Starter (Annual Shield)",
    price: 4990,
    billing_cycle: "yearly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      reports: true,
      finance: true,
      marketing: true,
      whatsapp: false,
      analytics: false,
      automation: false,
      ai_features: false,
      priority_support: false,
      team: false,
      marketplace: false,
    },
    limits: {
      storage_gb: 50,
      events_per_month: 2,
      users: 3,
      watermark_photos: 10000,
    },
    metadata: {
      annual_shield: true,
      annual_shield_badge: "Annual Shield (13 Months)",
      bonus_description: "2 Months Free + 1 Extra Bonus Month (13 Months Total)",
      monsoon_covered: true,
    },
  },

  // Business Booster / Pro Monthly (₹899/mo)
  business_booster_monthly: {
    plan_code: "business_booster_monthly",
    name: "Business Booster (Pro)",
    price: 899,
    billing_cycle: "monthly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      reports: true,
      finance: true,
      marketing: true,
      whatsapp: true,
      analytics: true,
      automation: true,
      ai_features: true,
      team: true,
      marketplace: true,
      priority_support: false,
    },
    limits: {
      storage_gb: 100,
      events_per_month: 6,
      users: 10,
      watermark_photos: 25000,
    },
  },

  // Business Booster Yearly (Annual Shield - ₹8,990/yr)
  business_booster_yearly: {
    plan_code: "business_booster_yearly",
    name: "Business Booster (Annual Shield)",
    price: 8990,
    billing_cycle: "yearly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      reports: true,
      finance: true,
      marketing: true,
      whatsapp: true,
      analytics: true,
      automation: true,
      ai_features: true,
      team: true,
      marketplace: true,
      priority_support: false,
    },
    limits: {
      storage_gb: 100,
      events_per_month: 6,
      users: 10,
      watermark_photos: 25000,
    },
    metadata: {
      annual_shield: true,
      annual_shield_badge: "Annual Shield (13 Months)",
      bonus_description: "2 Months Free + 1 Extra Bonus Month (13 Months Total)",
      monsoon_covered: true,
    },
  },

  // Business Elite Monthly (₹1,499/mo)
  business_elite_monthly: {
    plan_code: "business_elite_monthly",
    name: "Business Elite",
    price: 1499,
    billing_cycle: "monthly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      reports: true,
      whatsapp: true,
      analytics: true,
      automation: true,
      ai_features: true,
      priority_support: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      marketing: true,
      finance: true,
      team: true,
      marketplace: true,
    },
    limits: {
      storage_gb: 200,
      events_per_month: 15,
      users: 25,
      watermark_photos: -1,
    },
  },

  // Business Elite Yearly (Annual Shield - ₹14,990/yr)
  business_elite_yearly: {
    plan_code: "business_elite_yearly",
    name: "Business Elite (Annual Shield)",
    price: 14990,
    billing_cycle: "yearly",
    features: {
      dashboard: true,
      crm: true,
      projects: true,
      events: true,
      gallery: true,
      chat: true,
      reports: true,
      whatsapp: true,
      analytics: true,
      automation: true,
      ai_features: true,
      priority_support: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      watermark: true,
      marketing: true,
      finance: true,
      team: true,
      marketplace: true,
    },
    limits: {
      storage_gb: 200,
      events_per_month: 15,
      users: 25,
      watermark_photos: -1,
    },
    metadata: {
      annual_shield: true,
      annual_shield_badge: "Annual Shield (13 Months)",
      bonus_description: "2 Months Free + 1 Extra Bonus Month (13 Months Total)",
      monsoon_covered: true,
    },
  },

  // Studio Vault Monthly (₹199/mo - Monsoon Off-Season Pause)
  studio_vault_monthly: {
    plan_code: "studio_vault_monthly",
    name: "Studio Vault (Monthly Pause)",
    price: 199,
    billing_cycle: "monthly",
    features: {
      dashboard: true,
      gallery: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      crm: true,
      projects: true,
      chat: true,
      finance: true,
      events: false,
      reports: false,
      whatsapp: false,
      analytics: false,
      automation: false,
      ai_features: false,
      priority_support: false,
      watermark: false,
      marketing: false,
      team: false,
      marketplace: false,
    },
    limits: {
      storage_gb: 0,
      events_per_month: 0,
      users: 1,
      watermark_photos: 0,
      upload_paused: true,
      galleries_active: true,
    },
    metadata: {
      is_vault: true,
      badge: "Monsoon Retention",
      target: "Photographers with no active shoots in monsoon who must keep existing galleries live",
      reactivation_eligible: true,
    },
  },

  // Studio Vault Seasonal (₹599 flat for 4 Off-Season Months)
  studio_vault_seasonal: {
    plan_code: "studio_vault_seasonal",
    name: "Studio Vault (4-Month Monsoon Shield)",
    price: 599,
    billing_cycle: "seasonal_4_months",
    features: {
      dashboard: true,
      gallery: true,
      qr_sharing: true,
      client_selfie_upload: true,
      face_matching: true,
      matched_photo_delivery: true,
      crm: true,
      projects: true,
      chat: true,
      finance: true,
      events: false,
      reports: false,
      whatsapp: false,
      analytics: false,
      automation: false,
      ai_features: false,
      priority_support: false,
      watermark: false,
      marketing: false,
      team: false,
      marketplace: false,
    },
    limits: {
      storage_gb: 0,
      events_per_month: 0,
      users: 1,
      watermark_photos: 0,
      upload_paused: true,
      galleries_active: true,
    },
    metadata: {
      is_vault: true,
      badge: "Best Off-Season Value",
      savings_percent: 25,
      target: "June to September complete off-season cover",
      reactivation_eligible: true,
    },
  },
};

export function getPlanConfig(planCode: string | null | undefined): PlanPresetConfig {
  if (!planCode) {
    return PLAN_CONFIGS.photoos_free_trial_7_day;
  }
  const normalized = planCode.toLowerCase().trim();
  if (PLAN_CONFIGS[normalized]) {
    return PLAN_CONFIGS[normalized];
  }
  if (normalized.includes("vault")) {
    return PLAN_CONFIGS.studio_vault_monthly;
  }
  if (normalized.includes("elite")) {
    return normalized.includes("year")
      ? PLAN_CONFIGS.business_elite_yearly
      : PLAN_CONFIGS.business_elite_monthly;
  }
  if (normalized.includes("booster") || normalized.includes("pro")) {
    return normalized.includes("year")
      ? PLAN_CONFIGS.business_booster_yearly
      : PLAN_CONFIGS.business_booster_monthly;
  }
  if (normalized.includes("starter")) {
    return normalized.includes("year")
      ? PLAN_CONFIGS.business_starter_yearly
      : PLAN_CONFIGS.business_starter_monthly;
  }
  return PLAN_CONFIGS.photoos_free_trial_7_day;
}

export function isVaultPlan(planCode: string | null | undefined): boolean {
  if (!planCode) return false;
  return planCode.toLowerCase().includes("vault");
}

export function isUploadPaused(planCode: string | null | undefined): boolean {
  if (!planCode) return false;
  const config = getPlanConfig(planCode);
  return config.limits.upload_paused === true || config.limits.events_per_month === 0;
}

export function hasPlanFeature(
  features: PlanFeatures | null | undefined,
  feature: PlanFeatureKey,
): boolean {
  if (!features) {
    return false;
  }

  return (
    features[feature] === true ||
    features[feature] === "true" ||
    features[feature] === 1
  );
}

export function getPlanLimit(
  limits: PlanLimits | null | undefined,
  key: string,
): number | null {
  if (!limits) {
    return null;
  }

  const value = limits[key];

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isNaN(parsed) ? null : parsed;
  }

  return null;
}

export function isUnlimitedLimit(value: number | null): boolean {
  return value === -1;
}

export function formatPlanLimit(value: number | null): string {
  if (value === null) {
    return "Not available";
  }

  if (isUnlimitedLimit(value)) {
    return "Unlimited";
  }

  return value.toLocaleString("en-IN");
}

export function canAccessPlanFeature(
  hasAccess: boolean,
  features: PlanFeatures | null | undefined,
  feature: PlanFeatureKey,
): boolean {
  if (!hasAccess) {
    return false;
  }

  // If features are empty or not strictly mapped, default to granting standard access
  if (!features || Object.keys(features).length === 0) {
    return true;
  }

  return hasPlanFeature(features, feature);
}
