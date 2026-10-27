export type SubscriptionAccessStatus =
  | "trial"
  | "active"
  | "expired"
  | "cancelled"
  | "past_due"
  | "no_subscription";

export type SubscriptionPlanDetails = {
  subscription_id: string | null;

  plan_id: string | null;

  plan: string | null;

  plan_name: string | null;

  plan_type: string | null;

  price: number | null;

  currency: string | null;

  billing_cycle: string | null;

  status: string | null;

  access_status: string | null;

  has_access: boolean;

  is_trial: boolean;

  trial_days: number | null;

  trial_start_at: string | null;

  trial_end_at: string | null;

  subscription_start_at: string | null;

  subscription_end_at: string | null;

  effective_access_end_at: string | null;

  expired_at: string | null;

  next_billing_at: string | null;

  days_remaining: number | null;

  is_expiring_soon: boolean;

  features: Record<string, unknown>;

  limits: Record<string, unknown>;
};


export type SubscriptionAddonDetails = {
  subscription_id: string | null;

  plan_id: string | null;

  plan: string | null;

  plan_name: string | null;

  plan_type: string | null;

  price: number | null;

  currency: string | null;

  billing_cycle: string | null;

  status: string | null;

  access_status: string | null;

  is_active: boolean;

  is_renewable: boolean;

  has_access: boolean;

  subscription_start_at: string | null;

  subscription_end_at: string | null;

  effective_access_end_at: string | null;

  expired_at: string | null;

  next_billing_at: string | null;

  features: Record<string, unknown>;

  limits: Record<string, unknown>;
};


export type SubscriptionAccessDetails = {
  subscription_id: string | null;

  plan: string | null;

  plan_name: string | null;

  price: number | null;

  currency: string | null;

  billing_cycle: string | null;

  status: SubscriptionAccessStatus;

  access_status: SubscriptionAccessStatus;

  has_access: boolean;

  is_trial: boolean;

  trial_days: number | null;

  trial_start_at: string | null;

  trial_end_at: string | null;

  subscription_start_at: string | null;

  subscription_end_at: string | null;

  effective_access_end_at: string | null;

  next_billing_at: string | null;

  days_remaining: number | null;

  is_expiring_soon: boolean;

  show_upgrade_prompt: boolean;

  limits: Record<string, unknown>;

  features: Record<string, unknown>;

  main_plan: SubscriptionPlanDetails | null;

  active_addons: SubscriptionAddonDetails[];
};


export type MarketplaceVerifiedAddonDetails = SubscriptionAddonDetails;
