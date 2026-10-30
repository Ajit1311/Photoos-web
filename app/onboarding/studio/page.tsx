"use client";

import {
  Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Building2, MapPin, Phone, User, Mail } from "lucide-react";
import { getSession, getAccessToken } from "@/lib/auth/session";
import { getBootstrap } from "@/lib/api/bootstrap";
import { updateStudioProfile } from "@/lib/api/studio-profile";
import {
  bootstrapOnboardingStudio,
  createOnboardingSubscription,
} from "@/lib/api/onboarding/studio-subscription";
import { supabaseUrl } from "@/lib/supabase/config";

type StudioForm = {
  fullName: string;
  phone: string;
  email: string;
  studioName: string;
  location: string;
};

function OnboardingStudioPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const planId = searchParams.get("planId");
  const planCode = searchParams.get("planCode");
  const billingCycle = searchParams.get("billingCycle");
  const mode = searchParams.get("mode");

  const isTrial =
    mode === "trial" ||
    !planId ||
    planId.toLowerCase().includes("trial") ||
    planCode?.toLowerCase().includes("trial");

  const [form, setForm] = useState<StudioForm>({
    fullName: "",
    phone: "",
    email: "",
    studioName: "",
    location: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadUser() {
      try {
        const session = await getSession();
        const user = session?.user ?? null;

        if (!user) {
          const nextParams = new URLSearchParams({
            planId: planId ?? "",
            planCode: planCode ?? "",
            billingCycle: billingCycle ?? "",
          });

          if (mode === "trial") {
            nextParams.set("mode", "trial");
          }

          const nextPath =
            `/onboarding/studio?${nextParams.toString()}`;

          router.replace(
            `/login?next=${encodeURIComponent(nextPath)}`,
          );
          return;
        }

        if (!cancelled) {
          setForm((current) => ({
            ...current,
            email: user.email ?? "",
          }));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load your account.",
          );
          setLoading(false);
        }
      }
    }

    loadUser();

    return () => {
      cancelled = true;
    };
  }, [router, planId, planCode, billingCycle, mode]);

  function updateField(
    field: keyof StudioForm,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function completeStudioAndRoute(skipped = false) {
    setSubmitting(true);
    setError(null);

    try {
      const session = await getSession();
      if (!session?.user) {
        router.replace("/login");
        return;
      }

      // 1. Resolve or bootstrap studio workspace
      let studioId: string | null = null;
      try {
        const bootstrap = await getBootstrap();
        studioId = bootstrap?.workspace?.studio?.id ?? null;
      } catch (bootErr) {
        console.warn("[Onboarding] Bootstrap check notice:", bootErr);
      }

      if (!studioId) {
        try {
          const res = await bootstrapOnboardingStudio();
          studioId = res.studio_id;
        } catch (bootErr2) {
          console.warn("[Onboarding] Studio bootstrap fallback:", bootErr2);
        }
      }

      if (!studioId) {
        throw new Error("Unable to establish your studio workspace. Please retry.");
      }

      // 2. If details were entered and not skipped, update studio profile
      const hasDetails =
        form.fullName.trim() ||
        form.phone.trim() ||
        form.email.trim() ||
        form.studioName.trim() ||
        form.location.trim();

      if (!skipped && hasDetails) {
        try {
          await updateStudioProfile(studioId, {
            name: form.studioName.trim() || "My Studio",
            owner_name: form.fullName.trim() || "Studio Owner",
            contact_email: form.email.trim() || session.user.email,
            contact_phone: form.phone.trim(),
            city: form.location.trim(),
          });
        } catch (profileErr) {
          console.warn("[Onboarding] Profile update notice:", profileErr);
        }
      }

      // 3. Subscription Routing
      if (isTrial) {
        // Free Trial: Create/activate exactly 7-day trial in database, redirect to /dashboard
        try {
          await createOnboardingSubscription(studioId, "photoos_free_trial_7_day");
        } catch (subErr) {
          console.warn("[Onboarding] Trial subscription setup notice:", subErr);
        }
        router.replace("/dashboard");
        return;
      }

      // Paid Plan: Create subscription, redirect to Payment page
      if (planId) {
        try {
          await createOnboardingSubscription(studioId, planId);
        } catch (subErr) {
          console.warn("[Onboarding] Paid subscription init notice:", subErr);
        }

        const params = new URLSearchParams({
          planId,
          planCode: planCode ?? "",
          billingCycle: billingCycle ?? "monthly",
          fullName: form.fullName,
          phone: form.phone,
          email: form.email,
          studioName: form.studioName,
          location: form.location,
        });

        router.push(`/onboarding/studio/payment?${params.toString()}`);
        return;
      }

      // Default fallback if no plan specified: Free trial directly to dashboard
      try {
        await createOnboardingSubscription(studioId, "photoos_free_trial_7_day");
      } catch {
        // ignored
      }
      router.replace("/dashboard");
    } catch (err) {
      console.error("[Onboarding] Error during studio setup:", err);
      setError(err instanceof Error ? err.message : "Unable to save studio details.");
      setSubmitting(false);
    }
  }

  function continueToPayment() {
    void completeStudioAndRoute(false);
  }

  function skipInformation() {
    void completeStudioAndRoute(true);
  }


  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-9 w-9 animate-spin rounded-full border-4 border-muted border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Preparing your account...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f9fc]">
      <div className="grid min-h-screen lg:grid-cols-[42%_58%]">

        {/* LEFT BRAND PANEL */}
        <section className="relative hidden overflow-hidden bg-[#071f32] lg:flex">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,149,161,0.28),transparent_34%),radial-gradient(circle_at_85%_75%,rgba(10,63,97,0.9),transparent_45%)]" />

          <div className="relative z-10 flex w-full flex-col justify-between p-12 xl:p-16">

            <div>
              <img
                src="/photoos-login-logo.png"
                alt="PhotoOS"
                className="h-auto w-[190px] object-contain brightness-0 invert"
              />
            </div>

            <div className="max-w-lg">
              <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold tracking-[0.18em] text-white/80 backdrop-blur">
                STUDIO ONBOARDING
              </div>

              <h2 className="text-4xl font-semibold leading-tight text-white xl:text-5xl">
                Let’s build your
                <span className="block bg-gradient-to-r from-[#7dd3fc] via-[#5eead4] to-white bg-clip-text text-transparent">
                  PhotoOS workspace.
                </span>
              </h2>

              <p className="mt-6 max-w-md text-base leading-7 text-white/65">
                Add your studio details once and get everything ready for
                managing events, clients, galleries and your photography
                business from one place.
              </p>

              <div className="mt-10 space-y-4">

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <Building2 className="h-5 w-5 text-[#7dd3fc]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Your studio identity
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Keep your business information organized.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <User className="h-5 w-5 text-[#5eead4]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      One connected workspace
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Your team and studio operations stay connected.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10">
                    <MapPin className="h-5 w-5 text-[#93c5fd]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Ready for your business
                    </p>
                    <p className="mt-1 text-xs text-white/50">
                      Start with the details you already have.
                    </p>
                  </div>
                </div>

              </div>
            </div>

            <p className="text-xs text-white/35">
              © 2026 PhotoOS · Made with ❤️ in India
            </p>
          </div>
        </section>

        {/* RIGHT FORM PANEL */}
        <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:px-12 xl:px-20">
          <div className="w-full max-w-2xl">

            <div className="mb-6 flex justify-center lg:hidden">
              <img
                src="/photoos-login-logo.png"
                alt="PhotoOS"
                className="h-auto w-[175px] object-contain"
              />
            </div>

            <div className="rounded-[28px] border border-slate-200/80 bg-white/95 p-6 shadow-[0_25px_70px_rgba(10,63,97,0.10)] backdrop-blur sm:p-8 xl:p-10">

              {/* HEADER */}
              <div className="mb-8">

                <div className="mb-5 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-[#3495a1]/15 to-[#0a3f61]/10">
                      <Building2 className="h-5 w-5 text-[#0a3f61]" />
                    </div>

                    <div>
                      <p className="text-[11px] font-bold tracking-[0.16em] text-[#3495a1]">
                        STUDIO SETUP
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        Step 1 of 2
                      </p>
                    </div>
                  </div>

                  <div className="rounded-full border border-[#0a3f61]/10 bg-[#0a3f61]/5 px-3 py-1.5 text-xs font-semibold capitalize text-[#0a3f61]">
                    {mode === "trial"
                      ? "Free Trial"
                      : planCode?.replaceAll("_", " ") || "Studio Plan"}
                  </div>
                </div>

                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
                  Tell us about your studio
                </h1>

                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-500">
                  Add your details now or skip and complete them later from
                  your dashboard.
                </p>

                {billingCycle ? (
                  <div className="mt-4 inline-flex items-center rounded-lg bg-slate-50 px-3 py-2 text-xs font-medium capitalize text-slate-500">
                    Billing cycle:
                    <span className="ml-1 font-semibold text-slate-700">
                      {billingCycle}
                    </span>
                  </div>
                ) : null}
              </div>

              {error ? (
                <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              ) : null}

              {/* FORM */}
              <div className="grid gap-5 sm:grid-cols-2">

                <Field
                  icon={<User className="h-4 w-4" />}
                  label="Full name"
                  value={form.fullName}
                  onChange={(value) =>
                    updateField("fullName", value)
                  }
                  placeholder="Your full name"
                />

                <Field
                  icon={<Phone className="h-4 w-4" />}
                  label="Phone number"
                  value={form.phone}
                  onChange={(value) =>
                    updateField("phone", value)
                  }
                  placeholder="+91"
                  type="tel"
                />

                <div className="sm:col-span-2">
                  <Field
                    icon={<Mail className="h-4 w-4" />}
                    label="Email"
                    value={form.email}
                    onChange={(value) =>
                      updateField("email", value)
                    }
                    placeholder="you@example.com"
                    type="email"
                  />
                </div>

                <Field
                  icon={<Building2 className="h-4 w-4" />}
                  label="Studio name"
                  value={form.studioName}
                  onChange={(value) =>
                    updateField("studioName", value)
                  }
                  placeholder="Your studio name"
                />

                <Field
                  icon={<MapPin className="h-4 w-4" />}
                  label="Studio location"
                  value={form.location}
                  onChange={(value) =>
                    updateField("location", value)
                  }
                  placeholder="City, State"
                />

              </div>

              {/* ACTIONS */}
              <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row">

                <button
                  type="button"
                  onClick={skipInformation}
                  disabled={submitting}
                  className="h-12 flex-1 rounded-xl border border-slate-200 bg-white px-6 text-sm font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-60"
                >
                  Skip for now
                </button>

                <button
                  type="button"
                  onClick={continueToPayment}
                  disabled={submitting}
                  className="h-12 flex-1 rounded-xl bg-[#0a3f61] px-6 text-sm font-semibold text-white shadow-[0_10px_25px_rgba(10,63,97,0.20)] transition hover:-translate-y-0.5 hover:bg-[#083650] disabled:translate-y-0 disabled:opacity-60"
                >
                  {submitting
                    ? "Starting..."
                    : isTrial
                      ? "Start Free Trial"
                      : "Continue to Payment"}
                </button>

              </div>

              <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">
                Your information is used only to set up your PhotoOS studio workspace.
              </p>

            </div>

            <p className="mt-6 text-center text-xs text-slate-400 lg:hidden">
              © 2026 PhotoOS · Made with ❤️ in India
            </p>

          </div>
        </section>

      </div>
    </main>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-xs font-semibold text-slate-700">
        {icon}
        {label}
      </span>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
        className="h-12 w-full rounded-xl border border-slate-200 bg-slate-50/60 px-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 hover:border-slate-300 focus:border-[#3495a1] focus:bg-white focus:ring-4 focus:ring-[#3495a1]/10"
      />
    </label>
  );
}


export default function OnboardingStudioPageWrapper() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-screen items-center justify-center">
          <div className="text-sm text-muted-foreground">
            Loading...
          </div>
        </main>
      }
    >
      <OnboardingStudioPage />
    </Suspense>
  );
}
