"use client";

import {
  useEffect,
  useState,
} from "react";

import Link from "next/link";
import PlanFeatureGate from "@/components/subscription/PlanFeatureGate";

import {
  getStudioBookingRequests,
} from "@/lib/api/marketplace/booking-requests";

import {
  ArrowLeft,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  Mail,
  Phone,
  Store,
  UserRound,
  Search,
  SlidersHorizontal,
  X,
  Sparkles,
  ArrowUpRight,
} from "lucide-react";


type MarketplaceLead = {
  id: string;
  status: string;
  created_at: string;

  order_id: string;
  order_number: string;
  order_status: string;

  total_amount: number;
  currency: string;

  requested_date: string | null;
  requested_start_time: string | null;
  requested_end_time: string | null;

  customer_message: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  event_type?: string | null;
  venue?: string | null;
  guest_count?: number | null;
  budget?: number | null;
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
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(
      value,
    ),
  );

}



function normalizeStatus(
  status: string | null | undefined,
) {
  const value = String(status ?? "")
    .trim()
    .toLowerCase();

  if (
    value === "requested" ||
    value === "pending"
  ) {
    return "pending";
  }

  return value || "pending";
}

function formatAmount(
  amount: number | null | undefined,
  currency = "INR",
) {
  const value = Number(amount ?? 0);

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 0,
    },
  ).format(
    Number.isFinite(value) ? value : 0,
  );
}

const serviceTypes = [
  "Photography",
  "Videography",
  "Wedding Photography",
  "Pre-Wedding Photography",
  "Event Photography",
  "Portrait Photography",
  "Other",
];

function getStatusClasses(
  status: string | null | undefined,
) {
  switch (
    normalizeStatus(status)
  ) {
    case "accepted":
    case "confirmed":
      return "bg-emerald-50 text-emerald-700";

    case "completed":
      return "bg-blue-50 text-blue-700";

    case "rejected":
    case "cancelled":
      return "bg-red-50 text-red-700";

    case "reviewing":
      return "bg-amber-50 text-amber-700";

    case "pending":
    default:
      return "bg-violet-50 text-violet-700";
  }
}

function formatStatus(
  status: string | null | undefined,
) {
  const value = normalizeStatus(status);

  return value
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (char) =>
      char.toUpperCase(),
    );
}

