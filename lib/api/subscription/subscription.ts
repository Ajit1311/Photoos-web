import { supabase } from "@/lib/supabase/client";
import { getAccessToken, getSession } from "@/lib/auth/session";
import type { SubscriptionAccessDetails } from "@/types/subscription/subscription";

export async function getSubscriptionAccessDetails(
  studioId: string,
): Promise<SubscriptionAccessDetails | null> {

  // 1. Try Edge Function if available
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const {
        data,
        error,
      } = await supabase.functions.invoke(
        "get-subscription-access-details",
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!error && data?.success && data?.data?.subscription) {
        return data.data.subscription as SubscriptionAccessDetails;
      }
    }
  } catch (fnErr) {
    console.warn("[SUBSCRIPTION ACCESS] Edge Function notice, falling back:", fnErr);
  }

  // 2. Direct database query fallback
  try {
    const { data: sub, error: subErr } = await supabase
      .from("subscriptions")
      .select(`
        id,
        plan_id,
        status,
        trial_start_at,
        trial_end_at,
        subscription_start_at,
        subscription_end_at
      `)
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!subErr && sub) {
      const now = Date.now();
      const trialEnd = sub.trial_end_at ? new Date(sub.trial_end_at).getTime() : 0;
      const subEnd = sub.subscription_end_at ? new Date(sub.subscription_end_at).getTime() : 0;
      const isTrial = sub.status === "trial";
      const hasAccess = (isTrial && trialEnd > now) || (sub.status === "active" && (!subEnd || subEnd > now));

      return {
        subscription_id: sub.id,
        plan_id: sub.plan_id,
        plan: "PhotoOS Studio Plan",
        plan_name: "PhotoOS Studio Plan",
        plan_type: "studio_software",
        price: 0,
        currency: "INR",
        billing_cycle: "monthly",
        status: hasAccess ? sub.status : "expired",
        access_status: hasAccess ? (isTrial ? "trial" : "active") : "expired",
        has_access: hasAccess,
        is_trial: isTrial,
        trial_days: 14,
        trial_start_at: sub.trial_start_at,
        trial_end_at: sub.trial_end_at,
        subscription_start_at: sub.subscription_start_at,
        subscription_end_at: sub.subscription_end_at,
        effective_access_end_at: sub.trial_end_at || sub.subscription_end_at,
        expired_at: !hasAccess ? (sub.trial_end_at || sub.subscription_end_at) : null,
        next_billing_at: null,
        days_remaining: Math.max(0, Math.ceil(((isTrial ? trialEnd : subEnd) - now) / (1000 * 60 * 60 * 24))),
        is_expiring_soon: false,
        features: {},
        limits: {},
      } as unknown as SubscriptionAccessDetails;
    }
  } catch (dbErr) {
    console.warn("[SUBSCRIPTION ACCESS] DB fallback error:", dbErr);
  }

  // 3. Brand new onboarding studio fallback: 14-day Free Trial
  const now = Date.now();
  const trialEnd = now + 14 * 24 * 60 * 60 * 1000;

  return {
    subscription_id: null,
    plan_id: null,
    plan: "Free Trial",
    plan_name: "14-Day Free Trial",
    plan_type: "studio_software",
    price: 0,
    currency: "INR",
    billing_cycle: "monthly",
    status: "trial",
    access_status: "trial",
    has_access: true,
    is_trial: true,
    trial_days: 14,
    trial_start_at: new Date(now).toISOString(),
    trial_end_at: new Date(trialEnd).toISOString(),
    subscription_start_at: null,
    subscription_end_at: null,
    effective_access_end_at: new Date(trialEnd).toISOString(),
    expired_at: null,
    next_billing_at: null,
    days_remaining: 14,
    is_expiring_soon: false,
    features: {},
    limits: {},
  } as unknown as SubscriptionAccessDetails;
}

export type SubscriptionCancellationResult = {
  success: boolean;
  message: string;
  cancellation: {
    success: boolean;
    subscription_id: string;
    studio_id: string;
    previous_status: string;
    status: string;
    access_closed: boolean;
    cancelled_at: string;
    ticket_id: string;
    ticket_status: string;
    refund_status: string;
  };
};

export async function cancelSubscription(
  subscriptionId: string,
): Promise<SubscriptionCancellationResult> {
  const accessToken =
    await getAccessToken();

  if (!accessToken) {
    throw new Error(
      "You must be signed in to cancel your subscription.",
    );
  }

  if (!subscriptionId?.trim()) {
    throw new Error(
      "Subscription ID is required.",
    );
  }

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "cancel-subscription",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${accessToken}`,
        },
        body: {
          subscription_id:
            subscriptionId.trim(),
        },
      },
    );

  if (error) {
    throw error;
  }

  if (
    !data?.success ||
    !data?.data?.cancellation
  ) {
    throw new Error(
      data?.error?.message ??
        data?.error ??
        "Subscription cancellation failed.",
    );
  }

  return data as SubscriptionCancellationResult;
}
