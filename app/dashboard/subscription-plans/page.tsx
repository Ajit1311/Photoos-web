"use client";

import Link from "next/link";

import {
  BadgeCheck,
  Check,
  HardDrive,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  getSubscriptionPlans,
} from "@/lib/api/subscription/plans";

import type {
  SubscriptionPlan,
} from "@/types/subscription/plan";


type PlanTab =
  | "monthly"
  | "yearly"
  | "vault"
  | "addons";




const formatValue = (
  value: unknown,
): string => {
  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  if (
    value === null ||
    value === undefined
  ) {
    return "—";
  }

  return String(
    value,
  );
};


const featureLabels:
  Record<string, string> = {
    dashboard:
      "Dashboard",
    crm:
      "Client CRM",
    events:
      "Event Management",
    gallery:
      "Client Galleries",
    projects:
      "Project Management",
    reports:
      "Reports",
    whatsapp:
      "WhatsApp Integration",
    analytics:
      "Analytics",
    automation:
      "Automation",
    ai_features:
      "Advanced AI Features",
    priority_support:
      "Priority Support",

    qr_sharing:
      "QR Code Sharing",

    client_selfie_upload:
      "Client Selfie Upload",

    face_matching:
      "AI Face Matching",

    matched_photo_delivery:
      "Matched Photo Delivery",

    watermark:
      "Photo Watermarking",

    basic_profile:
      "Basic Studio Profile",

    studio_listing:
      "Studio Marketplace Listing",

    customer_visibility:
      "Customer Visibility",

    verified_badge:
      "Verified Badge",

    trust_indicator:
      "Trust Indicator",

    profile_verification:
      "Profile Verification",
  };


const limitLabels:
  Record<string, string> = {
    users:
      "Team Members",

    storage_gb:
      "Storage",

    events_per_month:
      "Events per Month",

    watermark_photos:
      "Watermarked Photos",

    services:
      "Services",

    portfolio_images:
      "Portfolio Images",
  };


const formatFeatureName = (
  value: string,
) => {
  const normalizedValue =
    value
      .trim()
      .toLowerCase();

  if (
    featureLabels[
      normalizedValue
    ]
  ) {
    return featureLabels[
      normalizedValue
    ];
  }

  return normalizedValue
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
};


