"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  Loader2,
  RefreshCw,
  ShieldCheck,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useSubscriptionAccess,
} from "@/context/SubscriptionAccessContext";

import {
  cancelSubscription,
} from "@/lib/api/subscription/subscription";


function formatCurrency(
  amount: number | null,
  currency: string | null,
): string {

  if (
    amount === null ||
    amount === undefined
  ) {

    return "—";

  }


  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency:
        currency ??
        "INR",
      maximumFractionDigits:
        2,
    },
  ).format(
    amount,
  );

}


function formatDate(
  value: string | null,
): string {

  if (!value) {

    return "—";

  }


  const date =
    new Date(
      value,
    );


  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {

    return "—";

  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",
      month:
        "short",
      year:
        "numeric",
    },
  ).format(
    date,
  );

}


function getStatusLabel(
  status:
    | string
    | null
    | undefined,
): string {

  if (!status) {

    return "No Subscription";

  }


  return status
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );

}


export function SubscriptionBillingCard() {

  const router =
    useRouter();


  const {
    data,
    loading,
    error,
    reload,
  } =
    useSubscriptionAccess();

  const [
    cancelling,
    setCancelling,
  ] =
    useState(false);

  const [
    showCancelConfirmation,
    setShowCancelConfirmation,
  ] =
    useState(false);

  const [
    cancellationMessage,
    setCancellationMessage,
  ] =
    useState<string | null>(null);

  const [
    cancellationError,
    setCancellationError,
  ] =
    useState<string | null>(null);


  function goToUpgrade() {

    router.push(
      "/dashboard/payments",
    );

  }

  async function handleCancelSubscription() {
    const subscriptionId =
      data?.subscription_id ??
      null;

    if (!subscriptionId) {
      setCancellationError(
        "Active subscription could not be identified.",
      );
      return;
    }

    try {
      setCancelling(true);
      setCancellationError(null);
      setCancellationMessage(null);

      const result =
        await cancelSubscription(
          subscriptionId,
        );

      setShowCancelConfirmation(false);

      setCancellationMessage(
        result.message ??
          "Cancellation request submitted. Your dashboard access has been closed.",
      );

      await reload();
    } catch (error) {
      setCancellationError(
        error instanceof Error
          ? error.message
          : "Unable to cancel your subscription.",
      );
    } finally {
      setCancelling(false);
    }
  }


  if (
    loading
  ) {

    return (
      <section className="rounded-2xl border bg-card p-6">

        <div className="flex items-center justify-center py-10">

          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />

        </div>

      </section>
    );

  }


  if (
    error
  ) {

    return (
      <section className="rounded-2xl border bg-card p-6">

        <div className="flex flex-col gap-4">

          <div className="flex items-start gap-3">

            <TriangleAlert className="mt-0.5 h-5 w-5 text-destructive" />

            <div>

              <h2 className="font-semibold">

                Unable to load subscription

              </h2>

              <p className="mt-1 text-sm text-muted-foreground">

                {error.message}

              </p>

            </div>

          </div>


          <button
            type="button"
            onClick={() => {

              void reload();

            }}
            className="inline-flex w-fit items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium"
          >

            <RefreshCw className="h-4 w-4" />

            Retry

          </button>

        </div>

      </section>
    );

  }


  const hasAccess =
    data?.has_access ??
    false;


  const isExpired =
    !hasAccess;


  const isTrial =
    data?.is_trial ??
    false;


  const daysRemaining =
    data?.days_remaining ??
    null;


  const effectiveEndDate =
    data?.effective_access_end_at ??
    data?.subscription_end_at ??
    data?.trial_end_at ??
    null;


  return (
    <section className="rounded-2xl border bg-card p-6">

      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">

        <div>

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10">

              <CreditCard className="h-5 w-5 text-primary" />

            </div>


            <div>

              <h2 className="text-lg font-semibold">

                Current Subscription

              </h2>

              <p className="text-sm text-muted-foreground">

                Your PhotoOS workspace plan and access status.

              </p>

            </div>

          </div>


          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                Current Plan

              </p>

              <p className="mt-1 text-base font-semibold">

                {
                  data?.plan_name ??
                  "No active plan"
                }

              </p>

              {
                data?.price !== null &&
                data?.price !== undefined
                  ? (
                      <p className="mt-1 text-sm text-muted-foreground">

                        {
                          formatCurrency(
                            data.price,
                            data.currency,
                          )
                        }

                        {
                          data?.billing_cycle
                            ? ` / ${data.billing_cycle}`
                            : ""
                        }

                      </p>
                    )
                  : null
              }

            </div>


            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                Access Status

              </p>

              <div className="mt-2 flex items-center gap-2">

                {
                  isExpired
                    ? (
                        <TriangleAlert className="h-4 w-4 text-destructive" />
                      )
                    : isTrial
                      ? (
                          <Clock3 className="h-4 w-4 text-amber-500" />
                        )
                      : (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        )
                }

                <span className="text-base font-semibold">

                  {
                    isExpired
                      ? "Expired"
                      : getStatusLabel(
                          data?.access_status ??
                          data?.status,
                        )
                  }

                </span>

              </div>

            </div>


            <div>

              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">

                {
                  isTrial
                    ? "Trial Ends"
                    : "Access Until"
                }

              </p>

              <div className="mt-2 flex items-center gap-2">

                <CalendarDays className="h-4 w-4 text-muted-foreground" />

                <span className="font-semibold">

                  {
                    formatDate(
                      effectiveEndDate,
                    )
                  }

                </span>

              </div>


              {
                daysRemaining !== null
                  ? (
                      <p className="mt-1 text-sm text-muted-foreground">

                        {
                          daysRemaining <= 0
                            ? "Access has ended"
                            : `${daysRemaining} day${
                                daysRemaining === 1
                                  ? ""
                                  : "s"
                              } remaining`
                        }

                      </p>
                    )
                  : null
              }

            </div>

          </div>

        </div>


        <div className="flex shrink-0 flex-col gap-3">

          <button
            type="button"
            onClick={() => {

              void reload();

            }}
            className="inline-flex items-center justify-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-medium"
          >

            <RefreshCw className="h-4 w-4" />

            Refresh

          </button>


          <button
            type="button"
            onClick={goToUpgrade}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground"
          >

            <ShieldCheck className="h-4 w-4" />

            {
              isExpired
                ? "Renew Subscription"
                : "Manage Plan"
            }

          </button>

          {
            !isExpired &&
            data?.subscription_id
              ? (
                  <button
                    type="button"
                    disabled={cancelling}
                    onClick={() => {
                      setCancellationError(null);
                      setCancellationMessage(null);
                      setShowCancelConfirmation(true);
                    }}
                    className="inline-flex items-center justify-center gap-2 rounded-lg border border-destructive/40 px-4 py-2.5 text-sm font-medium text-destructive hover:bg-destructive/10 disabled:cursor-not-allowed disabled:opacity-60"
                  >

                    {
                      cancelling
                        ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          )
                        : (
                            <XCircle className="h-4 w-4" />
                          )
                    }

                    Cancel Subscription

                  </button>
                )
              : null
          }

        </div>

      </div>

      {
        cancellationMessage
          ? (
              <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4 text-sm text-emerald-700">
                {cancellationMessage}
              </div>
            )
          : null
      }

      {
        cancellationError
          ? (
              <div className="mt-5 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive">
                {cancellationError}
              </div>
            )
          : null
      }

      {
        showCancelConfirmation
          ? (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                <div
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="cancel-subscription-title"
                  className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-xl"
                >

                  <div className="flex items-start gap-3">

                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-destructive/10">
                      <TriangleAlert className="h-5 w-5 text-destructive" />
                    </div>

                    <div>

                      <h3
                        id="cancel-subscription-title"
                        className="text-lg font-semibold"
                      >
                        Cancel Subscription?
                      </h3>

                      <p className="mt-2 text-sm leading-6 text-muted-foreground">
                        Your dashboard access will be closed immediately.
                        An admin ticket will be created to record and review
                        the cancellation. Subscription payments are generally
                        non-refundable, and cancellation does not create a
                        refund entitlement.
                      </p>

                    </div>

                  </div>

                  <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">

                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => {
                        setShowCancelConfirmation(false);
                      }}
                      className="inline-flex items-center justify-center rounded-lg border px-4 py-2.5 text-sm font-medium disabled:opacity-60"
                    >
                      Keep Subscription
                    </button>

                    <button
                      type="button"
                      disabled={cancelling}
                      onClick={() => {
                        void handleCancelSubscription();
                      }}
                      className="inline-flex items-center justify-center gap-2 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                    >

                      {
                        cancelling
                          ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            )
                          : null
                      }

                      {
                        cancelling
                          ? "Cancelling..."
                          : "Cancel Subscription"
                      }

                    </button>

                  </div>

                </div>
              </div>
            )
          : null
      }

    </section>
  );

}
