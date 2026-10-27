"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  IndianRupee,
  Send,
} from "lucide-react";
import { useEffect, useState } from "react";

import { useBootstrapContext } from "@/context/BootstrapContext";
import {
  getMarketplaceFreelancer,
  requestFreelancerHire,
  type MarketplaceFreelancer,
} from "@/lib/api/marketplace/freelancers";

export default function HireFreelancerPage() {
  const params = useParams();
  const { data: bootstrap } = useBootstrapContext();

  const [freelancer, setFreelancer] =
    useState<MarketplaceFreelancer | null>(null);

  const [loadingFreelancer, setLoadingFreelancer] =
    useState(true);

  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [numberOfDays, setNumberOfDays] = useState(1);
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadFreelancer() {
      try {
        setLoadingFreelancer(true);

        const data = await getMarketplaceFreelancer(
          String(params.freelancerId ?? ""),
        );

        if (!active) {
          return;
        }

        setFreelancer(data);

        const minimumDays = Math.max(
          1,
          data.minimum_booking_days ?? 1,
        );

        setNumberOfDays(minimumDays);

        if (data.daily_rate !== null) {
          setAmount(
            String(
              Number(data.daily_rate) * minimumDays,
            ),
          );
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load freelancer profile.",
          );
        }
      } finally {
        if (active) {
          setLoadingFreelancer(false);
        }
      }
    }

    if (params.freelancerId) {
      loadFreelancer();
    } else {
      setLoadingFreelancer(false);
      setError("Freelancer ID is missing.");
    }

    return () => {
      active = false;
    };
  }, [params.freelancerId]);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();

    setError("");
    setSuccess(false);

    const freelancerId = String(
      params.freelancerId ?? "",
    );

    const studioId =
      bootstrap?.workspace?.membership?.studioId ?? "";

    if (!freelancerId) {
      setError("Freelancer ID is missing.");
      return;
    }

    if (!studioId) {
      setError(
        "Studio information is not available. Please refresh and try again.",
      );
      return;
    }

    if (!date) {
      setError("Please select an assignment date.");
      return;
    }

    const minimumBookingDays = Math.max(
      1,
      freelancer?.minimum_booking_days ?? 1,
    );

    if (numberOfDays < minimumBookingDays) {
      setError(
        `Minimum booking duration is ${minimumBookingDays} day(s).`,
      );
      return;
    }

    if (
      startTime &&
      endTime &&
      endTime <= startTime
    ) {
      setError(
        "End time must be later than start time.",
      );
      return;
    }

    const agreedAmount =
      amount.trim() === ""
        ? null
        : Number(amount);

    if (
      agreedAmount !== null &&
      (!Number.isFinite(agreedAmount) ||
        agreedAmount < 0)
    ) {
      setError("Please enter a valid agreed amount.");
      return;
    }

    setSubmitting(true);

    try {
      await requestFreelancerHire({
        studio_id: studioId,
        freelancer_id: freelancerId,
        booking_date: date,
        start_time: startTime || null,
        end_time: endTime || null,
        studio_note: note.trim() || null,
        number_of_days: numberOfDays,
        agreed_amount: agreedAmount,
      });

      setSuccess(true);

      setDate("");
      setStartTime("");
      setEndTime("");
      setAmount("");
      setNote("");
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Failed to send hiring request.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="mx-auto max-w-[900px] space-y-6 pb-12">
      <Link
        href={`/dashboard/marketplace/freelancers/${params.freelancerId}`}
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Freelancer Profile
      </Link>

      <section>
        <h1 className="text-2xl font-bold text-slate-950 sm:text-3xl">
          Hire Freelancer
        </h1>

        <p className="mt-2 text-sm text-slate-500">
          Select the assignment date and commercial details.
        </p>
      </section>

      {success && (
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm leading-6 text-emerald-800">
          <div className="flex items-start gap-3">
            <CheckCircle2
              size={19}
              className="mt-0.5 shrink-0"
            />

            <div>
              <p className="font-bold">
                Hiring request sent successfully.
              </p>

              <p className="mt-1">
                The freelancer has been notified by email.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm leading-6 text-red-700">
          {error}
        </div>
      )}

      {loadingFreelancer ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-500 shadow-sm">
          Loading freelancer details...
        </div>
      ) : freelancer ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Freelancer
              </p>

              <h2 className="mt-1 text-lg font-bold text-slate-950">
                {freelancer.display_name}
              </h2>

              <p className="mt-1 text-sm text-[#0A3F61]">
                {freelancer.primary_role || "Creative Professional"}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-sm">
              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Daily Rate
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {freelancer.currency || "INR"}{" "}
                  {freelancer.daily_rate ?? 0}
                </p>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3">
                <p className="text-xs text-slate-500">
                  Minimum Days
                </p>
                <p className="mt-1 font-bold text-slate-900">
                  {Math.max(
                    1,
                    freelancer.minimum_booking_days ?? 1,
                  )}
                </p>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      <form
        onSubmit={submit}
        className="space-y-6"
      >
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0A3F61]/10 text-[#0A3F61]">
              <CalendarDays size={19} />
            </div>

            <div>
              <h2 className="font-bold text-slate-950">
                Assignment Date
              </h2>

              <p className="text-xs text-slate-500">
                Final availability is checked by the backend
                when the hiring request is submitted.
              </p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <label className="md:col-span-1">
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Date
              </span>

              <input
                required
                type="date"
                value={date}
                onChange={(event) =>
                  setDate(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0A3F61]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                Start Time
              </span>

              <input
                type="time"
                value={startTime}
                onChange={(event) =>
                  setStartTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0A3F61]"
              />
            </label>

            <label>
              <span className="mb-2 block text-sm font-semibold text-slate-700">
                End Time
              </span>

              <input
                type="time"
                value={endTime}
                onChange={(event) =>
                  setEndTime(event.target.value)
                }
                className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0A3F61]"
              />
            </label>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="font-bold text-slate-950">
            Commercial Details
          </h2>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Number of Days
            </span>

            <input
              required
              type="number"
              min={Math.max(
                1,
                freelancer?.minimum_booking_days ?? 1,
              )}
              value={numberOfDays}
              onChange={(event) => {
                const days = Math.max(
                  Math.max(
                    1,
                    freelancer?.minimum_booking_days ?? 1,
                  ),
                  Number(event.target.value) || 1,
                );

                setNumberOfDays(days);

                if (freelancer?.daily_rate !== null) {
                  setAmount(
                    String(
                      Number(freelancer?.daily_rate ?? 0) *
                        days,
                    ),
                  );
                }
              }}
              className="h-11 w-full rounded-xl border border-slate-200 px-3 text-sm outline-none focus:border-[#0A3F61]"
            />

            <p className="mt-2 text-xs text-slate-500">
              Minimum booking duration:{" "}
              {Math.max(
                1,
                freelancer?.minimum_booking_days ?? 1,
              )}{" "}
              day(s).
            </p>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Agreed Amount
            </span>

            <div className="relative">
              <IndianRupee
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="number"
                min="0"
                value={amount}
                onChange={(event) =>
                  setAmount(event.target.value)
                }
                placeholder="Enter amount"
                className="h-11 w-full rounded-xl border border-slate-200 pl-9 pr-3 text-sm outline-none focus:border-[#0A3F61]"
              />
            </div>
          </label>

          <label className="mt-5 block">
            <span className="mb-2 block text-sm font-semibold text-slate-700">
              Studio Note
            </span>

            <textarea
              rows={5}
              value={note}
              onChange={(event) =>
                setNote(event.target.value)
              }
              placeholder="Tell the freelancer about the assignment..."
              className="w-full rounded-xl border border-slate-200 p-3 text-sm outline-none focus:border-[#0A3F61]"
            />
          </label>
        </section>

        <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4 text-sm leading-6 text-blue-800">
          <div className="flex gap-3">
            <Clock3
              size={18}
              className="mt-0.5 shrink-0"
            />

            <p>
              This will create a freelancer hiring request.
              The freelancer&apos;s private phone and email
              remain hidden until the hiring is confirmed.
            </p>
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting || loadingFreelancer || !freelancer}
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#08344f] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? (
            <>
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
              Sending Request...
            </>
          ) : (
            <>
              <Send size={17} />
              Send Hiring Request
            </>
          )}
        </button>
      </form>
    </main>
  );
}