export default function MarketplaceLeadsPage() {

  const [
    leads,
    setLeads,
  ] =
    useState<
      MarketplaceLead[]
    >(
      [],
    );


  const [
    loading,
    setLoading,
  ] =
    useState(
      true,
    );


  const [
    searchQuery,
    setSearchQuery,
  ] = useState("");


  const [
    statusFilter,
    setStatusFilter,
  ] = useState("all");


  const [
    serviceFilter,
    setServiceFilter,
  ] = useState("all");


  const [
    filtersOpen,
    setFiltersOpen,
  ] = useState(false);


  useEffect(
    () => {

      const loadLeads =
        async () => {

          try {

            const bookingRequests =
              await getStudioBookingRequests(
                "all",
              );

            const normalizedBookingRequests =
              Array.isArray(
                bookingRequests,
              )
                ? bookingRequests.map(
                    (item: any) => {

                      const metadata =
                        item?.metadata &&
                        typeof item.metadata ===
                          "object"
                          ? item.metadata
                          : {};

                      return {
                        id:
                          item.booking_request_id ??
                          item.id ??
                          "",

                        status:
                          item.status ??
                          "requested",

                        created_at:
                          item.created_at ??
                          new Date().toISOString(),

                        order_id:
                          item.order_id ??
                          "",

                        order_number:
                          item.order_number ??
                          "Marketplace Request",

                        order_status:
                          item.order_status ??
                          item.status ??
                          "pending",

                        total_amount:
                          Number(
                            item.total_amount ??
                            item.budget ??
                            0,
                          ),

                        currency:
                          item.currency ??
                          "INR",

                        requested_date:
                          item.requested_date ??
                          null,

                        requested_start_time:
                          item.requested_start_time ??
                          null,

                        requested_end_time:
                          item.requested_end_time ??
                          null,

                        customer_message:
                          item.customer_message ??
                          null,

                        customer_name:
                          typeof item.customer_name ===
                            "string"
                            ? item.customer_name
                            : typeof metadata.customer_name ===
                                "string"
                              ? metadata.customer_name
                              : null,

                        customer_phone:
                          typeof item.customer_phone ===
                            "string"
                            ? item.customer_phone
                            : typeof metadata.customer_phone ===
                                "string"
                              ? metadata.customer_phone
                              : null,

                        customer_email:
                          typeof item.customer_email ===
                            "string"
                            ? item.customer_email
                            : typeof metadata.customer_email ===
                                "string"
                              ? metadata.customer_email
                              : null,

                        event_type:
                          typeof item.event_type ===
                            "string"
                            ? item.event_type
                            : typeof metadata.event_type ===
                                "string"
                              ? metadata.event_type
                              : null,

                        venue:
                          typeof item.venue ===
                            "string"
                            ? item.venue
                            : typeof metadata.venue ===
                                "string"
                              ? metadata.venue
                              : null,

                        guest_count:
                          typeof item.guest_count ===
                            "number"
                            ? item.guest_count
                            : typeof metadata.guest_count ===
                                "number"
                              ? metadata.guest_count
                              : null,

                        budget:
                          typeof item.budget ===
                            "number"
                            ? item.budget
                            : typeof metadata.budget ===
                                "number"
                              ? metadata.budget
                              : null,
                      };
                    },
                  )
                : [];

            setLeads(
              normalizedBookingRequests,
            );

          } catch (error) {

            console.error(
              "Marketplace booking requests load error:",
              error,
            );

          } finally {

            setLoading(
              false,
            );

          }

        };

      void loadLeads();

    },
    [],
  );

    const filteredLeads = leads.filter(
      (lead) => {
        const query =
          searchQuery.trim().toLowerCase();

        const matchesSearch =
          !query ||
          [
            lead.order_number,
            lead.customer_name,
            lead.customer_phone,
            lead.customer_email,
            lead.event_type,
            lead.venue,
            lead.customer_message,
          ]
            .filter(Boolean)
            .some((value) =>
              String(value)
                .toLowerCase()
                .includes(query),
            );

        const normalizedLeadStatus =
          normalizeStatus(lead.status);

        const matchesStatus =
          statusFilter === "all" ||
          normalizedLeadStatus === statusFilter;

        const matchesService =
          serviceFilter === "all" ||
          String(lead.event_type ?? "")
            .toLowerCase() ===
            serviceFilter.toLowerCase();

        return (
          matchesSearch &&
          matchesStatus &&
          matchesService
        );
      },
    );

    const pendingCount =
    leads.filter(
      (lead) =>
        normalizeStatus(
          lead.status,
        ) === "pending",
    ).length;


  const confirmedCount =
    leads.filter(
      (lead) =>
        normalizeStatus(
          lead.status,
        ) === "confirmed",
    ).length;


  const pipelineValue =
    leads.reduce(
      (
        total,
        lead,
      ) =>
        total +
        Number(
          lead.total_amount ||
            0,
        ),
      0,
    );


  return (
    <PlanFeatureGate
      feature="marketplace"
      title="Studio Marketplace Locked"
      description="Receiving direct client leads from the PhotoOS Marketplace requires Studio Pro (Business Booster) or Business Elite."
    >
      <div className="mx-auto max-w-7xl space-y-7">


      <section className="overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_18px_60px_rgb(15,23,42,0.06)]">

        <div className="relative px-6 py-7 sm:px-8 lg:px-10">

          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-violet-100/60 blur-3xl" />


          <div className="relative flex flex-col gap-7 xl:flex-row xl:items-end xl:justify-between">

            <div>

              <div className="inline-flex items-center gap-2 rounded-full bg-violet-50 px-3 py-1.5 text-xs font-bold text-violet-700">

                <Sparkles size={14} />

                AI Marketplace Workspace

              </div>


              <h1 className="mt-4 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Marketplace Leads
              </h1>


              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">
                AI-powered lead management for marketplace enquiries,
                customer qualification and studio booking opportunities.
              </p>

            </div>


            <Link
              href="/dashboard"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >

              <ArrowLeft size={17} />

              Back to Dashboard

            </Link>

          </div>


          <div className="relative mt-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">


            <div className="rounded-2xl bg-slate-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Total Leads
              </p>

              <p className="mt-1 text-2xl font-bold text-slate-950">
                {leads.length}
              </p>

            </div>


            <div className="rounded-2xl bg-amber-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-amber-600">
                New Leads
              </p>

              <p className="mt-1 text-2xl font-bold text-amber-900">
                {pendingCount}
              </p>

            </div>


            <div className="rounded-2xl bg-emerald-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                Confirmed
              </p>

              <p className="mt-1 text-2xl font-bold text-emerald-900">
                {confirmedCount}
              </p>

            </div>


            <div className="rounded-2xl bg-violet-50 p-4">

              <p className="text-xs font-bold uppercase tracking-wide text-violet-600">
                Pipeline Value
              </p>

              <p className="mt-1 text-xl font-bold text-violet-900">
                {formatAmount(
                  pipelineValue,
                  leads[0]?.currency ||
                    "INR",
                )}
              </p>

            </div>

          </div>

        </div>


        <div className="border-t border-slate-100 bg-slate-50/70 px-6 py-5 sm:px-8 lg:px-10">

          <div className="flex flex-col gap-3 lg:flex-row">

            <div className="relative flex-1">

              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />


              <input
                value={searchQuery}
                onChange={(event) =>
                  setSearchQuery(
                    event.target.value,
                  )
                }
                placeholder="Search order, service or requirement..."
                className="h-12 w-full rounded-xl border border-slate-200 bg-white pl-11 pr-11 text-sm outline-none transition focus:border-violet-300 focus:ring-4 focus:ring-violet-100"
              />


              {searchQuery && (

                <button
                  type="button"
                  onClick={() =>
                    setSearchQuery("")
                  }
                  className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-100"
                >

                  <X size={16} />

                </button>

              )}

            </div>


            <button
              type="button"
              onClick={() =>
                setFiltersOpen(
                  (value) => !value,
                )
              }
              className={[
                "inline-flex h-12 items-center justify-center gap-2 rounded-xl border px-5 text-sm font-semibold transition",
                filtersOpen
                  ? "border-violet-300 bg-violet-50 text-violet-700"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >

              <SlidersHorizontal size={17} />

              Filters

            </button>

          </div>


          {filtersOpen && (

            <div className="mt-4 grid gap-3 rounded-2xl border border-slate-200 bg-white p-4 md:grid-cols-2">


              <label className="space-y-2">

                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Lead Status
                </span>


                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-300"
                >

                  <option value="all">
                    All statuses
                  </option>

                  <option value="pending">
                    New
                  </option>

                  <option value="accepted">
                    Accepted
                  </option>

                  <option value="confirmed">
                    Confirmed
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

              </label>


              <label className="space-y-2">

                <span className="text-xs font-bold uppercase tracking-wide text-slate-500">
                  Service Type
                </span>


                <select
                  value={serviceFilter}
                  onChange={(event) =>
                    setServiceFilter(
                      event.target.value,
                    )
                  }
                  className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none focus:border-violet-300"
                >

                  <option value="all">
                    All services
                  </option>


                  {serviceTypes.map(
                    (service) => (

                      <option
                        key={service}
                        value={service}
                      >
                        {service}
                      </option>

                    ),
                  )}

                </select>

              </label>


              <div className="flex items-center justify-between border-t border-slate-100 pt-4 md:col-span-2">

                <p className="text-sm text-slate-500">

                  Showing{" "}

                  <span className="font-bold text-slate-900">
                    {filteredLeads.length}
                  </span>

                  {" "}of{" "}

                  <span className="font-bold text-slate-900">
                    {leads.length}
                  </span>

                  {" "}leads

                </p>


                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("all");
                    setServiceFilter("all");
                  }}
                  className="text-sm font-bold text-violet-700 hover:text-violet-900"
                >
                  Clear filters
                </button>

              </div>

            </div>

          )}

        </div>

      </section>


      <section>

        <div className="mb-4 flex items-end justify-between gap-4">

          <div>

            <h2 className="text-xl font-bold tracking-tight text-slate-950">
              Lead Pipeline
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              AI-assisted visibility across marketplace booking opportunities.
            </p>

          </div>


          <div className="hidden items-center gap-2 text-xs font-semibold text-slate-400 sm:flex">

            <UserRound size={14} />

            Team workflow ready

          </div>

        </div>


        {loading ? (

          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center text-sm text-slate-500">
            Loading marketplace leads...
          </div>

        ) : filteredLeads.length === 0 ? (

          <div className="rounded-[28px] border border-slate-200 bg-white px-6 py-20 text-center">

            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

              <Store size={24} />

            </div>


            <h2 className="mt-5 text-lg font-bold text-slate-900">
              No matching marketplace leads
            </h2>


            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
              Change your search or filters to find another marketplace opportunity.
            </p>

          </div>

        ) : (

          <div className="space-y-4">


            {filteredLeads.map(
              (lead) => (

                <Link
                  key={lead.id}
                  href={`/dashboard/marketplace/leads/${lead.id}`}
                  className="group block rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_8px_30px_rgb(15,23,42,0.04)] transition hover:-translate-y-0.5 hover:border-violet-200 hover:shadow-[0_20px_55px_rgb(15,23,42,0.09)] sm:p-6"
                >

                  <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">


                    <div className="flex min-w-0 items-start gap-4">

                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-violet-50 text-violet-600">

                        <UserRound size={21} />

                      </div>


                      <div className="min-w-0">

                        <div className="flex flex-wrap items-center gap-2">

                          <h3 className="truncate text-base font-bold text-slate-950">
                            {lead.order_number}
                          </h3>


                          <span
                            className={`rounded-full px-3 py-1 text-[11px] font-bold ${getStatusClasses(
                              lead.status,
                            )}`}
                          >
                            {formatStatus(
                              lead.status,
                            )}
                          </span>

                        </div>


                        <p className="mt-1 text-xs text-slate-400">

                          Marketplace booking

                        </p>


                        {lead.customer_message && (

                          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-6 text-slate-600">

                            {lead.customer_message}

                          </p>

                        )}

                      </div>

                    </div>


                    <div className="grid shrink-0 grid-cols-2 gap-3 sm:grid-cols-3">


                      <div className="rounded-2xl bg-slate-50 px-4 py-3">

                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">

                          <CalendarDays size={13} />

                          Event

                        </div>


                        <p className="mt-1 text-xs font-bold text-slate-800">

                          {formatDate(
                            lead.requested_date,
                          )}

                        </p>

                      </div>


                      <div className="rounded-2xl bg-slate-50 px-4 py-3">

                        <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400">

                          <Clock3 size={13} />

                          Time

                        </div>


                        <p className="mt-1 text-xs font-bold text-slate-800">

                          {lead.requested_start_time
                            ? lead.requested_start_time.slice(
                                0,
                                5,
                              )
                            : "Pending"}

                        </p>

                      </div>


                      <div className="col-span-2 rounded-2xl bg-violet-50 px-4 py-3 sm:col-span-1">

                        <div className="flex items-center gap-2 text-[11px] font-semibold text-violet-500">

                          <CircleDollarSign size={13} />

                          Booking Value

                        </div>


                        <p className="mt-1 text-sm font-bold text-violet-900">

                          {formatAmount(
                            lead.total_amount,
                            lead.currency,
                          )}

                        </p>

                      </div>


                    </div>

                  </div>


                  <div className="mt-5 flex items-center justify-between gap-4 border-t border-slate-100 pt-4">

                    <div className="flex items-center gap-2 text-xs font-medium text-slate-400">

                      <span className="h-2 w-2 rounded-full bg-emerald-400" />

                      Marketplace opportunity

                    </div>


                    <span className="inline-flex items-center gap-1 text-xs font-bold text-violet-700 transition-all group-hover:gap-2">

                      Open lead

                      <ArrowUpRight size={14} />

                    </span>

                  </div>


                </Link>

              ),
            )}

          </div>

        )}

      </section>

      </div>
    </PlanFeatureGate>
  );
}
