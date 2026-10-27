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
  | "watermark";


export type PlanFeatures =
  Record<
    string,
    unknown
  >;


export type PlanLimits =
  Record<
    string,
    unknown
  >;


export const PLAN_FEATURE_LABELS:
  Record<
    PlanFeatureKey,
    string
  > = {
    dashboard:
      "Dashboard",

    crm:
      "Client CRM",

    projects:
      "Projects",

    events:
      "Events",

    gallery:
      "Gallery",

    chat:
      "Chat",

    reports:
      "Reports",

    whatsapp:
      "WhatsApp Integration",

    analytics:
      "Analytics",

    automation:
      "Automation",

    ai_features:
      "Advanced AI Features",

    priority_support:
      "Priority Support",

    qr_sharing:
      "QR Code Sharing",

    client_selfie_upload:
      "Client Selfie Upload",

    face_matching:
      "AI Face Matching",

    matched_photo_delivery:
      "Matched Photo Delivery",

    watermark:
      "Watermark",
  };


export function hasPlanFeature(
  features: PlanFeatures | null | undefined,
  feature: PlanFeatureKey,
): boolean {
  if (
    !features
  ) {
    return false;
  }

  return (
    features[
      feature
    ] === true
    ||
    features[
      feature
    ] === "true"
    ||
    features[
      feature
    ] === 1
  );
}


export function getPlanLimit(
  limits: PlanLimits | null | undefined,
  key: string,
): number | null {
  if (
    !limits
  ) {
    return null;
  }

  const value =
    limits[
      key
    ];

  if (
    typeof value ===
    "number"
  ) {
    return value;
  }

  if (
    typeof value ===
    "string"
  ) {
    const parsed =
      Number(
        value,
      );

    return Number.isNaN(
      parsed,
    )
      ? null
      : parsed;
  }

  return null;
}


export function isUnlimitedLimit(
  value: number | null,
): boolean {
  return value === -1;
}


export function formatPlanLimit(
  value: number | null,
): string {
  if (
    value === null
  ) {
    return "Not available";
  }

  if (
    isUnlimitedLimit(
      value,
    )
  ) {
    return "Unlimited";
  }

  return value.toLocaleString(
    "en-IN",
  );
}


export function canAccessPlanFeature(
  hasAccess: boolean,
  features: PlanFeatures | null | undefined,
  feature: PlanFeatureKey,
): boolean {
  if (
    !hasAccess
  ) {
    return false;
  }

  return hasPlanFeature(
    features,
    feature,
  );
}
