"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import Link from "next/link";

import {
  getStudioBookingRequestDetails,
  updateStudioBookingRequestStatus,
} from "@/lib/api/marketplace/booking-requests";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Mail,
  Phone,
  UserRound,
  ArrowUpRight,
  CheckCircle2,
  ClipboardCheck,
  MessageCircle,
  Sparkles,
  Tag,
  UsersRound,
} from "lucide-react";


type LeadDetails = {
  id: string;

  status: string;

  created_at: string;

  order_id: string;

  order_number: string;

  order_type: string | null;

  order_status: string;

  total_amount: number;

  currency: string;

  requested_date: string | null;

  requested_start_time: string | null;

  requested_end_time: string | null;

  customer_message: string | null;

  customer: {
    id: string;

    full_name: string | null;

    first_name: string | null;

    last_name: string | null;

    email: string | null;

    phone: string | null;
  } | null;

  cancellation_reason: string | null;
  cancellation_note: string | null;
  cancellation_cancelled_by_profile_id: string | null;
  cancellation_cancelled_at: string | null;
};


function formatDate(
  value: string | null,
) {

  if (
    !value
  ) {
    return "Not specified";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );

}


export default function MarketplaceLeadDetailsPage() {

  const params =
    useParams<
      {
        leadId: string;
      }
    >();


  const leadId =
    params.leadId;

  const [
    lead,
    setLead,
  ] =
    useState<
      LeadDetails | null
    >(
      null,
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );

  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");
  const [statusNote, setStatusNote] = useState("");
  const [statusError, setStatusError] = useState("");


  useEffect(
    () => {

      const loadLead =
        async () => {

          try {

            const data =
              await getStudioBookingRequestDetails(
                leadId,
              );

            setStatusReason(
              data.cancellation_reason ?? "",
            );

            setStatusNote(
              data.cancellation_note ?? "",
            );

            setLead(
              {
                id:
                  data.booking_request_id,

                status:
                  data.status,

                created_at:
                  data.created_at,

                order_id:
                  data.order_id,

                order_number:
                  data.order_number,

                order_type:
                  data.order_type ?? null,

                order_status:
                  data.order_status,

                total_amount:
                  Number(
                    data.total_amount ??
                      0,
                  ),

                currency:
                  data.currency ??
                  "INR",

                requested_date:
                  data.requested_date,

                requested_start_time:
                  data.requested_start_time,

                requested_end_time:
                  data.requested_end_time,

                customer_message:
                  data.customer_message,

                customer:
                  data.customer_id
                    ? {
                        id:
                          data.customer_id,

                        full_name:
                          data.customer_full_name,

                        first_name:
                          data.customer_first_name,

                        last_name:
                          data.customer_last_name,

                        email:
                          null,

                        phone:
                          data.customer_phone,
                      }
                    : null,

                cancellation_reason:
                  data.cancellation_reason ?? null,

                cancellation_note:
                  data.cancellation_note ?? null,

                cancellation_cancelled_by_profile_id:
                  data.cancellation_cancelled_by_profile_id ?? null,

                cancellation_cancelled_at:
                  data.cancellation_cancelled_at ?? null,
              });


          } catch (error) {

            console.error(
              error,
            );

          } finally {

            setLoading(
              false,
            );

          }

        };


      void loadLead();

    },
    [
      leadId,
    ],
  );


    if (
      loading
    ) {

      return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-500 shadow-sm">
            Loading marketplace lead...
          </div>
        </div>
      );

    }


    if (!lead) {

      return (
        <div className="flex min-h-[420px] items-center justify-center">
          <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-500 shadow-sm">
            Unable to load marketplace lead.
          </div>
        </div>
      );

    }


    const handleStatusUpdate = async () => {
      if (!selectedStatus || updatingStatus) return;

      const isCancelled = selectedStatus === "cancelled";

      if (isCancelled && !statusReason.trim()) {
        setStatusError("Cancellation reason is required.");
        return;
      }

      if (
        isCancelled &&
        statusReason === "other" &&
        !statusNote.trim()
      ) {
        setStatusError(
          "Cancellation note is required when reason is Other.",
        );
        return;
      }

      try {
        setUpdatingStatus(true);
        setStatusError("");

        const updated = await updateStudioBookingRequestStatus(
          lead.id,
          selectedStatus as
            | "requested"
            | "reviewing"
            | "accepted"
            | "rejected"
            | "cancelled"
            | "completed",
          statusNote.trim() || null,
          isCancelled ? statusReason.trim() : null,
        );

        setLead((current) =>
          current
            ? {
                ...current,
                status:
                  updated?.status ??
                  selectedStatus,
              }
            : current,
        );

        setStatusNote("");
        setStatusReason("");
      } catch (error) {
        setStatusError(
          error instanceof Error
            ? error.message
            : "Unable to update booking status.",
        );
      } finally {
        setUpdatingStatus(false);
      }
    };

    const isCancelled = lead.status === "cancelled";

    const customerName =
      lead.customer?.full_name ||
      [
        lead.customer?.first_name,
        lead.customer?.last_name,
      ]
        .filter(Boolean)
        .join(" ") ||
      "Marketplace Customer";


    const serviceType =
      lead.order_type ||
      "Photography Service";


    const leadStatusLabel =
      lead.status
        .replaceAll("_", " ")
        .replace(/\s+/g, " ")
        .trim();


    const bookingTime =
      lead.requested_start_time &&
      lead.requested_end_time
        ? `${lead.requested_start_time.slice(0, 5)} – ${lead.requested_end_time.slice(0, 5)}`
        : "Time to be confirmed";


    const createClientParams =
      new URLSearchParams(
        {
          source:
            "marketplace",

          marketplaceLeadId:
            lead.id,

          marketplaceOrderId:
            lead.order_id,

          customerName,

          email:
            lead.customer?.email ??
            "",

          phone:
            lead.customer?.phone ??
            "",
        },
      );


    return (
      <div className="mx-auto max-w-7xl space-y-6">

        {/* ================================================== */}
        {/* TOP NAV */}
        {/* ================================================== */}

        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">

          <Link
            href="/dashboard/marketplace/leads"
            className="inline-flex w-fit items-center gap-2 text-sm font-semibold text-slate-500 transition hover:text-slate-950"
          >
            <ArrowLeft size={17} />
            Marketplace Leads
          </Link>

          <div className="flex items-center gap-2">

            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Marketplace booking
            </span>

            <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-bold capitalize text-slate-600">
              {leadStatusLabel}
            </span>

          </div>

        </div>


        {/* ================================================== */}
        {/* PREMIUM HERO */}
        {/* ================================================== */}

        <section className="relative overflow-hidden rounded-[32px] border border-slate-200 bg-white shadow-[0_12px_45px_rgb(15,23,42,0.06)]">

          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-violet-500 via-indigo-500 to-cyan-400" />

          <div className="p-7 lg:p-9">

            <div className="flex flex-col justify-between gap-7 lg:flex-row lg:items-start">

              <div className="flex gap-4">

                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">
                  <UserRound size={25} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-600">
                    AI Marketplace Workspace
                  </p>

                  <h1 className="mt-1 text-3xl font-bold tracking-tight text-slate-950">
                    {customerName}
                  </h1>

                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-slate-500">

                    <span>
                      Order {lead.order_number}
                    </span>

                    <span className="hidden text-slate-300 sm:inline">
                      •
                    </span>

                    <span>
                      {serviceType}
                    </span>

                  </div>

                </div>

              </div>


              <div className="rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 lg:min-w-[190px]">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Booking value
                </p>

                <p className="mt-1 text-2xl font-bold text-slate-950">
                  {new Intl.NumberFormat(
                    "en-IN",
                    {
                      style: "currency",
                      currency: lead.currency || "INR",
                      maximumFractionDigits: 0,
                    },
                  ).format(
                    Number(lead.total_amount ?? 0),
                  )}
                </p>

              </div>

            </div>


            {/* HERO METRICS */}

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">

              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <CalendarDays size={15} />
                  Event date
                </div>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {formatDate(lead.requested_date)}
                </p>

              </div>


              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Clock3 size={15} />
                  Event time
                </div>

                <p className="mt-2 text-sm font-bold text-slate-900">
                  {bookingTime}
                </p>

              </div>


              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <Tag size={15} />
                  Service
                </div>

                <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                  {serviceType}
                </p>

              </div>


              <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">

                <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
                  <ClipboardCheck size={15} />
                  Lead status
                </div>

                <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                  {leadStatusLabel}
                </p>

              </div>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* AI SUMMARY */}
        {/* ================================================== */}

        <section className="overflow-hidden rounded-[28px] border border-violet-100 bg-gradient-to-br from-violet-50 via-white to-indigo-50">

          <div className="flex flex-col gap-5 p-6 lg:flex-row lg:items-center lg:justify-between lg:p-7">

            <div className="flex gap-4">

              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-violet-600 shadow-sm">
                <Sparkles size={21} />
              </div>

              <div>

                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-600">
                  AI Lead Insight
                </p>

                <h2 className="mt-1 text-lg font-bold text-slate-950">
                  New marketplace opportunity from {customerName}
                </h2>

                <p className="mt-1 max-w-3xl text-sm leading-6 text-slate-600">
                  Review the booking requirements, confirm availability and move this lead through your studio pipeline.
                </p>

              </div>

            </div>


            <div className="shrink-0 rounded-xl bg-white px-4 py-3 text-center shadow-sm">

              <p className="text-[11px] font-bold uppercase tracking-wide text-slate-400">
                Recommended
              </p>

              <p className="mt-1 text-sm font-bold text-violet-700">
                Review & follow up
              </p>

            </div>

          </div>

        </section>


        {/* ================================================== */}
        {/* MAIN WORKSPACE */}
        {/* ================================================== */}

        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">


          {/* LEFT COLUMN */}

          <div className="space-y-6">


            {/* CUSTOMER */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.035)] lg:p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Customer
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Customer details
                  </h2>

                </div>

                <div className="rounded-xl bg-slate-100 p-2.5 text-slate-500">
                  <UserRound size={18} />
                </div>

              </div>


              <div className="mt-6 grid gap-3 sm:grid-cols-2">

                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">

                  <p className="text-xs font-medium text-slate-400">
                    Full name
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    {customerName}
                  </p>

                </div>


                {!isCancelled ? (
                  <>
                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">

                      <p className="text-xs font-medium text-slate-400">
                        Email
                      </p>

                      <div className="mt-1 flex items-center gap-2">

                        <Mail size={15} className="text-slate-400" />

                        <p className="truncate text-sm font-bold text-slate-900">
                          {lead.customer?.email || "Not available"}
                        </p>

                      </div>

                    </div>


                    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">

                      <p className="text-xs font-medium text-slate-400">
                        Phone
                      </p>

                      <div className="mt-1 flex items-center gap-2">

                        <Phone size={15} className="text-slate-400" />

                        <p className="text-sm font-bold text-slate-900">
                          {lead.customer?.phone || "Not available"}
                        </p>

                      </div>

                    </div>
                  </>
                ) : null}


                <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">

                  <p className="text-xs font-medium text-slate-400">
                    Source
                  </p>

                  <p className="mt-1 text-sm font-bold text-slate-900">
                    Marketplace
                  </p>

                </div>

              </div>

            </section>


            {/* BOOKING */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.035)] lg:p-7">

              <div className="flex items-center justify-between">

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Booking
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Event information
                  </h2>

                </div>

                <CalendarDays size={20} className="text-slate-400" />

              </div>


              <div className="mt-6 grid gap-4 sm:grid-cols-3">

                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Service type
                  </p>

                  <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                    {serviceType}
                  </p>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Event date
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {formatDate(lead.requested_date)}
                  </p>

                </div>


                <div className="rounded-2xl bg-slate-50 p-5">

                  <p className="text-xs font-semibold text-slate-400">
                    Duration
                  </p>

                  <p className="mt-2 text-sm font-bold text-slate-900">
                    {bookingTime}
                  </p>

                </div>

              </div>


              <div className="mt-4 rounded-2xl border border-slate-100 bg-white p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                  Order reference
                </p>

                <div className="mt-2 flex flex-wrap items-center justify-between gap-3">

                  <p className="text-sm font-bold text-slate-900">
                    {lead.order_number}
                  </p>

                  <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold capitalize text-slate-600">
                    {lead.order_status}
                  </span>

                </div>

              </div>

            </section>


            {/* REQUIREMENTS */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.035)] lg:p-7">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-amber-50 p-2.5 text-amber-600">
                  <MessageCircle size={18} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Customer requirements
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-slate-950">
                    Booking request
                  </h2>

                </div>

              </div>


              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-5">

                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {lead.customer_message ||
                    "No additional requirements were provided by the customer."}
                </p>

              </div>

            </section>

          </div>

          {isCancelled ? (
            <section className="rounded-[28px] border border-red-200 bg-red-50/60 p-6 shadow-[0_8px_30px_rgb(127,29,29,0.04)] lg:p-7">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-red-500">
                  Booking cancelled
                </p>

                <h2 className="mt-1 text-xl font-bold text-slate-950">
                  Cancellation details
                </h2>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-red-100 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Cancellation reason
                  </p>

                  <p className="mt-2 text-sm font-bold capitalize text-slate-900">
                    {statusReason ||
                      "Cancellation reason recorded"}
                  </p>
                </div>

                <div className="rounded-2xl border border-red-100 bg-white p-5">
                  <p className="text-xs font-semibold text-slate-400">
                    Cancellation note
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm font-medium leading-6 text-slate-700">
                    {statusNote || "No additional note provided."}
                  </p>
                </div>
              </div>
            </section>
          ) : null}

          {/* RIGHT COLUMN */}

          <aside className="space-y-6">


            {/* CONVERT */}

            <section className="overflow-hidden rounded-[28px] bg-slate-950 p-6 text-white shadow-[0_15px_45px_rgb(15,23,42,0.14)]">

              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-violet-300">
                <ArrowUpRight size={21} />
              </div>

              <p className="mt-5 text-xs font-bold uppercase tracking-[0.16em] text-white/50">
                Lead conversion
              </p>

              <h2 className="mt-2 text-xl font-bold">
                Ready to create this client?
              </h2>

              <p className="mt-3 text-sm leading-6 text-white/60">
                Carry the marketplace customer details directly into your studio client creation flow.
              </p>


              <Link
                href={`/dashboard/clients/create?${createClientParams.toString()}`}
                className="mt-6 inline-flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-white px-5 text-sm font-bold text-slate-950 transition hover:bg-slate-100"
              >
                Create Client
                <ArrowUpRight size={16} />
              </Link>

            </section>


            {/* LEAD MANAGEMENT */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.035)]">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-violet-50 p-2.5 text-violet-600">
                  <UsersRound size={18} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Lead management
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    Ownership
                  </h2>

                </div>

              </div>


              <div className="mt-5 space-y-3">

                <div className="rounded-2xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold text-slate-400">
                    Assigned team member
                  </p>

                  <div className="mt-2 flex items-center justify-between gap-3">

                    <span className="text-sm font-bold text-slate-900">
                      Unassigned
                    </span>

                    <span className="rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-500">
                      Assign
                    </span>

                  </div>

                </div>


                <div className="rounded-2xl bg-slate-50 p-4">

                  <p className="text-xs font-semibold text-slate-400">
                    Lead tags
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-bold text-violet-700">
                      Marketplace
                    </span>

                    <span className="rounded-full bg-slate-200 px-2.5 py-1 text-xs font-bold text-slate-600">
                      New lead
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* NEXT ACTION */}

            <section className="rounded-[28px] border border-slate-200 bg-white p-6">

              <div className="flex items-center gap-3">

                <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600">
                  <CheckCircle2 size={18} />
                </div>

                <div>

                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                    Next action
                  </p>

                  <h2 className="mt-1 text-lg font-bold text-slate-950">
                    Move lead forward
                  </h2>

                </div>

              </div>


              <div className="mt-5 space-y-2">

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                >
                  Review requirements
                  <ArrowUpRight size={15} />
                </button>

                <button
                  type="button"
                  className="flex w-full cursor-pointer items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:border-violet-200 hover:bg-violet-50"
                >
                  Contact customer
                  <Phone size={15} />
                </button>

              </div>

            </section>

          </aside>

        </div>


        {!isCancelled ? (
          <section className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-[0_8px_30px_rgb(15,23,42,0.035)] lg:p-7">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-400">
                Booking management
              </p>

              <h2 className="mt-1 text-xl font-bold text-slate-950">
                Update booking status
              </h2>

              <p className="mt-2 text-sm text-slate-500">
                Select a new booking status. Cancellation requires a valid reason.
              </p>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-3">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  Status
                </label>

                <select
                  value={selectedStatus}
                  onChange={(event) => {
                    setSelectedStatus(event.target.value);
                    setStatusError("");
                  }}
                  disabled={updatingStatus}
                  className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50"
                >
                  <option value="">
                    Select status
                  </option>
                  <option value="requested">
                    Requested
                  </option>
                  <option value="reviewing">
                    Reviewing
                  </option>
                  <option value="accepted">
                    Accepted
                  </option>
                  <option value="completed">
                    Completed
                  </option>
                  <option value="cancelled">
                    Cancelled
                  </option>
                  <option value="rejected">
                    Rejected
                  </option>
                </select>
              </div>

              {selectedStatus === "cancelled" ? (
                <div>
                  <label className="mb-2 block text-xs font-semibold text-slate-500">
                    Cancellation reason
                  </label>

                  <select
                    value={statusReason}
                    onChange={(event) => {
                      setStatusReason(event.target.value);
                      setStatusError("");
                    }}
                    disabled={updatingStatus}
                    className="h-12 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-800 outline-none focus:border-red-300 focus:ring-4 focus:ring-red-50"
                  >
                    <option value="">
                      Select reason
                    </option>
                    <option value="client_cancelled">
                      Client cancelled
                    </option>
                    <option value="studio_cancelled">
                      Studio cancelled
                    </option>
                    <option value="duplicate_booking">
                      Duplicate booking
                    </option>
                    <option value="event_postponed">
                      Event postponed
                    </option>
                    <option value="event_cancelled">
                      Event cancelled
                    </option>
                    <option value="payment_failed">
                      Payment failed
                    </option>
                    <option value="schedule_conflict">
                      Schedule conflict
                    </option>
                    <option value="other">
                      Other
                    </option>
                  </select>
                </div>
              ) : null}

              <div className={selectedStatus === "cancelled" ? "lg:col-span-3" : "lg:col-span-2"}>
                <label className="mb-2 block text-xs font-semibold text-slate-500">
                  {selectedStatus === "cancelled"
                    ? "Cancellation note"
                    : "Note (optional)"}
                </label>

                <textarea
                  value={statusNote}
                  onChange={(event) => {
                    setStatusNote(event.target.value);
                    setStatusError("");
                  }}
                  disabled={updatingStatus}
                  rows={3}
                  placeholder={
                    selectedStatus === "cancelled"
                      ? statusReason === "other"
                        ? "Cancellation note is required..."
                        : "Additional cancellation note (optional)"
                      : "Add a note about this status update..."
                  }
                  className="w-full resize-none rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-violet-300 focus:ring-4 focus:ring-violet-50"
                />
              </div>
            </div>

            {statusError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
                {statusError}
              </div>
            ) : null}

            <div className="mt-5 flex justify-end">
              <button
                type="button"
                onClick={() => void handleStatusUpdate()}
                disabled={
                  updatingStatus ||
                  !selectedStatus
                }
                className="inline-flex h-12 items-center justify-center rounded-xl bg-slate-950 px-6 text-sm font-bold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updatingStatus
                  ? "Updating..."
                  : "Update Status"}
              </button>
            </div>
          </section>
        ) : null}

        {/* ================================================== */}
        {/* FOOTER META */}
        {/* ================================================== */}

        <div className="flex flex-col justify-between gap-2 border-t border-slate-200 px-1 pt-5 text-xs text-slate-400 sm:flex-row">

          <span>
            Marketplace order {lead.order_number}
          </span>

          <span>
            Lead created {formatDate(lead.created_at)}
          </span>

        </div>

      </div>
    );
  }
