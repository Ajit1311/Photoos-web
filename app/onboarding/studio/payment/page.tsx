"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  CreditCard,
  Landmark,
  Smartphone,
} from "lucide-react";

import {
  useRouter,
  useSearchParams,
} from "next/navigation";

import {
  Suspense,
} from "react";

import {
  getSubscriptionPlans,
} from "@/lib/api/subscription/plans";

import { getSession } from "@/lib/auth/session";

import {
  bootstrapOnboardingStudio,
  createOnboardingSubscription,
  createOnboardingSubscriptionPayment,
} from "@/lib/api/onboarding/studio-subscription";

import type {
  SubscriptionPlan,
} from "@/types/subscription/plan";

import {
  verifySubscriptionPayment,
} from "@/lib/api/payments";

import {
  processSubscriptionPayment,
} from "@/lib/payments/subscription-payment-gateway";


type PaymentCategory =
  | "upi"
  | "net_banking"
  | "card"
  | null;


type UpiProvider =
  | "google_pay"
  | "phonepe"
  | "paytm"
  | "bhim_upi";


const UPI_PROVIDERS: Array<{
  id: UpiProvider;
  label: string;
  logo: string;
}> = [
  {
    id: "google_pay",
    label: "Google Pay",
    logo: "/payment/upi/google-pay.png",
  },
  {
    id: "phonepe",
    label: "PhonePe",
    logo: "/payment/upi/phonepe.png",
  },
  {
    id: "paytm",
    label: "Paytm",
    logo: "/payment/upi/paytm.png",
  },
  {
    id: "bhim_upi",
    label: "BHIM UPI",
    logo: "/payment/upi/bhim.png",
  },
];


function formatCurrency(
  amount: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    },
  ).format(amount);
}


