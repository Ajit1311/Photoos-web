"use client";

import {
  Check,
  ChevronLeft,
  Crown,
  Loader2,
  ShieldCheck,
  CreditCard,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  useBootstrapContext,
} from "@/context/BootstrapContext";

import {
  useSubscriptionAccess,
} from "@/context/SubscriptionAccessContext";

import {
  formatPlanLimit,
  getPlanLimit,
  hasPlanFeature,
  isVaultPlan,
  type PlanFeatureKey,
} from "@/lib/subscription/plan-access";

import type {
  SubscriptionAddonDetails,
} from "@/types/subscription/subscription";

import {
  requestMarketplaceVerifiedAddonRenewal,
} from "@/lib/api/subscription/marketplace-verified-addon";

import {
  requestSubscriptionRenewal,
} from "@/lib/api/payments";

import {
  SubscriptionBillingCard,
} from "@/components/subscription/SubscriptionBillingCard";
import { CancelSubscriptionModal } from "@/components/subscription/CancelSubscriptionModal";


const FEATURE_DETAILS:
  Array<{
    key: PlanFeatureKey;
    label: string;
  }> = [
    {
      key: "dashboard",
      label: "Dashboard access",
    },
    {
      key: "crm",
      label: "Client management",
    },
    {
      key: "projects",
      label: "Projects workspace",
    },
    {
      key: "events",
      label: "Event management",
    },
    {
      key: "gallery",
      label: "Albums and gallery",
    },
    {
      key: "watermark",
      label: "Watermark",
    },
    {
      key: "qr_sharing",
      label: "QR code sharing",
    },
    {
      key: "client_selfie_upload",
      label: "Client selfie upload",
    },
    {
      key: "face_matching",
      label: "AI face matching",
    },
    {
      key: "matched_photo_delivery",
      label: "Matched photo delivery",
    },
    {
      key: "reports",
      label: "Reports",
    },
    {
      key: "whatsapp",
      label: "WhatsApp integration",
    },
    {
      key: "automation",
      label: "Automation",
    },
    {
      key: "analytics",
      label: "Analytics",
    },
    {
      key: "ai_features",
      label: "Advanced AI features",
    },
  ];


function formatCurrency(
  amount:
    | number
    | null,
  currency:
    | string
    | null,
) {

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
      maximumFractionDigits: 0,
    },
  ).format(
    amount,
  );

}


function formatDateTime(
  value:
    | string
    | null,
) {

  if (!value) {
    return "Not available";
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
    return "Not available";
  }


  return new Intl.DateTimeFormat(
    "en-IN",
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  ).format(
    date,
  );

}


function getLimitLabel(
  label: string,
  value: number | null,
) {

  if (
    value === null
  ) {
    return null;
  }


  return `${label}: ${formatPlanLimit(value)}`;

}


