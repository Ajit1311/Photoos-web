"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";

import {
  getSubscriptionPlans,
} from "@/lib/api/subscription/plans";

import type {
  SubscriptionPlan,
} from "@/types/subscription/plan";


function formatPrice(
  price: number,
  currency: string,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(price);
}


export default function PricingPage() {

  const [
    plans,
    setPlans,
  ] =
    useState<SubscriptionPlan[]>([]);

  const [
    loading,
    setLoading,
  ] =
    useState(true);

  const [
    error,
    setError,
  ] =
    useState<string | null>(null);


  useEffect(() => {

    async function loadPlans() {

      try {

        const result =
          await getSubscriptionPlans();

        setPlans(
          result.filter(
            (plan) =>
              plan.plan_type !==
              "marketplace",
          ),
        );

      } catch (err) {

        console.error(
          "PRICING LOAD ERROR:",
          err,
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load pricing.",
        );

      } finally {

        setLoading(false);

      }

    }

    loadPlans();

  }, []);


  return (
    <main className="min-h-screen bg-[#F6F8FB] px-6 py-16">

      <div className="mx-auto max-w-6xl">

        <div className="mx-auto max-w-2xl text-center">

          <p className="text-sm font-semibold text-[#0a3f61]">
            PhotoOS
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Choose your PhotoOS plan
          </h1>

          <p className="mt-4 text-muted-foreground">
            Select a plan to create your workspace and continue
            with account setup.
          </p>

        </div>


        {loading && (
          <div className="mt-16 text-center text-sm text-muted-foreground">
            Loading plans...
          </div>
        )}


        {error && (
          <div className="mx-auto mt-16 max-w-xl rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-700">
            {error}
          </div>
        )}


        {!loading &&
          !error &&
          plans.length === 0 && (
            <div className="mt-16 text-center text-sm text-muted-foreground">
              No active subscription plans available.
            </div>
          )}


        {!loading &&
          !error &&
          plans.filter((plan) => plan.price > 0).length > 0 && (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {plans
                .filter((plan) => plan.price > 0)
                .map(
                  (plan) => (

                    <div
                      key={plan.id}
                      className="flex flex-col rounded-2xl border bg-white p-6 shadow-sm"
                    >

                      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                        {plan.plan_code}
                      </p>

                      <h2 className="mt-3 text-2xl font-bold">
                        {plan.name}
                      </h2>

                      {plan.description && (
                        <p className="mt-3 min-h-12 text-sm leading-6 text-muted-foreground">
                          {plan.description}
                        </p>
                      )}

                      <div className="mt-6">

                        <span className="text-3xl font-bold">
                          {formatPrice(
                            plan.price,
                            plan.currency,
                          )}
                        </span>

                        <span className="ml-2 text-sm text-muted-foreground">
                          / {plan.billing_cycle}
                        </span>

                      </div>

                      <div className="mt-auto pt-8">

                        <Link
                          href={`/onboarding/studio?planId=${encodeURIComponent(
                            plan.id,
                          )}&planCode=${encodeURIComponent(
                            plan.plan_code,
                          )}&billingCycle=${encodeURIComponent(
                            plan.billing_cycle,
                          )}`}
                          className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3f61] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                        >
                          Choose Plan
                        </Link>

                      </div>

                    </div>

                  ),
                )}

            </div>
          )}

        {plans.find(
          (plan) =>
            plan.price === 0 &&
            plan.trial_days > 0,
        ) && (
          <div className="mt-10">

            {plans
              .filter(
                (plan) =>
                  plan.price === 0 &&
                  plan.trial_days > 0,
              )
              .map(
                (trialPlan) => (

                  <div
                    key={trialPlan.id}
                    className="mx-auto max-w-md rounded-2xl border border-[#0a3f61]/20 bg-white p-7 text-center shadow-sm"
                  >

                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#0a3f61]">
                      FREE TRIAL
                    </p>

                    <h2 className="mt-3 text-2xl font-bold">
                      {trialPlan.name}
                    </h2>

                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      Try PhotoOS studio software free for{" "}
                      {trialPlan.trial_days} days.
                    </p>

                    <div className="mt-5">

                      <span className="text-3xl font-bold">
                        {formatPrice(
                          trialPlan.price,
                          trialPlan.currency,
                        )}
                      </span>

                    </div>

                    <p className="mt-2 text-sm font-medium text-[#0a3f61]">
                      {trialPlan.trial_days} days • No payment required
                    </p>

                    <div className="mt-6">

                      <Link
                        href={`/onboarding/studio?planId=${encodeURIComponent(
                          trialPlan.id,
                        )}&planCode=${encodeURIComponent(
                          trialPlan.plan_code,
                        )}&billingCycle=${encodeURIComponent(
                          trialPlan.billing_cycle,
                        )}&mode=trial`}
                        className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3f61] px-4 py-3 text-sm font-semibold text-white hover:opacity-90"
                      >
                        Start Free Trial
                      </Link>

                    </div>

                    <p className="mt-3 text-xs text-muted-foreground">
                      One free trial per studio.
                    </p>

                  </div>

                ),
              )}

          </div>
        )}

        <div className="mt-12 text-center">

          <p className="text-sm text-muted-foreground">
            Already have an account?
          </p>

          <Link
            href="/login"
            className="mt-2 inline-block text-sm font-semibold text-[#0a3f61]"
          >
            Login
          </Link>

        </div>

      </div>

    </main>
  );

}