function StudioOnboardingPaymentContent() {

  const router =
    useRouter();

  const searchParams =
    useSearchParams();


  const planId =
    searchParams.get("planId");

  const planCode =
    searchParams.get("planCode");

  const billingCycle =
    searchParams.get("billingCycle");

  const mode =
    searchParams.get("mode");


  const [
    plans,
    setPlans,
  ] =
    useState<SubscriptionPlan[]>([]);


  const [
    loadingPlan,
    setLoadingPlan,
  ] =
    useState(true);


  const [
    paymentCategory,
    setPaymentCategory,
  ] =
    useState<PaymentCategory>(
      null,
    );


  const [
    upiOpen,
    setUpiOpen,
  ] =
    useState(false);


  const [
    selectedUpiProvider,
    setSelectedUpiProvider,
  ] =
    useState<UpiProvider | null>(
      null,
    );


  const [
    processing,
    setProcessing,
  ] =
    useState(false);


  const [
    paymentError,
    setPaymentError,
  ] =
    useState<string | null>(
      null,
    );


  const [
    success,
    setSuccess,
  ] =
    useState(false);


  useEffect(
    () => {

      let mounted = true;

      async function loadPlans() {

        try {

          const result =
            await getSubscriptionPlans();

          if (mounted) {
            setPlans(result);
          }

        } catch (error) {

          console.error(
            "ONBOARDING PAYMENT PLAN LOAD ERROR:",
            error,
          );

        } finally {

          if (mounted) {
            setLoadingPlan(false);
          }

        }

      }

      void loadPlans();

      return () => {
        mounted = false;
      };

    },
    [],
  );


  const selectedPlan = (() => {
    const cycle = billingCycle === "yearly" ? "yearly" : "monthly";
    const needle = (planId || planCode || "").toLowerCase().replace("tier_", "").replace("plan_", "");

    if (needle) {
      // 1. Match with preferred billing cycle
      const cycleMatch = plans.find(
        (p) =>
          (p.id === planId ||
           p.plan_code.toLowerCase().includes(needle) ||
           p.name.toLowerCase().includes(needle)) &&
          p.billing_cycle === cycle,
      );
      if (cycleMatch) return cycleMatch;

      // 2. Any match with needle
      const anyMatch = plans.find(
        (p) =>
          p.id === planId ||
          p.plan_code.toLowerCase().includes(needle) ||
          p.name.toLowerCase().includes(needle),
      );
      if (anyMatch) return anyMatch;
    }

    // Default to first plan of matching cycle
    return plans.find((p) => p.billing_cycle === cycle) ?? plans[0] ?? null;
  })();

  // Trial safety guard: Free trial must never show payment page, redirect to legal compliance directly
  useEffect(() => {
    if (loadingPlan) return;
    const isTrial =
      mode === "trial" ||
      (selectedPlan && (selectedPlan.price === 0 || selectedPlan.trial_days > 0)) ||
      (planId && planId.toLowerCase().includes("trial")) ||
      (planCode && planCode.toLowerCase().includes("trial"));

    if (isTrial) {
      router.replace("/legal-compliance");
    }
  }, [loadingPlan, mode, selectedPlan, planId, planCode, router]);


  function handleBack() {

    router.push(
      `/onboarding/studio?planId=${encodeURIComponent(
        planId ?? "",
      )}&planCode=${encodeURIComponent(
        planCode ?? "",
      )}&billingCycle=${encodeURIComponent(
        billingCycle ?? "",
      )}`,
    );

  }


  async function handlePayment() {

    if (processing) {
      return;
    }


    if (!selectedPlan) {

      setPaymentError(
        "Selected plan could not be found.",
      );

      return;

    }


    if (!paymentCategory) {

      setPaymentError(
        "Please select a payment method.",
      );

      return;

    }


    setPaymentError(null);
    setProcessing(true);


    try {

      const session = await getSession();

      if (!session?.user) {
        throw new Error(
          "You must be signed in to complete payment.",
        );
      }


      /*
       * ---------------------------------------------------------------
       * 1. Resolve/create the user's studio workspace.
       * ---------------------------------------------------------------
       */

      const studio =
        await bootstrapOnboardingStudio();


      /*
       * ---------------------------------------------------------------
       * 2. Create the selected subscription.
       * ---------------------------------------------------------------
       */

      const subscription =
        await createOnboardingSubscription(
          studio.studio_id,
          selectedPlan.id,
        );


      /*
       * ---------------------------------------------------------------
       * 3. Create the payment record for this subscription.
       * ---------------------------------------------------------------
       */

      const payment =
        await createOnboardingSubscriptionPayment(
          subscription.id,
          Number(
            selectedPlan.price ?? 0,
          ),
        );


      /*
       * ---------------------------------------------------------------
       * 4. Process the gateway transaction.
       *
       * Local development currently uses the existing mock gateway.
       * The real provider can replace this later without changing
       * the onboarding database flow.
       * ---------------------------------------------------------------
       */

      const gatewayResult =
        await processSubscriptionPayment(
          {
            paymentId:
              payment.id,

            amount:
              Number(
                selectedPlan.price ?? 0,
              ),

            currency:
              selectedPlan.currency ??
              "INR",

            planName:
              selectedPlan.name ??
              selectedPlan.plan_code,

            paymentCategory:
              paymentCategory,
          },
        );


      if (
        !gatewayResult.success ||
        !gatewayResult.transactionId
      ) {

        throw new Error(
          gatewayResult.error ??
          "Payment could not be completed.",
        );

      }


      /*
       * ---------------------------------------------------------------
       * 5. Verify the gateway transaction in Supabase.
       * ---------------------------------------------------------------
       */

      await verifySubscriptionPayment(
        payment.id,
        gatewayResult.transactionId,
      );


      /*
       * ---------------------------------------------------------------
       * Payment is considered successful only after backend
       * verification succeeds.
       * ---------------------------------------------------------------
       */

      setSuccess(true);

    } catch (error) {

      console.error(
        "ONBOARDING PAYMENT ERROR:",
        error,
      );

      setPaymentError(
        error instanceof Error
          ? error.message
          : "Unable to process payment.",
      );

    } finally {

      setProcessing(false);

    }

  }


  function handleContinueAfterPayment() {

    router.replace(
      "/legal-compliance",
    );

  }


  if (loadingPlan) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
          Loading payment...
        </div>
      </main>
    );

  }


  if (!selectedPlan) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <section className="w-full max-w-md rounded-2xl border bg-card p-8 text-center">

          <h1 className="text-xl font-semibold">
            Plan not found
          </h1>

          <p className="mt-3 text-sm text-muted-foreground">
            Please go back and select a valid plan.
          </p>

          <button
            type="button"
            onClick={() =>
              router.push("/pricing")
            }
            className="mt-6 inline-flex h-11 items-center justify-center rounded-xl bg-[#0a3f61] px-6 text-sm font-semibold text-white hover:opacity-90"
          >
            Back to Plans
          </button>

        </section>
      </main>
    );

  }


  if (success) {

    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4 py-8">

        <section className="w-full max-w-lg rounded-2xl border bg-card p-8 text-center shadow-xl sm:p-10">

          <div className="flex justify-center">

            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0a3f61]/10">

              <CheckCircle2 className="h-10 w-10 text-[#0a3f61]" />

            </div>

          </div>

          <h1 className="mt-7 text-2xl font-semibold">
            Payment successful
          </h1>

          <p className="mt-4 text-sm leading-7 text-muted-foreground">
            Your payment has been completed successfully.
            Continue to legal compliance to unlock your PhotoOS workspace.
          </p>

          <button
            type="button"
            onClick={handleContinueAfterPayment}
            className="mt-8 inline-flex h-12 w-full items-center justify-center rounded-xl bg-[#0a3f61] px-6 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Continue to Legal Compliance
          </button>

        </section>

      </main>
    );

  }


  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(52,149,161,0.10),transparent_35%),linear-gradient(135deg,#f8fbfd_0%,#eef5f8_100%)]">

      <div className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6 lg:py-12 xl:max-w-4xl">

        <button
          type="button"
          onClick={handleBack}
          disabled={processing}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white/80 px-3 py-2 text-sm font-semibold text-slate-500 shadow-sm backdrop-blur transition-all hover:-translate-x-0.5 hover:border-[#3495a1]/30 hover:bg-white hover:text-[#0a3f61] disabled:opacity-50"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to Studio Details
        </button>


        <div className="mt-6 overflow-hidden rounded-[30px] border border-white/80 bg-white/95 p-6 shadow-[0_30px_80px_rgba(10,63,97,0.12)] backdrop-blur-xl sm:p-8 lg:p-10">

          <div className="relative overflow-hidden rounded-2xl border border-[#0a3f61]/10 bg-gradient-to-br from-[#0a3f61]/[0.045] via-white to-[#3495a1]/[0.055] p-5 pb-6 sm:p-6">

            <p className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
              Selected Plan
            </p>

            <div className="mt-3 flex items-center justify-between gap-5">

              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {selectedPlan.name}
              </h1>

              <div className="rounded-2xl bg-[#0a3f61] px-4 py-2 text-xl font-bold text-white shadow-lg shadow-[#0a3f61]/15">
                {formatCurrency(
                  Number(
                    selectedPlan.price ?? 0,
                  ),
                )}
              </div>

            </div>

            <p className="mt-3 inline-flex rounded-full bg-white px-3 py-1.5 text-xs font-semibold capitalize text-slate-500 shadow-sm ring-1 ring-slate-100">
              {billingCycle ??
                selectedPlan.billing_cycle}
            </p>

            {selectedPlan.trial_days > 0 && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
                {selectedPlan.trial_days} day free trial
              </p>
            )}

          </div>


          <div className="mt-8 rounded-2xl border border-slate-100 bg-slate-50/40 p-5 sm:p-6">

            <h2 className="text-base font-bold tracking-tight text-slate-900">
              Select payment method
            </h2>


            <div className="mt-4 grid gap-3">

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-[#3495a1]/30 hover:shadow-md">

                <button
                  type="button"
                  onClick={() => {
                    setPaymentCategory("upi");
                    setUpiOpen(
                      (value) => !value,
                    );
                    setPaymentError(null);
                  }}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left transition-all hover:bg-slate-50"
                >

                  <div className="flex items-center gap-4">

                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#0a3f61] shadow-sm">

                      <Smartphone className="h-5 w-5" />

                    </div>

                    <div>

                      <p className="font-semibold">
                        UPI
                      </p>

                      <p className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
                        Pay with your preferred UPI app
                      </p>

                    </div>

                  </div>

                  {upiOpen ? (
                    <ChevronUp className="h-5 w-5 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-5 w-5 text-muted-foreground" />
                  )}

                </button>


                {upiOpen && (

                  <div className="grid gap-3 border-t border-slate-100 bg-slate-50/70 p-4 sm:grid-cols-2">

                    {UPI_PROVIDERS.map(
                      (provider) => {

                        const selected =
                          selectedUpiProvider ===
                          provider.id;

                        return (
                          <button
                            key={provider.id}
                            type="button"
                            onClick={() => {
                              setSelectedUpiProvider(
                                provider.id,
                              );
                              setPaymentCategory(
                                "upi",
                              );
                              setPaymentError(null);
                            }}
                            className={`flex min-h-[76px] items-center justify-between gap-4 rounded-xl border p-4 text-left transition-all ${
                              selected
                                ? "border-2 border-[#0a3f61] bg-[#0a3f61]/5 shadow-sm"
                                : "border bg-card hover:border-[#0a3f61]/40 hover:bg-muted/40"
                            }`}
                          >

                            <div className="flex min-w-0 items-center gap-4">
                              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border bg-white p-2">
                                <img
                                  src={provider.logo}
                                  alt={`${provider.label} logo`}
                                  className="max-h-8 max-w-8 object-contain"
                                />
                              </div>

                              <span className="font-semibold text-foreground">
                                {provider.label}
                              </span>
                            </div>

                            {selected && (
                              <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#0a3f61]">
                                <Check className="h-4 w-4 text-white" />
                              </div>
                            )}

                          </button>
                        );

                      },
                    )}

                  </div>

                )}

              </div>


              <button
                type="button"
                onClick={() => {
                  setPaymentCategory(
                    "net_banking",
                  );
                  setUpiOpen(false);
                  setSelectedUpiProvider(null);
                  setPaymentError(null);
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  paymentCategory ===
                  "net_banking"
                    ? "border-[#0a3f61] bg-[#0a3f61]/5"
                    : "hover:bg-muted/40"
                }`}
              >

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#0a3f61] shadow-sm">

                  <Landmark className="h-5 w-5" />

                </div>

                <div>

                  <p className="font-semibold">
                    Net Banking
                  </p>

                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
                    Pay securely using your bank account
                  </p>

                </div>

                {paymentCategory ===
                  "net_banking" && (
                  <Check className="ml-auto h-5 w-5 text-[#0a3f61]" />
                )}

              </button>


              <button
                type="button"
                onClick={() => {
                  setPaymentCategory("card");
                  setUpiOpen(false);
                  setSelectedUpiProvider(null);
                  setPaymentError(null);
                }}
                className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition-colors ${
                  paymentCategory ===
                  "card"
                    ? "border-[#0a3f61] bg-[#0a3f61]/5"
                    : "hover:bg-muted/40"
                }`}
              >

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-slate-100 bg-slate-50 text-[#0a3f61] shadow-sm">

                  <CreditCard className="h-5 w-5" />

                </div>

                <div>

                  <p className="font-semibold">
                    Debit / Credit Card
                  </p>

                  <p className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
                    Pay using your debit or credit card
                  </p>

                </div>

                {paymentCategory ===
                  "card" && (
                  <Check className="ml-auto h-5 w-5 text-[#0a3f61]" />
                )}

              </button>

            </div>

          </div>


          {paymentError && (

            <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600 shadow-sm">
              {paymentError}
            </div>

          )}


          <button
            type="button"
            onClick={handlePayment}
            disabled={processing}
            className="mt-7 h-13 w-full rounded-2xl bg-[#0a3f61] px-6 text-sm font-bold text-white shadow-[0_14px_32px_rgba(10,63,97,0.22)] transition-all hover:-translate-y-0.5 hover:bg-[#083650] hover:shadow-[0_18px_38px_rgba(10,63,97,0.28)] disabled:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {processing
              ? "Processing Payment..."
              : `Pay ${formatCurrency(
                  Number(
                    selectedPlan.price ?? 0,
                  ),
                )}`}
          </button>

        </div>

      </div>

    </main>
  );
}


export default function StudioOnboardingPaymentPage() {

  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
            Loading payment...
          </div>
        </main>
      }
    >
      <StudioOnboardingPaymentContent />
    </Suspense>
  );

}
