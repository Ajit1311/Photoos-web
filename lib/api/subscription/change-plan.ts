import {
  supabase,
} from "@/lib/supabase/client";

import type {
  ChangeSubscriptionPlanInput,
  SubscriptionChangeResult,
} from "@/types/subscription/subscription-change";

import {
  getSubscriptionPlans,
} from "@/lib/api/subscription/plans";


type UpgradeSubscriptionResponse = {
  success: boolean;

  message: string;

  data?: {
    id: string;

    studio_id: string;

    plan_id: string;

    status: string;

    subscription_start_at: string | null;

    subscription_end_at: string | null;

    updated_at: string;
  };
};


export type ChangeSubscriptionPlanRequest = {
  subscriptionId: string;

  targetPlanCode: string;

  currentPlanCode:
    string | null;
};


export async function changeSubscriptionPlan(
  input:
    ChangeSubscriptionPlanRequest,
): Promise<
  SubscriptionChangeResult
> {

  const {
    data: {
      session,
    },
    error: sessionError,
  } =
    await supabase.auth.getSession();


  if (
    sessionError
  ) {

    throw new Error(
      sessionError.message,
    );

  }


  if (
    !session
  ) {

    throw new Error(
      "You must be signed in to upgrade your subscription.",
    );

  }


  /*
   * Resolve plan_code to the actual subscription plan UUID.
   *
   * The Edge Function expects:
   *
   * subscription_id
   * new_plan_id
   */

  const plans =
    await getSubscriptionPlans();


  const targetPlan =
    plans.find(
      (
        plan,
      ) =>
        plan.plan_code ===
        input.targetPlanCode,
    );


  if (
    !targetPlan
  ) {

    throw new Error(
      "Selected subscription plan was not found.",
    );

  }


  const {
    data,
    error,
  } =
    await supabase.functions.invoke<
      UpgradeSubscriptionResponse
    >(
      "upgrade-subscription",
      {
        body: {
          subscription_id:
            input.subscriptionId,

          new_plan_id:
            targetPlan.id,
        },

        headers: {
          Authorization:
            `Bearer ${session.access_token}`,
        },
      },
    );


  if (
    error
  ) {

    throw new Error(
      error.message,
    );

  }


  if (
    !data
  ) {

    throw new Error(
      "Invalid subscription upgrade response.",
    );

  }


  if (
    !data.success
  ) {

    throw new Error(
      data.message ||
      "Subscription upgrade failed.",
    );

  }


  return {
    success:
      true,

    status:
      "applied",

    change_type:
      "upgrade",

    previous_plan_code:
      input.currentPlanCode,

    target_plan_code:
      input.targetPlanCode,

    subscription_id:
      data.data?.id ??
      input.subscriptionId,

    message:
      data.message ??
      null,
  };

}
