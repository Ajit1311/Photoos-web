"use client";


import {
  useSubscriptionAccess,
} from "@/context/SubscriptionAccessContext";

import {
  canAccessPlanFeature,
  formatPlanLimit,
  getPlanLimit,
  hasPlanFeature,
  isUnlimitedLimit,
  type PlanFeatureKey,
} from "@/lib/subscription/plan-access";


export function usePlanAccess() {
  const {
    data,
    loading,
  } =
    useSubscriptionAccess();


  const features =
    data?.features ??
    {};


  const limits =
    data?.limits ??
    {};


  const hasSubscriptionAccess =
    data?.has_access ??
    false;


  const canAccess =
    (
      feature:
        PlanFeatureKey,
    ) =>
      canAccessPlanFeature(
        hasSubscriptionAccess,
        features,
        feature,
      );


  const hasFeature =
    (
      feature:
        PlanFeatureKey,
    ) =>
      hasPlanFeature(
        features,
        feature,
      );


  const getLimit =
    (
      key: string,
    ) =>
      getPlanLimit(
        limits,
        key,
      );


  const isUnlimited =
    (
      key: string,
    ) =>
      isUnlimitedLimit(
        getLimit(
          key,
        ),
      );


  const formattedLimit =
    (
      key: string,
    ) =>
      formatPlanLimit(
        getLimit(
          key,
        ),
      );


  return {
    loading,

    data,

    planCode:
      data?.plan ??
      null,

    planName:
      data?.plan_name ??
      null,

    price:
      data?.price ??
      null,

    currency:
      data?.currency ??
      "INR",

    billingCycle:
      data?.billing_cycle ??
      null,

    hasSubscriptionAccess,

    isTrial:
      data?.is_trial ??
      false,

    features,

    limits,

    canAccess,

    hasFeature,

    getLimit,

    isUnlimited,

    formattedLimit,

    usersLimit:
      getLimit(
        "users",
      ),

    storageGbLimit:
      getLimit(
        "storage_gb",
      ),

    eventsLimit:
      getLimit(
        "events_per_month",
      ),

    watermarkPhotosLimit:
      getLimit(
        "watermark_photos",
      ),
  };
}
