"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  Check,
  ChevronRight,
  FileCheck2,
  Landmark,
  Loader2,
  LockKeyhole,
  Scale,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import {
  acceptCurrentMemberLegalCompliance,
  getCurrentMemberComplianceStatus,
} from "@/lib/api/legal-compliance";

import {
  getCurrentUser,
} from "@/lib/auth/auth.service";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";


type PageState =
  | "loading"
  | "ready"
  | "accepting"
  | "error";


const agreementHighlights = [
  {
    icon: Landmark,
    title: "Independent Business Responsibility",
    description:
      "Each studio operates as an independent business and remains responsible for its own operations, team, clients and decisions.",
  },
  {
    icon: Scale,
    title: "Studio and Client Relationships",
    description:
      "Contracts, payments, services, deliverables and disputes between a studio and its clients remain the responsibility of the involved parties.",
  },
  {
    icon: ShieldCheck,
    title: "Content and Data Responsibility",
    description:
      "Studios and authorised members are responsible for ensuring that uploaded content, permissions and data usage comply with applicable law.",
  },
];


export default function LegalCompliancePage() {

  const router =
    useRouter();


  const [
    accepted,
    setAccepted,
  ] =
    useState(
      false,
    );


  const [
    state,
    setState,
  ] =
    useState<PageState>(
      "loading",
    );


  const [
    studioId,
    setStudioId,
  ] =
    useState<
      string | null
    >(
      null,
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


  useEffect(
    () => {

      let cancelled =
        false;


      async function initialize() {

        try {

          const user =
            await getCurrentUser();


          if (!user) {

            router.replace(
              "/login",
            );

            return;

          }


          const membership =
            await resolveUserStudio();


          if (!membership) {

            throw new Error(
              "Unable to resolve your active studio membership.",
            );

          }


          const compliance =
            await getCurrentMemberComplianceStatus(
              membership.studioId,
            );


          /*
           * PhotoOS platform admins
           * do not require agreement acceptance.
           */
          if (
            compliance.is_photoos_admin ===
            true
          ) {

            router.replace(
              "/dashboard",
            );

            return;

          }


          /*
           * Member has already accepted
           * the current agreement.
           */
          if (
            compliance.compliance_required ===
              false ||
            compliance.is_compliant ===
              true
          ) {

            router.replace(
              "/dashboard",
            );

            return;

          }


          if (
            !cancelled
          ) {

            setStudioId(
              membership.studioId,
            );

            setState(
              "ready",
            );

          }

        } catch (
          error
        ) {

          console.error(
            "LEGAL COMPLIANCE INITIALIZATION ERROR:",
            error,
          );


          if (
            !cancelled
          ) {

            setError(
              error instanceof Error
                ? error.message
                : "Unable to load legal compliance requirements.",
            );

            setState(
              "error",
            );

          }

        }

      }


      initialize();


      return () => {

        cancelled =
          true;

      };

    },
    [
      router,
    ],
  );


  async function handleAccept() {

    if (
      !studioId
    ) {

      setError(
        "Unable to resolve your studio.",
      );

      return;

    }


    if (
      !accepted
    ) {

      setError(
        "Please confirm that you have read and accepted the agreement.",
      );

      return;

    }


    try {

      setError(
        null,
      );

      setState(
        "accepting",
      );


      await acceptCurrentMemberLegalCompliance(
        studioId,
      );


      router.replace(
        "/dashboard",
      );

    } catch (
      error
    ) {

      console.error(
        "LEGAL COMPLIANCE ACCEPTANCE ERROR:",
        error,
      );


      setError(
        error instanceof Error
          ? error.message
          : "Unable to save your acceptance. Please try again.",
      );


      setState(
        "ready",
      );

    }

  }


  if (
    state ===
    "loading"
  ) {

    return (
      <main className="relative min-h-screen overflow-hidden bg-slate-50">

        <div className="absolute inset-0">

          <div className="absolute left-[-10%] top-[-20%] h-[520px] w-[520px] rounded-full bg-sky-100/60 blur-3xl" />

          <div className="absolute bottom-[-25%] right-[-10%] h-[600px] w-[600px] rounded-full bg-blue-100/50 blur-3xl" />

        </div>


        <div className="relative flex min-h-screen items-center justify-center px-6">

          <div className="flex flex-col items-center">

            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">

              <Loader2 className="h-7 w-7 animate-spin text-[#0A3F61]" />

            </div>


            <h2 className="mt-6 text-xl font-semibold text-slate-900">

              Preparing your workspace

            </h2>


            <p className="mt-2 text-sm text-slate-500">

              Checking your workspace access requirements.

            </p>

          </div>

        </div>

      </main>
    );

  }


  if (
    state ===
    "error"
  ) {

    return (
      <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-50 px-6">

        <div className="absolute left-[-10%] top-[-20%] h-[500px] w-[500px] rounded-full bg-red-100/50 blur-3xl" />


        <div className="relative w-full max-w-lg rounded-[28px] border border-slate-200 bg-white p-8 shadow-2xl shadow-slate-200/70">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600">

            <ShieldCheck className="h-7 w-7" />

          </div>


          <h1 className="mt-6 text-2xl font-bold text-slate-900">

            Unable to verify access

          </h1>


          <p className="mt-3 text-sm leading-6 text-slate-500">

            {error}

          </p>


          <button
            type="button"
            onClick={() => window.location.reload()}
            className="mt-7 inline-flex items-center justify-center rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#083653]"
          >

            Try Again

          </button>

        </div>

      </main>
    );

  }


  return (
    <main className="relative min-h-screen overflow-hidden bg-[#F6F8FB]">


      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-12%] top-[-18%] h-[650px] w-[650px] rounded-full bg-sky-100/60 blur-3xl" />

        <div className="absolute right-[-12%] top-[15%] h-[520px] w-[520px] rounded-full bg-blue-100/50 blur-3xl" />

        <div className="absolute bottom-[-25%] left-[30%] h-[500px] w-[500px] rounded-full bg-indigo-100/40 blur-3xl" />

      </div>


      {/* Header */}

      <header className="relative border-b border-slate-200/80 bg-white/75 backdrop-blur-xl">

        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 lg:px-8">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0A3F61] shadow-lg shadow-blue-900/20">

              <Sparkles className="h-5 w-5 text-white" />

            </div>


            <div>

              <p className="text-lg font-bold tracking-tight text-slate-900">

                PhotoOS

              </p>

              <p className="text-xs text-slate-500">

                Workspace Access

              </p>

            </div>

          </div>


          <div className="hidden items-center gap-2 text-sm text-slate-500 sm:flex">

            <LockKeyhole className="h-4 w-4 text-emerald-600" />

            Secure agreement acceptance

          </div>

        </div>

      </header>


      <div className="relative mx-auto max-w-6xl px-6 py-10 lg:px-8 lg:py-16">


        {/* Hero */}

        <section className="mx-auto max-w-3xl text-center">

          <div className="inline-flex items-center gap-2 rounded-full border border-[#0A3F61]/10 bg-white px-4 py-2 text-xs font-semibold text-[#0A3F61] shadow-sm">

            <ShieldCheck className="h-4 w-4" />

            Workspace compliance required

          </div>


          <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">

            Before you enter your workspace

          </h1>


          <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-slate-500 sm:text-lg">

            Please review and accept the PhotoOS Legal Compliance Agreement.
            This confirms the responsibilities of your studio and its authorised members.

          </p>

        </section>


        {/* Progress */}

        <section className="mx-auto mt-10 max-w-3xl">

          <div className="flex items-center">

            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#0A3F61] text-sm font-bold text-white">

                1

              </div>

              <span className="text-sm font-semibold text-slate-900">

                Review

              </span>

            </div>


            <div className="mx-4 h-px flex-1 bg-slate-200" />


            <div className="flex items-center gap-3">

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-sm font-semibold text-slate-500">

                2

              </div>

              <span className="text-sm font-medium text-slate-400">

                Accept

              </span>

            </div>


            <div className="mx-4 hidden h-px flex-1 bg-slate-200 sm:block" />


            <div className="hidden items-center gap-3 sm:flex">

              <div className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white">

                <Check className="h-4 w-4 text-slate-400" />

              </div>

              <span className="text-sm font-medium text-slate-400">

                Enter Workspace

              </span>

            </div>

          </div>

        </section>


        <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">


          {/* Agreement */}

          <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-xl shadow-slate-200/50">


            <div className="border-b border-slate-100 px-6 py-6 sm:px-8">

              <div className="flex items-start gap-4">

                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">

                  <FileCheck2 className="h-6 w-6" />

                </div>


                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0A3F61]">

                    Legal agreement

                  </p>


                  <h2 className="mt-1 text-2xl font-bold tracking-tight text-slate-950">

                    Platform Responsibility Agreement

                  </h2>


                  <p className="mt-2 text-sm text-slate-500">

                    Version 1.0 · Currently active

                  </p>

                </div>

              </div>

            </div>


            <div className="space-y-8 px-6 py-8 sm:px-8">


              <div>

                <h3 className="text-lg font-bold text-slate-900">

                  Platform Responsibility

                </h3>


                <p className="mt-3 text-sm leading-7 text-slate-600">

                  PhotoOS provides software tools and infrastructure for photography
                  studios, studio teams, clients, projects, assets, communication
                  and workflow management.

                </p>

              </div>


              <div className="space-y-5">

                {
                  agreementHighlights.map(
                    ({
                      icon: Icon,
                      title,
                      description,
                    }) => (

                      <div
                        key={title}
                        className="rounded-2xl border border-slate-100 bg-slate-50/70 p-5 transition hover:border-slate-200 hover:bg-slate-50"
                      >

                        <div className="flex gap-4">

                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-[#0A3F61] shadow-sm">

                            <Icon className="h-5 w-5" />

                          </div>


                          <div>

                            <h3 className="font-bold text-slate-900">

                              {title}

                            </h3>


                            <p className="mt-2 text-sm leading-6 text-slate-600">

                              {description}

                            </p>

                          </div>

                        </div>

                      </div>

                    ),
                  )
                }

              </div>


              <div className="rounded-2xl border border-amber-100 bg-amber-50/70 p-5">

                <div className="flex gap-3">

                  <Scale className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" />


                  <p className="text-sm leading-6 text-amber-900">

                    PhotoOS is not a party to agreements, transactions, contracts
                    or arrangements between studios, team members, employees,
                    contractors or clients unless explicitly stated in a separate
                    written agreement.

                  </p>

                </div>

              </div>


              <div className="border-t border-slate-100 pt-7">

                <h3 className="text-lg font-bold text-slate-900">

                  Acceptance

                </h3>


                <p className="mt-3 text-sm leading-7 text-slate-600">

                  By accepting this agreement, you confirm that you have read,
                  understood and agreed to comply with the applicable PhotoOS
                  platform terms and legal compliance requirements.

                </p>

              </div>

            </div>

          </section>


          {/* Acceptance Panel */}

          <aside className="lg:sticky lg:top-8 lg:h-fit">

            <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50">


              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">

                <ShieldCheck className="h-6 w-6" />

              </div>


              <h2 className="mt-5 text-xl font-bold text-slate-950">

                Confirm your acceptance

              </h2>


              <p className="mt-3 text-sm leading-6 text-slate-500">

                Acceptance is recorded against your workspace membership and
                gives you access to your PhotoOS dashboard.

              </p>


              <label
                className={`mt-6 flex cursor-pointer gap-3 rounded-2xl border p-4 transition ${
                  accepted
                    ? "border-[#0A3F61] bg-blue-50/50"
                    : "border-slate-200 bg-slate-50 hover:border-slate-300"
                }`}
              >

                <input
                  type="checkbox"
                  checked={accepted}
                  onChange={
                    (
                      event,
                    ) => {

                      setAccepted(
                        event.target.checked,
                      );

                      setError(
                        null,
                      );

                    }
                  }
                  className="mt-0.5 h-5 w-5 rounded border-slate-300 text-[#0A3F61] focus:ring-[#0A3F61]"
                />


                <span className="text-sm leading-6 text-slate-700">

                  I have read and understood this agreement. I accept the
                  applicable platform terms and acknowledge the responsibilities
                  of my studio and authorised members.

                </span>

              </label>


              {
                error && (

                  <div className="mt-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700">

                    {error}

                  </div>

                )
              }


              <button
                type="button"
                onClick={handleAccept}
                disabled={
                  !accepted ||
                  state ===
                    "accepting"
                }
                className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-4 text-sm font-bold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#083653] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none"
              >

                {
                  state ===
                  "accepting"
                    ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />

                        Saving acceptance...

                      </>
                    )
                    : (
                      <>
                        Accept and Continue

                        <ChevronRight className="h-4 w-4" />

                      </>
                    )
                }

              </button>


              <div className="mt-6 border-t border-slate-100 pt-5">

                <div className="flex items-start gap-3">

                  <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />


                  <p className="text-xs leading-5 text-slate-400">

                    Your acceptance is securely recorded with your workspace
                    membership and the current agreement version.

                  </p>

                </div>

              </div>

            </div>


            <div className="mt-5 rounded-2xl border border-slate-200/80 bg-white/70 px-5 py-4 backdrop-blur">

              <div className="flex items-center gap-3">

                <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">

                  <FileCheck2 className="h-4 w-4" />

                </div>


                <div>

                  <p className="text-xs text-slate-400">

                    Agreement status

                  </p>


                  <p className="mt-0.5 text-sm font-semibold text-slate-700">

                    Version 1.0 · Published

                  </p>

                </div>

              </div>

            </div>

          </aside>

        </div>


        {/* Footer */}

        <footer className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-slate-200/70 pt-7 text-xs text-slate-400 sm:flex-row">

          <p>

            © {new Date().getFullYear()} PhotoOS. All rights reserved.

          </p>


          <div className="flex items-center gap-2">

            <LockKeyhole className="h-3.5 w-3.5" />

            Secure workspace access

          </div>

        </footer>

      </div>

    </main>
  );

}
