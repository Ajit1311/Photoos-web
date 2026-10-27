export type SubscriptionUsageSummary = {
  studio_id: string;

  subscription: {
    id: string;
    status: string;
    plan_id: string;
    plan_code: string;
    plan_name: string;
    billing_cycle: string;
    subscription_start_at: string | null;
    subscription_end_at: string | null;
    trial_start_at: string | null;
    trial_end_at: string | null;
  };

  limits: {
    users: number | null;
    storage_gb: number | null;
    events_per_month: number | null;
  };

  users: {
    used: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    unlimited: boolean;
  };

  events: {
    used_this_month: number;
    limit: number | null;
    remaining: number | null;
    percentage: number;
    unlimited: boolean;
  };

  storage: {
    used_bytes: number;
    limit_bytes: number | null;
    remaining_bytes: number | null;
    limit_gb: number | null;
    percentage: number;
    unlimited: boolean;
  };

  generated_at: string;
};

export type SubscriptionUsageSummaryResponse =
  SubscriptionUsageSummary | null;
