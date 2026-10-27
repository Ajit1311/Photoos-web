"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Globe2,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useBootstrapContext } from "@/context/BootstrapContext";
import {
  getConfirmedFreelancerContact,
  getMarketplaceFreelancer,
  getFreelancerBookingHistory,
  type ConfirmedFreelancerContact,
  type MarketplaceFreelancer,
  type FreelancerBookingHistory,
} from "@/lib/api/marketplace/freelancers";


export default function FreelancerDetailsPage() {
  const params = useParams();
  const freelancerId = String(params.freelancerId ?? "");
  const { data: bootstrap } = useBootstrapContext();

  const [freelancer, setFreelancer] =
    useState<MarketplaceFreelancer | null>(null);

  const [contact, setContact] =
    useState<ConfirmedFreelancerContact | null>(null);

  const [bookingHistory, setBookingHistory] =
    useState<FreelancerBookingHistory[]>([]);

  const [loading, setLoading] = useState(true);
  const [loadingBookingHistory, setLoadingBookingHistory] = useState(true);
  const [loadingContact, setLoadingContact] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function loadFreelancer() {
      try {
        setLoading(true);
        setError("");

        const data = await getMarketplaceFreelancer(freelancerId);

        if (active) {
          setFreelancer(data);
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
          setLoading(false);
        }
      }
    }

    if (freelancerId) {
      loadFreelancer();
    } else {
      setLoading(false);
      setError("Freelancer ID is missing.");
    }

    return () => {
      active = false;
    };
  }, [freelancerId]);

  useEffect(() => {
    let active = true;

    async function loadBookingHistory() {
      const studioId =
        bootstrap?.workspace?.membership?.studioId ?? "";

      if (!studioId || !freelancerId) {
        if (active) {
          setBookingHistory([]);
          setLoadingBookingHistory(false);
        }

        return;
      }

      try {
        setLoadingBookingHistory(true);

        const data = await getFreelancerBookingHistory({
          studioId,
          freelancerId,
        });

        if (active) {
          setBookingHistory(Array.isArray(data) ? data : []);
        }
      } catch {
        if (active) {
          setBookingHistory([]);
        }
      } finally {
        if (active) {
          setLoadingBookingHistory(false);
        }
      }
    }

    loadBookingHistory();

    return () => {
      active = false;
    };
  }, [
    bootstrap?.workspace?.membership?.studioId,
    freelancerId,
  ]);


  useEffect(() => {
    let active = true;

    async function loadConfirmedContact() {
      const studioId =
        bootstrap?.workspace?.membership?.studioId ?? "";

      if (!studioId || !freelancerId) {
        if (active) {
          setLoadingContact(false);
        }

        return;
      }

      try {
        setLoadingContact(true);

        const data =
          await getConfirmedFreelancerContact({
            studioId,
            freelancerId,
          });

        if (active) {
          setContact(data);
        }
      } catch {
        // Contact is intentionally unavailable until hiring is confirmed.
        if (active) {
          setContact(null);
        }
      } finally {
        if (active) {
          setLoadingContact(false);
        }
      }
    }

    loadConfirmedContact();

    return () => {
      active = false;
    };
  }, [
    bootstrap?.workspace?.membership?.studioId,
    freelancerId,
  ]);


  if (loading) {
    return (
      <main className="mx-auto max-w-[1200px] pb-12">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-20 text-center shadow-sm">
          <p className="text-sm font-medium text-slate-500">
            Loading freelancer profile...
          </p>
        </div>
      </main>
    );
  }

  if (error || !freelancer) {
    return (
      <main className="mx-auto max-w-[1200px] space-y-5 pb-12">
        <Link
          href="/dashboard/marketplace/freelancers"
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
        >
          <ArrowLeft size={16} />
          Back to Freelancers
        </Link>

        <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-20 text-center">
          <h1 className="text-lg font-bold text-red-800">
            Unable to load freelancer
          </h1>
          <p className="mt-2 text-sm text-red-700">
            {error || "Freelancer profile was not found."}
          </p>
        </div>
      </main>
    );
  }

  const location = [
    freelancer.location,
    freelancer.city,
    freelancer.state,
  ]
    .filter(Boolean)
    .join(", ");

  const skills = freelancer.skills ?? [];
  const availability =
    freelancer.availability_status === "available";

  return (
    <main className="mx-auto max-w-[1200px] space-y-6 pb-12">
      <Link
        href="/dashboard/marketplace/freelancers"
        className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-900"
      >
        <ArrowLeft size={16} />
        Back to Freelancers
      </Link>

      <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
        <div className="h-48 bg-gradient-to-br from-[#0A3F61] via-[#145B7D] to-slate-700" />

        <div className="-mt-16 px-6 pb-7 sm:px-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex h-28 w-28 shrink-0 items-center justify-center rounded-3xl border-4 border-white bg-slate-100 text-[#0A3F61] shadow-lg">
                <UserRound size={42} />
              </div>

              <div className="pb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-950">
                    {freelancer.display_name}
                  </h1>

                  <CheckCircle2
                    size={19}
                    className="text-emerald-600"
                  />
                </div>

                <p className="mt-1 font-semibold text-[#0A3F61]">
                  {freelancer.primary_role || "Creative Professional"}
                </p>

                <div className="mt-2 flex flex-wrap gap-4 text-sm text-slate-500">
                  <span className="flex items-center gap-1.5">
                    <MapPin size={15} />
                    {location || "Location not specified"}
                  </span>

                  <span className="flex items-center gap-1.5">
                    <Clock3 size={15} />
                    {freelancer.experience_years ?? 0} Years
                  </span>


                </div>
              </div>
            </div>

            <Link
              href={`/dashboard/marketplace/freelancers/${params.freelancerId}/hire`}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-[#08344f]"
            >
              <CalendarDays size={17} />
              Hire for Date
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-950">
              Booking History
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              Previous and current studio booking requests for this freelancer.
            </p>
          </div>

          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
            {bookingHistory.length} Booking{bookingHistory.length === 1 ? "" : "s"}
          </span>
        </div>

        <div className="mt-5">
          {loadingBookingHistory ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-400">
              Loading booking history...
            </div>
          ) : bookingHistory.length === 0 ? (
            <div className="rounded-xl bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
              No booking history available.
            </div>
          ) : (
            <div className="space-y-3">
              {bookingHistory.map((booking) => {
                const status = booking.status.toLowerCase();

                const statusClass =
                  status === "confirmed"
                    ? "bg-emerald-50 text-emerald-700"
                    : status === "rejected"
                      ? "bg-red-50 text-red-700"
                      : status === "cancelled"
                        ? "bg-amber-50 text-amber-700"
                        : status === "completed"
                          ? "bg-blue-50 text-blue-700"
                          : "bg-slate-100 text-slate-600";

                const bookingDate = new Date(
                  `${booking.booking_date}T00:00:00`,
                ).toLocaleDateString("en-IN", {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });

                const amount =
                  booking.total_amount ?? booking.agreed_amount;

                return (
                  <div
                    key={booking.hiring_id}
                    className="rounded-xl border border-slate-200 p-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">
                          {booking.studio_name}
                        </p>

                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-slate-500">
                          <span>
                            {bookingDate}
                          </span>

                          <span>
                            {booking.number_of_days} day
                            {booking.number_of_days === 1 ? "" : "s"}
                          </span>

                          {(booking.start_time || booking.end_time) && (
                            <span>
                              {booking.start_time?.slice(0, 5) ?? "--:--"}
                              {" – "}
                              {booking.end_time?.slice(0, 5) ?? "--:--"}
                            </span>
                          )}
                        </div>
                      </div>

                      <span
                        className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-bold capitalize ${statusClass}`}
                      >
                        {status}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Daily Rate
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {booking.daily_rate != null
                            ? `₹${booking.daily_rate.toLocaleString("en-IN")}`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Total Amount
                        </p>
                        <p className="mt-1 text-sm font-bold text-slate-800">
                          {amount != null
                            ? `${booking.currency || "INR"} ${amount.toLocaleString("en-IN")}`
                            : "—"}
                        </p>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Booking ID
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-slate-700">
                          {booking.hiring_id}
                        </p>
                      </div>
                    </div>

                    {booking.studio_note && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Studio Note
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.studio_note}
                        </p>
                      </div>
                    )}

                    {booking.freelancer_note && (
                      <div className="mt-3 rounded-lg bg-slate-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                          Freelancer Note
                        </p>
                        <p className="mt-1 text-sm text-slate-600">
                          {booking.freelancer_note}
                        </p>
                      </div>
                    )}

                    {booking.cancellation_reason && (
                      <div className="mt-3 rounded-lg bg-amber-50 p-3">
                        <p className="text-[11px] font-medium uppercase tracking-wide text-amber-600">
                          Cancellation Reason
                        </p>
                        <p className="mt-1 text-sm text-amber-800">
                          {booking.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>


      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-950">
            About Freelancer
          </h2>

          <p className="mt-3 text-sm leading-7 text-slate-600">
            {freelancer.bio || "Professional freelancer available for studio assignments and creative projects."}
          </p>

          <h3 className="mt-7 text-sm font-bold text-slate-900">
            Services
          </h3>

          <div className="mt-3 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>

          <h3 className="mt-7 text-sm font-bold text-slate-900">
            Portfolio
          </h3>

          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="aspect-square rounded-xl bg-gradient-to-br from-slate-100 to-slate-200"
              />
            ))}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Availability
            </h2>

            <div
              className={`mt-4 flex items-center gap-3 rounded-xl p-4 text-sm font-semibold ${
                availability
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-slate-100 text-slate-600"
              }`}
            >
              <CheckCircle2 size={18} />
              {availability
                ? "Available for new assignments"
                : freelancer.availability_status || "Currently unavailable"}
            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              Final availability is checked against the selected
              hiring date before a request is created.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-950">
              Contact
            </h2>

            <div className="mt-4 space-y-3 text-sm">
              {loadingContact ? (
                <p className="text-slate-400">
                  Checking contact access...
                </p>
              ) : contact ? (
                <>
                  <div className="flex items-center gap-3 text-slate-700">
                    <Phone
                      size={17}
                      className="text-[#0A3F61]"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Phone
                      </p>

                      <a
                        href={
                          contact.phone
                            ? `tel:${contact.phone}`
                            : undefined
                        }
                        className="font-semibold hover:text-[#0A3F61]"
                      >
                        {contact.phone || "Not provided"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-700">
                    <Mail
                      size={17}
                      className="text-[#0A3F61]"
                    />

                    <div>
                      <p className="text-xs text-slate-400">
                        Email
                      </p>

                      <a
                        href={
                          contact.email
                            ? `mailto:${contact.email}`
                            : undefined
                        }
                        className="font-semibold hover:text-[#0A3F61]"
                      >
                        {contact.email || "Not provided"}
                      </a>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    <Globe2 size={17} />
                    <span>Public social profile</span>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-slate-400">
                    <Phone size={17} />
                    <span>Available after confirmed hire</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-400">
                    <Mail size={17} />
                    <span>Available after confirmed hire</span>
                  </div>

                  <div className="flex items-center gap-3 text-slate-500">
                    <Globe2 size={17} />
                    <span>Public social profile</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