export default function PlansPage() {

  const router =
    useRouter();


  const bootstrap =
    useBootstrapContext();


  const {
    data: subscription,
    loading: subscriptionLoading,
  } =
    useSubscriptionAccess();


  const studio =
    bootstrap.data
      ?.workspace
      .studio ??
    null;


  const activeAddons:
    SubscriptionAddonDetails[] =
    subscription?.active_addons ??
    [];


  const [
    renewingAddonId,
    setRenewingAddonId,
  ] =
    useState<string | null>(
      null,
    );


  const [
    renewalError,
    setRenewalError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    renewingMainPlan,
    setRenewingMainPlan,
  ] =
    useState(false);

  const [
    cancelModalOpen,
    setCancelModalOpen,
  ] =
    useState(false);


  const [
    mainPlanRenewalError,
    setMainPlanRenewalError,
  ] =
    useState<string | null>(
      null,
    );


  async function handleMainPlanRenewal() {

    const subscriptionId =
      subscription?.subscription_id;

    if (!subscriptionId) {
      setMainPlanRenewalError(
        "Unable to renew your plan because the subscription ID is missing.",
      );
      return;
    }

    setMainPlanRenewalError(null);
    setRenewingMainPlan(true);

    try {

      const renewal =
        await requestSubscriptionRenewal(
          subscriptionId,
        );

      const params =
        new URLSearchParams({
          mode: "renewal",
          subscription_id:
            renewal.subscription_id,
          payment_id:
            renewal.payment_id,
        });

      router.push(
        `/dashboard/plans/payment?${params.toString()}`,
      );

    } catch (error) {

      setMainPlanRenewalError(
        error instanceof Error
          ? error.message
          : "Unable to start subscription renewal.",
      );

    } finally {

      setRenewingMainPlan(false);

    }

  }


  async function handleAddonRenewal(
    addon: SubscriptionAddonDetails,
  ) {

    if (!addon.subscription_id) {
      setRenewalError(
        "Unable to renew this add-on because its subscription ID is missing.",
      );
      return;
    }


    if (addon.is_renewable !== true) {
      return;
    }


    setRenewalError(null);

    setRenewingAddonId(
      addon.subscription_id,
    );


    try {

      if (!studio?.id) {
        throw new Error(
          "Unable to renew this add-on because the studio ID is missing.",
        );
      }

      const renewal =
        await requestMarketplaceVerifiedAddonRenewal(
          studio.id,
        );


      const params =
        new URLSearchParams({
          mode: "addon",
          subscription_id:
            renewal.subscription_id ??
            addon.subscription_id,
            payment_id:
              renewal.payment_id ?? "",
        });


      router.push(
        `/dashboard/plans/payment?${params.toString()}`,
      );

    } catch (error) {

      setRenewalError(
        error instanceof Error
          ? error.message
          : "Unable to start add-on renewal.",
      );

    } finally {

      setRenewingAddonId(null);

    }
  }


  const activeFeatures =
    useMemo(
      () =>
        FEATURE_DETAILS.filter(
          (
            feature,
          ) =>
            hasPlanFeature(
              subscription?.features,
              feature.key,
            ),
        ),
      [
        subscription?.features,
      ],
    );


  const usersLimit =
    getPlanLimit(
      subscription?.limits,
      "users",
    );


  const storageLimit =
    getPlanLimit(
      subscription?.limits,
      "storage_gb",
    );


  const eventsLimit =
    getPlanLimit(
      subscription?.limits,
      "events_per_month",
    );


  const watermarkLimit =
    getPlanLimit(
      subscription?.limits,
      "watermark_photos",
    );


  const limits =
    [
      getLimitLabel(
        "Team members",
        usersLimit,
      ),

      getLimitLabel(
        "Storage",
        storageLimit === null
          ? null
          : storageLimit,
      ),

      getLimitLabel(
        "Events per month",
        eventsLimit,
      ),

      watermarkLimit !== null
        ? (
            watermarkLimit === -1
              ? "Unlimited watermark photos"
              : `Watermark photos: ${formatPlanLimit(watermarkLimit)}`
          )
        : null,
    ].filter(
      Boolean,
    );


  const expiryDate =
    subscription
      ?.effective_access_end_at ??
    subscription
      ?.subscription_end_at ??
    subscription
      ?.trial_end_at ??
    null;


  const mainPlanRenewalEligible =
    subscription?.has_access === true &&
    subscription?.days_remaining !== null &&
    subscription?.days_remaining !== undefined &&
    subscription.days_remaining <= 5 &&
    subscription.days_remaining >= 0;


  function handleBack() {

    router.push(
      "/dashboard",
    );

  }


  function handleUpgrade() {

    router.push(
      "/dashboard/subscription-plans",
    );

  }


  return (
    <main
      className="
        min-h-screen
        bg-background
      "
    >

      <div
        className="
          mx-auto
          w-full
          max-w-7xl
          px-4
          py-8
          sm:px-6
          lg:px-8
          lg:py-12
        "
      >

        <button
          type="button"
          onClick={handleBack}
          className="
            inline-flex
            items-center
            gap-2
            rounded-lg
            px-2
            py-1.5
            text-sm
            font-medium
            text-muted-foreground
            transition-colors
            hover:bg-muted
            hover:text-foreground
          "
        >

          <ChevronLeft
            className="
              h-4
              w-4
            "
          />

          Back to Dashboard

        </button>

        {isVaultPlan(subscription?.plan) && (
          <div className="mt-6 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-[#0A3F61] to-[#0D5C8A] p-6 text-white shadow-md">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                  Studio Vault &bull; Monsoon Off-Season Pause
                </span>
                <h3 className="mt-2 text-xl font-bold">Studio Vault is Currently Active</h3>
                <p className="mt-1 text-sm text-blue-100 max-w-xl">
                  Your client galleries, QR downloads, and face matching are 100% active with zero data deletion. New event uploads are paused until wedding season resumes in October.
                </p>
              </div>
              <button
                onClick={handleUpgrade}
                className="inline-flex shrink-0 items-center justify-center rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-[#0A3F61] shadow-sm hover:bg-blue-50 transition"
              >
                Reactivate Studio Plan
              </button>
            </div>
          </div>
        )}

        <div
          className="
            mt-10
            text-center
          "
        >

          <h1
            className="
              text-3xl
              font-semibold
              tracking-tight
              sm:text-4xl
            "
          >

            Your PhotoOS plan

          </h1>


          <p
            className="
              mx-auto
              mt-4
              max-w-2xl
              text-sm
              leading-7
              text-muted-foreground
              sm:text-base
            "
          >

            View your active plan,
            included features,
            usage limits,
            subscription validity,
            and active add-ons.

          </p>

        </div>


        {
          subscriptionLoading
            ? (

                <div
                  className="
                    flex
                    min-h-[360px]
                    items-center
                    justify-center
                  "
                >

                  <Loader2
                    className="
                      h-8
                      w-8
                      animate-spin
                      text-muted-foreground
                    "
                  />

                </div>

              )
            : (

                <div
                  className="
                    mx-auto
                    mt-12
                    max-w-5xl
                    space-y-6
                  "
                >

                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        border-b
                        border-border
                        px-6
                        py-6
                        sm:px-8
                      "
                    >

                      <div
                        className="
                          flex
                          flex-col
                          gap-5
                          sm:flex-row
                          sm:items-center
                          sm:justify-between
                        "
                      >

                        <div
                          className="
                            flex
                            items-center
                            gap-4
                          "
                        >

                          <div
                            className="
                              flex
                              h-12
                              w-12
                              items-center
                              justify-center
                              rounded-2xl
                              bg-amber-500/10
                              text-amber-600
                            "
                          >

                            <Crown
                              size={23}
                            />

                          </div>


                          <div>

                            <div
                              className="
                                flex
                                flex-wrap
                                items-center
                                gap-2
                              "
                            >

                              <h2
                                className="
                                  text-2xl
                                  font-semibold
                                "
                              >

                                {
                                  subscription?.plan_name ??
                                  subscription?.plan ??
                                  "No active plan"
                                }

                              </h2>


                              {
                                subscription?.has_access === true && (

                                  <span
                                    className="
                                      rounded-full
                                      bg-green-100
                                      px-2.5
                                      py-1
                                      text-[10px]
                                      font-bold
                                      uppercase
                                      tracking-wide
                                      text-green-700
                                    "
                                  >

                                    Active

                                  </span>

                                )
                              }

                              {subscription?.subscription_id && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOpen(true)}
                                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Cancel Subscription
                                </button>
                              )}

                            </div>


                            <p
                              className="
                                mt-1
                                text-sm
                                text-muted-foreground
                              "
                            >

                              Current base subscription

                            </p>

                          </div>

                        </div>


                        <div
                          className="
                            sm:text-right
                          "
                        >

                          <p
                            className="
                              text-3xl
                              font-bold
                            "
                          >

                            {
                              formatCurrency(
                                subscription?.price ??
                                null,
                                subscription?.currency ??
                                "INR",
                              )
                            }

                          </p>


                          <p
                            className="
                              mt-1
                              text-sm
                              text-muted-foreground
                            "
                          >

                            {
                              subscription?.billing_cycle ??
                              "monthly"
                            }

                          </p>

                        </div>

                      </div>

                    </div>


                    <div
                      className="
                        grid
                        gap-6
                        p-6
                        sm:p-8
                        lg:grid-cols-2
                      "
                    >

                      <div>

                        <h3
                          className="
                            text-sm
                            font-semibold
                          "
                        >

                          Subscription details

                        </h3>


                        <div
                          className="
                            mt-4
                            space-y-4
                          "
                        >

                          <div
                            className="
                              rounded-2xl
                              border
                              border-border
                              p-4
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wide
                                text-muted-foreground
                              "
                            >

                              Started

                            </p>


                            <p
                              className="
                                mt-1
                                text-sm
                                font-semibold
                              "
                            >

                              {
                                formatDateTime(
                                  subscription
                                    ?.subscription_start_at ??
                                  subscription
                                    ?.trial_start_at ??
                                  null,
                                )
                              }

                              {subscription?.subscription_id && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOpen(true)}
                                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Cancel Subscription
                                </button>
                              )}

                            </p>

                          </div>


                          <div
                            className="
                              rounded-2xl
                              border
                              border-border
                              p-4
                            "
                          >

                            <p
                              className="
                                text-xs
                                font-medium
                                uppercase
                                tracking-wide
                                text-muted-foreground
                              "
                            >

                              Access expires

                            </p>


                            <p
                              className="
                                mt-1
                                text-sm
                                font-semibold
                              "
                            >

                              {
                                formatDateTime(
                                  expiryDate,
                                )
                              }

                              {subscription?.subscription_id && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOpen(true)}
                                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Cancel Subscription
                                </button>
                              )}

                            </p>

                          </div>


                          {
                            subscription?.days_remaining !== null &&
                            subscription?.days_remaining !== undefined && (

                              <div
                                className="
                                  rounded-2xl
                                  border
                                  border-border
                                  p-4
                                "
                              >

                                <p
                                  className="
                                    text-xs
                                    font-medium
                                    uppercase
                                    tracking-wide
                                    text-muted-foreground
                                  "
                                >

                                  Remaining access

                                </p>


                                <p
                                  className="
                                    mt-1
                                    text-sm
                                    font-semibold
                                  "
                                >

                                  {
                                    subscription.days_remaining
                                  }
                                  {" days"}

                                </p>

                              </div>

                            )
                          }



                          {
                            <div className="flex flex-col items-center pt-1">

                              <button
                                type="button"
                                disabled={
                                  !mainPlanRenewalEligible ||
                                  renewingMainPlan
                                }
                                title={
                                  mainPlanRenewalEligible
                                    ? "Renew your current subscription"
                                    : "Renewal becomes available when 5 days or less remain"
                                }
                                onClick={() => {
                                  void handleMainPlanRenewal();
                                }}
                                  className="
                                    inline-flex
                                    h-11
                                    w-full
                                    max-w-md
                                    items-center
                                    justify-center
                                    gap-2
                                    rounded-xl
                                    bg-primary
                                    px-5
                                    text-sm
                                    font-semibold
                                    text-primary-foreground
                                    transition-opacity
                                    hover:opacity-90
                                    disabled:cursor-not-allowed
                                    disabled:opacity-50
                                  "
                                >

                                  <CreditCard
                                    className="h-4 w-4"
                                  />

                                  {
                                    renewingMainPlan
                                      ? "Opening payment..."
                                      : "Renew Plan"
                                  }

                                </button>

                                {
                                  mainPlanRenewalError && (

                                    <p
                                      className="
                                        mt-2
                                        text-sm
                                        text-destructive
                                      "
                                    >

                                      {mainPlanRenewalError}

                                    </p>

                                  )
                                }

                              {
                                !mainPlanRenewalEligible &&
                                subscription?.days_remaining !== null &&
                                subscription?.days_remaining !== undefined && (

                                  <p
                                    className="
                                      mt-2
                                      text-center
                                      text-xs
                                      text-muted-foreground
                                    "
                                  >
                                    Renewal available when 5 days or less remain.
                                  </p>

                                )
                              }

                              {subscription?.subscription_id && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOpen(true)}
                                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Cancel Subscription
                                </button>
                              )}

                            </div>
                          }

                        </div>

                      </div>


                      <div>

                        <h3
                          className="
                            text-sm
                            font-semibold
                          "
                        >

                          Plan limits

                        </h3>


                        <div
                          className="
                            mt-4
                            grid
                            gap-3
                          "
                        >

                          {
                            limits.map(
                              (
                                limit,
                              ) => (

                                <div
                                  key={limit}
                                  className="
                                    rounded-2xl
                                    border
                                    border-border
                                    bg-muted/20
                                    px-4
                                    py-3
                                    text-sm
                                    font-medium
                                  "
                                >

                                  {limit}

                                </div>

                              ),
                            )
                          }

                        </div>

                      </div>

                    </div>


                    <div
                      className="
                        border-t
                        border-border
                        p-6
                        sm:p-8
                      "
                    >

                      <h3
                        className="
                          text-sm
                          font-semibold
                        "
                      >

                        Everything Included in Your Plan

                      </h3>


                      <p
                        className="
                          mt-1
                          max-w-2xl
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        Run your photography studio with powerful business
                        tools, AI-powered photography features, smart
                        automation and faster client delivery.
                      </p>


                      {
                        activeFeatures.length > 0
                          ? (

                              <div
                                className="
                                  mt-5
                                  grid
                                  gap-3
                                  sm:grid-cols-2
                                  lg:grid-cols-3
                                "
                              >

                                {
                                  activeFeatures.map(
                                    (
                                      feature,
                                    ) => (

                                      <div
                                        key={feature.key}
                                        className="
                                          flex
                                          items-center
                                          gap-3
                                          rounded-xl
                                          border
                                          border-border
                                          px-4
                                          py-3
                                          text-sm
                                        "
                                      >

                                        <Check
                                          className="
                                            h-4
                                            w-4
                                            shrink-0
                                            text-green-600
                                          "
                                        />

                                        <span>

                                          {feature.label}

                                        </span>

                                      </div>

                                    ),
                                  )
                                }

                              </div>

                            )
                          : (

                              <p
                                className="
                                  mt-4
                                  text-sm
                                  text-muted-foreground
                                "
                              >

                                No plan features are currently available.

                              </p>

                            )
                      }

                    </div>

                  </section>


                  <SubscriptionBillingCard />

                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        border-b
                        border-border
                        px-6
                        py-5
                        sm:px-8
                      "
                    >

                      <h2
                        className="
                          text-xl
                          font-semibold
                        "
                      >
                        Plan Capacity
                      </h2>


                      <p
                        className="
                          mt-1
                          max-w-2xl
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        Your plan defines the storage, team capacity,
                        event usage and photo workflow limits available
                        to your photography studio.
                      </p>

                    </div>


                    <div className="p-6 sm:p-8">

                      <div
                        className="
                          grid
                          gap-4
                          sm:grid-cols-2
                          lg:grid-cols-4
                        "
                      >

                        <div
                          className="
                            rounded-2xl
                            border
                            border-border
                            bg-muted/20
                            p-5
                          "
                        >

                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Cloud Storage
                          </p>

                          <p className="mt-2 text-xl font-bold">
                            {
                              storageLimit !== null
                                ? `${formatPlanLimit(storageLimit)} GB`
                                : "Not available"
                            }
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Store your studio photos and project files.
                          </p>

                        </div>


                        <div
                          className="
                            rounded-2xl
                            border
                            border-border
                            bg-muted/20
                            p-5
                          "
                        >

                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Team Members
                          </p>

                          <p className="mt-2 text-xl font-bold">
                            {formatPlanLimit(usersLimit)}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Collaborate with your photography team.
                          </p>

                        </div>


                        <div
                          className="
                            rounded-2xl
                            border
                            border-border
                            bg-muted/20
                            p-5
                          "
                        >

                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Events / Month
                          </p>

                          <p className="mt-2 text-xl font-bold">
                            {formatPlanLimit(eventsLimit)}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Manage photography events every month.
                          </p>

                        </div>


                        <div
                          className="
                            rounded-2xl
                            border
                            border-border
                            bg-muted/20
                            p-5
                          "
                        >

                          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                            Watermark Photos
                          </p>

                          <p className="mt-2 text-xl font-bold">
                            {formatPlanLimit(watermarkLimit)}
                          </p>

                          <p className="mt-1 text-xs leading-5 text-muted-foreground">
                            Protect and brand your delivered photos.
                          </p>

                        </div>

                      </div>


                      <div
                        className="
                          mt-5
                          rounded-2xl
                          border
                          border-primary/20
                          bg-primary/5
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          📸 Photo Upload Capacity
                        </p>

                        <p
                          className="
                            mt-1
                            text-sm
                            leading-6
                            text-muted-foreground
                          "
                        >
                          Upload photos according to your available cloud
                          storage. The actual number of photos depends on
                          the file size and resolution of each photo.
                        </p>

                      </div>

                    </div>

                  </section>


                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        border-b
                        border-border
                        px-6
                        py-5
                        sm:px-8
                      "
                    >

                      <h2
                        className="
                          text-xl
                          font-semibold
                        "
                      >
                        AI Photography Advantage
                      </h2>


                      <p
                        className="
                          mt-1
                          max-w-2xl
                          text-sm
                          leading-6
                          text-muted-foreground
                        "
                      >
                        Use AI across your photography workflow to reduce
                        manual work, find photos faster and deliver a
                        better client experience.
                      </p>

                    </div>


                    <div
                      className="
                        grid
                        gap-4
                        p-6
                        sm:grid-cols-2
                        sm:p-8
                        lg:grid-cols-3
                      "
                    >

                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI Face Matching
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Find client photos faster using AI-powered face
                          matching across event galleries.
                        </p>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI Photo Delivery
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Speed up photo discovery and client delivery with
                          AI-powered matching workflows.
                        </p>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI Workflow Automation
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Reduce repetitive studio work with AI-powered
                          workflow automation.
                        </p>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI-Powered Analytics
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Understand studio activity and business trends
                          with AI-powered analytics.
                        </p>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI Client Selfie Upload
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Let clients use selfies to help discover their
                          event photos.
                        </p>

                      </div>


                      <div
                        className="
                          rounded-2xl
                          border
                          border-border
                          p-5
                        "
                      >

                        <p className="text-sm font-semibold">
                          AI Matched Photo Delivery
                        </p>

                        <p className="mt-2 text-xs leading-5 text-muted-foreground">
                          Turn AI-matched photos into a faster,
                          client-friendly delivery workflow.
                        </p>

                      </div>

                    </div>

                  </section>


                  <section
                    className="
                      overflow-hidden
                      rounded-3xl
                      border
                      border-border
                      bg-card
                      shadow-sm
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        justify-between
                        gap-4
                        border-b
                        border-border
                        px-6
                        py-5
                        sm:px-8
                      "
                    >

                      <div>

                        <h2
                          className="
                            text-xl
                            font-semibold
                          "
                        >

                          Active add-ons

                        </h2>


                        <p
                          className="
                            mt-1
                            text-sm
                            text-muted-foreground
                          "
                        >

                          Add-ons attached to your current subscription.

                        </p>

                      </div>


                      <ShieldCheck
                        className="
                          h-6
                          w-6
                          text-amber-600
                        "
                      />

                    </div>


                    {
                      subscriptionLoading
                        ? (

                            <div
                              className="
                                flex
                                items-center
                                justify-center
                                py-12
                              "
                            >

                              <Loader2
                                className="
                                  h-6
                                  w-6
                                  animate-spin
                                  text-muted-foreground
                                "
                              />

                            </div>

                          )
                        : activeAddons.length > 0
                          ? (
                              <div
                                className="
                                  space-y-4
                                  p-6
                                  sm:p-8
                                "
                              >

                              {
                                activeAddons.map(
                                  (
                                    addon,
                                  ) => {

                                    const addonUsable =
                                      subscription?.has_access === true &&
                                      addon.is_active === true &&
                                      addon.has_access !== false;

                                    return (
                                      <div
                                        key={
                                          addon.subscription_id ??
                                          addon.plan
                                        }
                                        className="
                                          rounded-2xl
                                          border
                                          border-amber-200
                                          bg-amber-50/50
                                          p-5
                                        "
                                      >

                                        <div
                                          className="
                                            flex
                                            flex-col
                                            gap-5
                                            sm:flex-row
                                            sm:items-start
                                            sm:justify-between
                                          "
                                        >

                                          <div>

                                            <div
                                              className="
                                                flex
                                                flex-wrap
                                                items-center
                                                gap-2
                                              "
                                            >

                                              <h3
                                                className="
                                                  text-lg
                                                  font-semibold
                                                  text-amber-950
                                                "
                                              >
                                                {
                                                  addon.plan_name ??
                                                  addon.plan ??
                                                  "Add-on"
                                                }
                                              </h3>

                                              <span
                                                className="
                                                  rounded-full
                                                  bg-amber-600
                                                  px-3
                                                  py-1
                                                  text-xs
                                                  font-semibold
                                                  text-white
                                                "
                                              >
                                                {
                                                  addonUsable
                                                    ? "ACTIVE"
                                                    : "DISABLED"
                                                }
                                              </span>

                                            </div>


                                            <p
                                              className="
                                                mt-2
                                                text-sm
                                                text-amber-800
                                              "
                                            >
                                              Add-on attached to your
                                              PhotoOS subscription.
                                            </p>


                                            <p
                                              className="
                                                mt-3
                                                text-xl
                                                font-bold
                                                text-amber-950
                                              "
                                            >
                                              {
                                                formatCurrency(
                                                  addon.price,
                                                  addon.currency,
                                                )
                                              }

                                              {
                                                addon.billing_cycle
                                                  ? (
                                                      <span
                                                        className="
                                                          ml-1
                                                          text-sm
                                                          font-medium
                                                        "
                                                      >
                                                        /
                                                        {
                                                          addon.billing_cycle
                                                        }
                                                      </span>
                                                    )
                                                  : null
                                              }

                                            </p>

                                          </div>


                                          <div
                                            className="
                                              grid
                                              gap-4
                                              sm:grid-cols-2
                                            "
                                          >

                                            <div>

                                              <p
                                                className="
                                                  text-xs
                                                  font-medium
                                                  uppercase
                                                  tracking-wide
                                                  text-amber-700
                                                "
                                              >
                                                Add-on started
                                              </p>

                                              <p
                                                className="
                                                  mt-1
                                                  text-sm
                                                  font-semibold
                                                  text-amber-950
                                                "
                                              >
                                                {
                                                  formatDateTime(
                                                    addon.subscription_start_at,
                                                  )
                                                }
                                              </p>

                                            </div>


                                              <div>

                                                <p
                                                  className="
                                                    text-xs
                                                    font-medium
                                                    uppercase
                                                    tracking-wide
                                                    text-amber-700
                                                  "
                                                >
                                                  {
                                                    addon.status ===
                                                      "expired"
                                                      ? "Add-on expired"
                                                      : "Add-on expires"
                                                  }
                                                </p>

                                                <p
                                                  className="
                                                    mt-1
                                                    text-sm
                                                    font-semibold
                                                    text-amber-950
                                                  "
                                                >
                                                  {
                                                    formatDateTime(
                                                      addon.status ===
                                                        "expired"
                                                        ? addon.expired_at
                                                        : addon.effective_access_end_at ??
                                                          addon.subscription_end_at,
                                                    )
                                                  }
                                                </p>

                                              </div>
                                            </div>

                                          </div>



                                                                                  {
                                            addon.plan ===
                                              "marketplace_verified"
                                              ? (
                                                  <div
                                                    className="
                                                      mt-5
                                                      flex
                                                      justify-end
                                                      border-t
                                                      border-amber-200
                                                      pt-4
                                                    "
                                                  >
                                                    <button
                                                      type="button"
                                                      disabled={
                                                        addon.is_renewable !== true ||
                                                        renewingAddonId ===
                                                          addon.subscription_id
                                                      }
                                                      onClick={() => {
                                                        void handleAddonRenewal(
                                                          addon,
                                                        );
                                                      }}
                                                      className="
                                                        inline-flex
                                                        h-10
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        gap-2
                                                        rounded-xl
                                                        border
                                                        border-amber-300
                                                        bg-white
                                                        px-4
                                                        text-sm
                                                        font-semibold
                                                        text-amber-900
                                                        shadow-sm
                                                        transition-all
                                                        disabled:cursor-not-allowed
                                                        disabled:opacity-45
                                                        enabled:hover:border-amber-500
                                                        enabled:hover:bg-amber-100
                                                        enabled:hover:shadow-md
                                                      "
                                                    >
                                                      <CreditCard
                                                        className="
                                                          h-4
                                                          w-4
                                                        "
                                                      />

                                                      {
                                                        renewingAddonId ===
                                                          addon.subscription_id
                                                          ? "Opening payment..."
                                                          : "Renew Add-on"
                                                      }
                                                    </button>
                                                  </div>
                                                )
                                              : null
                                          }


                                          {
                                            Object.keys(
                                              addon.features ??
                                              {},
                                            ).filter(
                                              (
                                                key,
                                              ) =>
                                                addon.features[key] === true ||
                                                addon.features[key] === "true",
                                            ).length > 0
                                              ? (
                                                <div
                                                  className="
                                                    mt-5
                                                    border-t
                                                    border-amber-200
                                                    pt-4
                                                  "
                                                >

                                                  <p
                                                    className="
                                                      text-xs
                                                      font-semibold
                                                      uppercase
                                                      tracking-wide
                                                      text-amber-700
                                                    "
                                                  >
                                                    Add-on benefits
                                                  </p>

                                                  <div
                                                    className="
                                                      mt-3
                                                      flex
                                                      flex-wrap
                                                      gap-2
                                                    "
                                                  >

                                                    {
                                                      Object.keys(
                                                        addon.features ??
                                                        {},
                                                      )
                                                        .filter(
                                                          (
                                                            key,
                                                          ) =>
                                                            addon.features[key] === true ||
                                                            addon.features[key] === "true",
                                                        )
                                                        .map(
                                                          (
                                                            key,
                                                          ) => (
                                                            <span
                                                              key={
                                                                key
                                                              }
                                                              className="
                                                                rounded-full
                                                                border
                                                                border-amber-200
                                                                bg-white
                                                                px-3
                                                                py-1.5
                                                                text-xs
                                                                font-medium
                                                                text-amber-900
                                                              "
                                                            >
                                                              {
                                                                key
                                                                  .replace(
                                                                    /_/g,
                                                                    " ",
                                                                  )
                                                                  .replace(
                                                                    /\b\w/g,
                                                                    (
                                                                      char,
                                                                    ) =>
                                                                      char.toUpperCase(),
                                                                  )
                                                              }
                                                            </span>
                                                          ),
                                                        )
                                                    }

                                                  </div>

                                                </div>
                                              )
                                            : null
                                        }

                                      </div>
                                    );
                                  },
                                )
                              }

                              {subscription?.subscription_id && (
                                <button
                                  type="button"
                                  onClick={() => setCancelModalOpen(true)}
                                  className="mt-3 text-xs font-semibold text-red-600 hover:text-red-700 hover:underline transition"
                                >
                                  Cancel Subscription
                                </button>
                              )}

                            </div>
                          )
                        : (

                            <div
                              className="
                                px-6
                                py-10
                                text-center
                                text-sm
                                text-muted-foreground
                              "
                            >

                              No active add-ons on this subscription.

                            </div>

                          )
                    }

                  </section>


                  <div
                    className="
                      flex
                      justify-center
                      pt-2
                    "
                  >

                    <button
                      type="button"
                      onClick={handleUpgrade}
                      className="
                        inline-flex
                        h-12
                        items-center
                        justify-center
                        rounded-xl
                        bg-primary
                        px-7
                        text-sm
                        font-semibold
                        text-primary-foreground
                        transition-opacity
                        hover:opacity-90
                      "
                    >

                      Upgrade or change plan

                    </button>

                  </div>

                </div>

              )
        }

      </div>

      <CancelSubscriptionModal
        isOpen={cancelModalOpen}
        onClose={() => setCancelModalOpen(false)}
        subscriptionId={subscription?.subscription_id}
        planName={subscription?.plan_name}
        onSuccess={() => {
          setCancelModalOpen(false);
          window.location.reload();
        }}
      />
    </main>
  );
}
