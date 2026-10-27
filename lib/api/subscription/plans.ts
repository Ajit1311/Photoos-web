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


export async function getSubscriptionPlans():
  Promise<
    SubscriptionPlan[]
  > {
  const {
    data,
    error,
  } =
    await supabase
      .from(
        "subscription_plans",
      )
      .select(
        `
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
        `,
      )
      .eq(
        "is_active",
        true,
      );

  if (
    error
  ) {
    console.error(
      "[getSubscriptionPlans] Supabase error:",
      {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      },
    );

    throw new Error(
      [
        error.message,
        error.details,
        error.hint,
        error.code
          ? `Code: ${error.code}`
          : null,
      ]
        .filter(Boolean)
        .join(" | "),
    );
  }

  return (
    data ??
    []
  ).map(
    (
      plan,
    ) =>
      normalizePlan(
        plan as Record<
          string,
          unknown
        >,
      ),
  );
}