const formatLimitValue = (
  key: string,
  value: unknown,
): string => {
  if (
    value === -1 ||
    value === "-1"
  ) {
    return "Unlimited";
  }

  const numericValue =
    typeof value === "number"
      ? value
      : Number(
          value,
        );

  if (
    key === "storage_gb" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} GB`;
  }

  if (
    key === "watermark_photos" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} Photos`;
  }

  if (
    key === "events_per_month" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} Events`;
  }

  if (
    key === "users" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} Users`;
  }

  if (
    key === "portfolio_images" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} Images`;
  }

  if (
    key === "services" &&
    !Number.isNaN(
      numericValue,
    )
  ) {
    return `${numericValue.toLocaleString()} Services`;
  }

  if (
    typeof value === "boolean"
  ) {
    return value
      ? "Included"
      : "Not Included";
  }

  return String(
    value,
  );
};


const getFeatures = (
  features: unknown,
): string[] => {
  if (
    !features
  ) {
    return [];
  }

  if (
    Array.isArray(
      features,
    )
  ) {
    return features
      .flatMap(
        (
          feature,
        ) => {
          if (
            typeof feature ===
            "string"
          ) {
            return [
              formatFeatureName(
                feature,
              ),
            ];
          }

          if (
            feature &&
            typeof feature ===
            "object"
          ) {
            return Object.entries(
              feature as Record<
                string,
                unknown
              >,
            )
              .filter(
                (
                  [
                    ,
                    value,
                  ],
                ) =>
                  value === true ||
                  value === 1 ||
                  value === "true",
              )
              .map(
                (
                  [
                    key,
                  ],
                ) =>
                  formatFeatureName(
                    key,
                  ),
              );
          }

          return [];
        },
      )
      .filter(
        Boolean,
      );
  }

  if (
    typeof features ===
    "object"
  ) {
    return Object.entries(
      features as Record<
        string,
        unknown
      >,
    )
      .filter(
        (
          [
            ,
            value,
          ],
        ) =>
          value === true ||
          value === 1 ||
          value === "true",
      )
      .map(
        (
          [
            key,
          ],
        ) =>
          formatFeatureName(
            key,
          ),
      );
  }

  return [];
};


const getLimits = (
  limits: unknown,
): Array<{
  label: string;
  value: string;
}> => {
  if (
    !limits ||
    typeof limits !==
      "object" ||
    Array.isArray(
      limits,
    )
  ) {
    return [];
  }

  return Object.entries(
    limits as Record<
      string,
      unknown
    >,
  )
    .filter(
      (
        [
          ,
          value,
        ],
      ) =>
        value !== null &&
        value !== undefined,
    )
    .map(
      (
        [
          key,
          value,
        ],
      ) => ({
        label:
          limitLabels[
            key
          ] ??
          key
            .replace(
              /_/g,
              " ",
            )
            .replace(
              /\b\w/g,
              (
                character,
              ) =>
                character.toUpperCase(),
            ),

        value:
          formatLimitValue(
            key,
            value,
          ),
      }),
    );
};




const isAddonPlan = (
  plan: SubscriptionPlan,
) => {
  return (
    plan.plan_type === "marketplace" ||
    plan.plan_type === "addon" ||
    plan.plan_code.startsWith("addon_")
  );
};


const getPlanIcon = (
  plan: SubscriptionPlan,
) => {
  const code =
    plan.plan_code
      .toLowerCase();

  if (
    code.includes("vault")
  ) {
    return "🌧️";
  }

  if (
    code.includes("addon_extra_event")
  ) {
    return "🎟️";
  }

  if (
    code.includes("addon_storage")
  ) {
    return "💾";
  }

  if (
    code.includes(
      "elite",
    )
  ) {
    return "👑";
  }

  if (
    code.includes(
      "booster",
    )
  ) {
    return "🚀";
  }

  if (
    code.includes(
      "starter",
    )
  ) {
    return "🌱";
  }

  if (
    code.includes(
      "verified",
    )
  ) {
    return "✓";
  }

  if (
    code.includes(
      "free",
    )
  ) {
    return "✦";
  }

  return "✦";
};


const formatPrice = (
  price: number | string | null,
  currency?: string | null,
) => {
  const numericPrice =
    typeof price ===
    "number"
      ? price
      : Number(
          price ?? 0,
        );

  const resolvedCurrency =
    currency ??
    "INR";

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",
      currency:
        resolvedCurrency,
      maximumFractionDigits:
        0,
    },
  ).format(
    Number.isNaN(
      numericPrice,
    )
      ? 0
      : numericPrice,
  );
};


export default function SubscriptionPlansPage() {
  const [
    plans,
    setPlans,
  ] =
    useState<
      SubscriptionPlan[]
    >([]);

  const [
    activeTab,
    setActiveTab,
  ] =
    useState<
      PlanTab
    >(
      "monthly",
    );

  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [
    error,
    setError,
  ] =
    useState<
      string | null
    >(
      null,
    );


  const loadPlans =
    async () => {
      try {
        setLoading(
          true,
        );

        setError(
          null,
        );

        const result =
          await getSubscriptionPlans();

        setPlans(
          result.filter(
            (
              plan,
            ) =>
              plan.is_active,
          ),
        );
      } catch (
        err
      ) {
        setPlans(
          [],
        );

        setError(
          err instanceof Error
            ? err.message
            : "Unable to load subscription plans.",
        );
      } finally {
        setLoading(
          false,
        );
      }
    };


  useEffect(
    () => {
      void loadPlans();
    },
    [],
  );


  const visiblePlans =
    useMemo(
      () => {
        if (
          activeTab === "vault"
        ) {
          return plans.filter((plan) =>
            plan.plan_code.toLowerCase().includes("vault")
          );
        }

        if (
          activeTab === "addons"
        ) {
          return plans.filter(
            isAddonPlan,
          );
        }

        if (
          activeTab === "yearly"
        ) {
          return plans.filter(
            (plan) =>
              !isAddonPlan(plan) &&
              !plan.plan_code.toLowerCase().includes("vault") &&
              plan.billing_cycle === "yearly" &&
              plan.plan_type === "studio_software",
          );
        }

        return plans.filter(
          (plan) =>
            !isAddonPlan(plan) &&
            !plan.plan_code.toLowerCase().includes("vault") &&
            plan.billing_cycle === "monthly" &&
            plan.plan_type === "studio_software",
        );
      },
      [
        activeTab,
        plans,
      ],
    );


  return (
    <div className="min-h-full">
      <div className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-10">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              PhotoOS Subscription
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight">
              Subscription Plans &amp; Retention Architecture
            </h1>

            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              Choose the right tier for your wedding season, pause cleanly with Studio Vault during monsoons, or expand capacity with peak season add-ons.
            </p>
          </div>

          <button
            type="button"
            onClick={
              () => {
                void loadPlans();
              }
            }
            disabled={
              loading
            }
            className="inline-flex items-center justify-center gap-2 rounded-xl border bg-background px-5 py-3 text-sm font-semibold transition-opacity hover:opacity-80 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}

            Refresh Plans
          </button>
        </div>


        <div className="mt-8 flex flex-wrap gap-2 rounded-2xl border bg-muted/30 p-1.5">
          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "monthly",
                )
            }
            className={
              activeTab ===
              "monthly"
                ? "rounded-xl bg-white px-5 py-2.5 text-sm font-semibold shadow-sm text-slate-900"
                : "rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Monthly Plans
          </button>

          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "yearly",
                )
            }
            className={
              activeTab ===
              "yearly"
                ? "rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                : "rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            Annual Shield (13 Months)
            <span className="ml-2 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
              Save 2 Mo + 1 Free
            </span>
          </button>

          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "vault",
                )
            }
            className={
              activeTab ===
              "vault"
                ? "rounded-xl bg-[#0a3f61] px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                : "rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            🌧️ Studio Vault (Off-Season Pause)
          </button>

          <button
            type="button"
            onClick={
              () =>
                setActiveTab(
                  "addons",
                )
            }
            className={
              activeTab ===
              "addons"
                ? "rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm"
                : "rounded-xl px-5 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            }
          >
            ⚡ Modular Add-Ons
          </button>
        </div>

        {/* Studio Vault Overview Banner */}
        {activeTab === "vault" && (
          <div className="mt-8 rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-950 via-[#0A3F61] to-[#0D5C8A] p-6 text-white shadow-md sm:p-8">
            <div className="flex flex-col gap-2">
              <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-blue-100">
                Monsoon Retention &amp; Pause Architecture (&quot;Studio Vault&quot;)
              </span>
              <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
                Keep Galleries 100% Live &bull; Pay Only ₹199/mo In Off-Season
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-blue-100">
                Engineered specifically to solve off-season churn (June to September) when Indian wedding work halts. Instead of losing client access or canceling subscriptions, Studio Vault safely pauses your event creation pipeline while keeping your client galleries permanently online.
              </p>
            </div>

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 border-t border-white/15 pt-6 text-xs text-blue-100">
              <div className="rounded-xl bg-white/10 p-3.5">
                <div className="font-semibold text-white">🔒 100% Client &amp; Guest Access</div>
                <p className="mt-1 text-blue-200 leading-relaxed">Guests scan QR codes, download full-res photos, run AI face match, and comment with zero interruption.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5">
                <div className="font-semibold text-white">⏸️ Upload Pipeline Paused</div>
                <p className="mt-1 text-blue-200 leading-relaxed">0 new event creations; shoot pipeline safely suspended while keeping budget low.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5">
                <div className="font-semibold text-white">🛡️ Zero Data Pruning</div>
                <p className="mt-1 text-blue-200 leading-relaxed">All Cloudflare R2 image assets remain permanently protected with zero deletion risk.</p>
              </div>
              <div className="rounded-xl bg-white/10 p-3.5">
                <div className="font-semibold text-white">⚡ 1-Click Reactivation</div>
                <p className="mt-1 text-blue-200 leading-relaxed">Instantly restore full Studio Starter or Pro features whenever your season starts in October.</p>
              </div>
            </div>
          </div>
        )}

        {/* Annual Shield Overview Banner */}
        {activeTab === "yearly" && (
          <div className="mt-8 rounded-3xl border border-emerald-200 bg-gradient-to-r from-emerald-950 via-[#074739] to-[#0A5C4A] p-6 text-white shadow-md sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-emerald-100">
              Option 2: Annual Shield
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              13 Months Total: Complete Off-Season Monsoon Coverage
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-emerald-100">
              All yearly subscribers bypass the off-season problem automatically: with <strong>2 Months Free + 1 Extra Bonus Month (13 months total)</strong>, the entire June to September monsoon period is covered with zero additional charges or gallery downtime.
            </p>
          </div>
        )}

        {/* Modular Add-Ons Overview Banner */}
        {activeTab === "addons" && (
          <div className="mt-8 rounded-3xl border border-purple-200 bg-gradient-to-r from-purple-950 via-[#3B1963] to-[#581C87] p-6 text-white shadow-md sm:p-8">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-purple-200">
              Peak Season Expansion
            </span>
            <h2 className="mt-2 text-2xl font-bold sm:text-3xl">
              Modular High-Margin Add-Ons
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-purple-200">
              Studios can expand limits dynamically during peak wedding months without forcing an entire tier upgrade. Add extra event passes or boost Cloudflare R2 storage on demand.
            </p>
          </div>
        )}


        {loading && (
          <div className="mt-8 flex min-h-64 items-center justify-center rounded-2xl border bg-card">
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />

              Loading subscription plans...
            </div>
          </div>
        )}


        {!loading &&
          error && (
            <div className="mt-8 rounded-2xl border bg-card p-6">
              <h2 className="font-semibold">
                Unable to load plans
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {error}
              </p>

              <button
                type="button"
                onClick={
                  () => {
                    void loadPlans();
                  }
                }
                className="mt-5 rounded-xl bg-[#0a3f61] px-5 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                Try Again
              </button>
            </div>
          )}


        {!loading &&
          !error &&
          visiblePlans.length ===
            0 && (
            <div className="mt-8 rounded-2xl border bg-card p-8">
              <h2 className="font-semibold">
                No plans available
              </h2>

              <p className="mt-2 text-sm text-muted-foreground">
                {activeTab ===
                "addons"
                  ? "No active add-on plans are currently available."
                  : "No active plans are available for this billing cycle."}
              </p>
            </div>
          )}


        {!loading &&
          !error &&
          visiblePlans.length >
            0 && (
            <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {visiblePlans.map(
                (
                  plan,
                ) => {
                  const features =
                    getFeatures(
                      plan.features,
                    );

                  const limits =
                    getLimits(
                      plan.limits,
                    );

                  const addon =
                    isAddonPlan(
                      plan,
                    );

                  return (
                    <div
                      key={
                        plan.id
                      }
                      className="flex flex-col rounded-2xl border bg-card p-6 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground">
                            {plan.plan_code}
                          </p>

                          <h2 className="mt-2 text-xl font-bold">
                            {plan.name}
                          </h2>
                        </div>

                        {addon && (
                          <div className="rounded-xl bg-[#0a3f61]/10 p-3 text-[#0a3f61]">
                            {getPlanIcon(
                              plan,
                            )}
                          </div>
                        )}
                      </div>


                      {plan.description && (
                        <p className="mt-4 min-h-12 text-sm leading-6 text-muted-foreground">
                          {plan.description}
                        </p>
                      )}


                      <div className="mt-6">
                        <div className="flex items-baseline gap-2">
                          <span className="text-3xl font-bold">
                            {formatPrice(
                              plan.price,
                              plan.currency,
                            )}
                          </span>

                          <span className="text-sm text-muted-foreground">
                            / {plan.billing_cycle}
                          </span>
                        </div>

                        {addon && (
                          <p className="mt-2 text-xs font-medium text-[#0a3f61]">
                            Optional add-on. Your current base
                            subscription will remain unchanged.
                          </p>
                        )}
                      </div>


                      {features.length >
                        0 && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="text-sm font-semibold">
                            Included Features
                          </h3>

                          <ul className="mt-4 space-y-3">
                            {features.map(
                              (
                                feature,
                              ) => (
                                <li
                                  key={
                                    feature
                                  }
                                  className="flex items-start gap-3 text-sm"
                                >
                                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0a3f61]" />

                                  <span>
                                    {feature}
                                  </span>
                                </li>
                              ),
                            )}
                          </ul>
                        </div>
                      )}


                      {limits.length >
                        0 && (
                        <div className="mt-6 border-t pt-6">
                          <h3 className="text-sm font-semibold">
                            {addon
                              ? "Add-on Capacity"
                              : "Plan Limits"}
                          </h3>

                          <dl className="mt-4 space-y-3">
                            {limits.map(
                              (
                                limit,
                              ) => (
                                <div
                                  key={
                                    limit.label
                                  }
                                  className="flex items-center justify-between gap-4 text-sm"
                                >
                                  <dt className="text-muted-foreground">
                                    {limit.label}
                                  </dt>

                                  <dd className="font-semibold">
                                    {limit.value}
                                  </dd>
                                </div>
                              ),
                            )}
                          </dl>
                        </div>
                      )}


                      <div className="mt-auto pt-8">
                        {addon ? (
                          <Link
                            href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                              plan.id,
                            )}&planCode=${encodeURIComponent(
                              plan.plan_code,
                            )}&planType=addon`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-purple-600 px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                          >
                            Get Add-on
                          </Link>
                        ) : plan.plan_code.toLowerCase().includes("vault") ? (
                          <Link
                            href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                              plan.id,
                            )}&planCode=${encodeURIComponent(
                              plan.plan_code,
                            )}&planType=studio_software&billingCycle=${encodeURIComponent(
                              plan.billing_cycle,
                            )}`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3f61] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                          >
                            Activate Studio Vault
                          </Link>
                        ) : (
                          <Link
                            href={`/dashboard/plans/payment?planId=${encodeURIComponent(
                              plan.id,
                            )}&planCode=${encodeURIComponent(
                              plan.plan_code,
                            )}&planType=studio_software&billingCycle=${encodeURIComponent(
                              plan.billing_cycle,
                            )}`}
                            className="inline-flex w-full items-center justify-center rounded-xl bg-[#0a3f61] px-4 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90 shadow-md"
                          >
                            Choose Plan
                          </Link>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          )}


        <div className="mt-10 rounded-2xl border bg-card p-6">
          <div className="flex gap-4">
            <ShieldCheck className="h-5 w-5 shrink-0 text-[#0a3f61]" />

            <div>
              <h3 className="font-semibold">
                Subscription and add-on management
              </h3>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Base plans and add-on products are loaded
                from the same PhotoOS subscription catalog.
                Add-ons do not replace the current base
                subscription.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
