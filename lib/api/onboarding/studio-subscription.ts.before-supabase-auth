import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import { getBootstrap } from "@/lib/api/bootstrap";
import { supabase } from "@/lib/supabase/client";

export interface BootstrapStudioResult {
  organization_id: string;
  studio_id: string;
  membership_id: string;
  created: boolean;
}

export interface SubscriptionResult {
  id: string;
  studio_id: string;
  plan_id: string;
  status: string;
  [key: string]: unknown;
}

export interface PaymentResult {
  id: string;
  [key: string]: unknown;
}

async function requireFirebaseToken(): Promise<string> {
  const token = await getFirebaseIdToken();

  if (!token) {
    throw new Error(
      "You must be signed in to continue.",
    );
  }

  return token;
}

export async function bootstrapOnboardingStudio(): Promise<BootstrapStudioResult> {
  const bootstrap = await getBootstrap();

  const membership =
    bootstrap.workspace?.membership;

  if (
    !membership?.studioId ||
    !membership?.id
  ) {
    throw new Error(
      "Studio workspace could not be created.",
    );
  }

  return {
    organization_id:
      bootstrap.workspace.organization?.id ?? "",
    studio_id:
      membership.studioId,
    membership_id:
      membership.id,
    created:
      bootstrap.bootstrapRequired === true,
  };
}

export async function createOnboardingSubscription(
  studioId: string,
  planId: string,
): Promise<SubscriptionResult> {
  const token =
    await requireFirebaseToken();

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "create-subscription",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        body: {
          studio_id: studioId,
          plan_id: planId,
        },
      },
    );

  if (error) {
      console.error(
        "CREATE SUBSCRIPTION PAYMENT EDGE ERROR:",
        error,
      );
      console.error(
        "CREATE SUBSCRIPTION PAYMENT RESPONSE:",
        data,
      );
      throw error;
  }

    console.log(
      "CREATE SUBSCRIPTION PAYMENT RESPONSE:",
      data,
    );


  if (
    !data?.success ||
    !data?.subscription
  ) {
    throw new Error(
      data?.error?.message ??
        data?.error ??
        "Subscription could not be created.",
    );
  }

  return data.subscription as SubscriptionResult;
}

export async function createOnboardingSubscriptionPayment(
  subscriptionId: string,
  amount: number,
): Promise<PaymentResult> {
  const token =
    await requireFirebaseToken();

  const {
    data,
    error,
  } =
    await supabase.functions.invoke(
      "create-subscription-payment",
      {
        method: "POST",
        headers: {
          Authorization:
            `Bearer ${token}`,
        },
        body: {
          subscription_id:
            subscriptionId,
          amount,
        },
      },
    );

    if (error) {
      console.error(
        "CREATE SUBSCRIPTION PAYMENT EDGE ERROR:",
        error,
      );
      console.error(
        "CREATE SUBSCRIPTION PAYMENT RESPONSE:",
        data,
      );
      throw error;
    }

    console.log(
      "CREATE SUBSCRIPTION PAYMENT RESPONSE:",
      data,
    );

    const payment = data?.data?.payment;

    if (
      !data?.success ||
      !payment
    ) {
      throw new Error(
        data?.error?.message ??
          data?.error ??
          "Subscription payment could not be created.",
      );
    }

    return payment as PaymentResult;
}
