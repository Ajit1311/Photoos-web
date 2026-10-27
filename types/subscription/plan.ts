export type SubscriptionPlan = {
  id: string;

  plan_code: string;

  name: string;

  description: string | null;

  plan_type: string;

  price: number;

  currency: string;

  billing_cycle: string;

  trial_days: number;

  limits: Record<string, unknown>;

  features: Record<string, unknown>;

  metadata: Record<string, unknown>;

  is_active: boolean;
};


export type SubscriptionPlanLimit = {
  label: string;

  value: string | number | boolean;
};
