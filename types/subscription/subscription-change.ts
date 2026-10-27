export type SubscriptionChangeType =
  | "upgrade"
  | "downgrade"
  | "switch";

export type SubscriptionChangeStatus =
  | "pending"
  | "applied"
  | "failed";

export type ChangeSubscriptionPlanInput = {
  studioId: string;

  targetPlanCode: string;
};

export type SubscriptionChangeResult = {
  success: boolean;

  status: SubscriptionChangeStatus;

  change_type:
    SubscriptionChangeType;

  previous_plan_code:
    string | null;

  target_plan_code:
    string;

  subscription_id:
    string | null;

  message:
    string | null;
};
