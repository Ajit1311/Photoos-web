"use client";

import {
  useState,
} from "react";

import {
  Loader2,
  X,
} from "lucide-react";

import type {
  SubscriptionPlan,
} from "@/types/subscription/plan";


type SubscriptionChangeDialogProps = {
  open: boolean;

  currentPlanName: string | null;

  targetPlan: SubscriptionPlan | null;

  onClose: () => void;

  onConfirm: (
    plan: SubscriptionPlan,
  ) => Promise<void>;
};


function formatCurrency(
  amount: number,
  currency: string,
): string {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    },
  ).format(
    amount,
  );

}


export function SubscriptionChangeDialog({
  open,
  currentPlanName,
  targetPlan,
  onClose,
  onConfirm,
}: SubscriptionChangeDialogProps) {

  const [
    submitting,
    setSubmitting,
  ] =
    useState(
      false,
    );


  if (
    !open ||
    !targetPlan
  ) {

    return null;

  }


  async function handleConfirm() {

    try {

      setSubmitting(
        true,
      );


      const selectedPlan =
        targetPlan;

      if (
        !selectedPlan
      ) {
        return;
      }

      await onConfirm(
        selectedPlan,
      );

    } finally {

      setSubmitting(
        false,
      );

    }

  }


  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">

      <div className="relative w-full max-w-md rounded-2xl border bg-card p-6 shadow-2xl">

        <button
          type="button"
          onClick={onClose}
          disabled={submitting}
          className="absolute right-4 top-4 rounded-md p-1 text-muted-foreground hover:bg-muted disabled:opacity-50"
          aria-label="Close"
        >

          <X className="h-5 w-5" />

        </button>


        <div className="pr-8">

          <h2 className="text-xl font-semibold">

            Change subscription plan

          </h2>


          <p className="mt-3 text-sm leading-6 text-muted-foreground">

            You are changing from{" "}

            <span className="font-medium text-foreground">

              {currentPlanName ?? "your current plan"}

            </span>

            {" "}to{" "}

            <span className="font-medium text-foreground">

              {targetPlan.name}

            </span>.

          </p>


          <div className="mt-5 rounded-xl border bg-muted/30 p-4">

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="font-medium">

                  {targetPlan.name}

                </p>

                {
                  targetPlan.description
                    ? (
                        <p className="mt-1 text-sm text-muted-foreground">

                          {targetPlan.description}

                        </p>
                      )
                    : null
                }

              </div>


              <p className="whitespace-nowrap text-lg font-semibold">

                {
                  formatCurrency(
                    targetPlan.price,
                    targetPlan.currency,
                  )
                }

              </p>

            </div>


            <p className="mt-2 text-xs text-muted-foreground">

              {
                targetPlan.billing_cycle
                  ? `${targetPlan.billing_cycle} billing`
                  : "Subscription billing"
              }

            </p>

          </div>


          <p className="mt-5 text-sm leading-6 text-muted-foreground">

            You will continue to secure payment checkout to complete this
            subscription change. Your plan will be updated after successful
            payment verification.

          </p>


          <div className="mt-6 flex gap-3">

            <button
              type="button"
              onClick={handleConfirm}
              disabled={submitting}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >

              {
                submitting
                  ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Processing...

                      </>
                    )
                  : (
                      "Continue"
                    )
              }

            </button>


            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-50"
            >

              Cancel

            </button>

          </div>

        </div>

      </div>

    </div>
  );

}
