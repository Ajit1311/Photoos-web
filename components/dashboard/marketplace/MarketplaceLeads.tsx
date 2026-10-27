"use client";

import Link from "next/link";

import {
  CalendarDays,
  ExternalLink,
  Store,
} from "lucide-react";

import {
  useDashboardContext,
} from "@/context/DashboardContext";


function formatDate(
  value: string | null,
) {

  if (
    !value
  ) {
    return "Date not specified";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(
    new Date(value),
  );

}


export default function MarketplaceLeads() {

  const dashboard =
    useDashboardContext();


  const marketplaceLeads =
    dashboard.data?.metrics
      .marketplaceLeads ??
    {
      items: [],
      total: 0,
    };


  return (

    <section className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-[0_8px_30px_rgb(15,23,42,0.04)]">

      <div className="flex items-center justify-between border-b border-slate-100 px-6 py-5">

        <div className="flex items-center gap-3">

          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-50 text-violet-600">

            <Store
              size={19}
            />

          </div>


          <div>

            <h2 className="font-semibold text-slate-900">

              Marketplace Leads

            </h2>

            <p className="mt-0.5 text-xs text-slate-500">

              New opportunities from the marketplace

            </p>

          </div>

        </div>


        <Link
          href="/dashboard/marketplace/leads"
          className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-violet-50 px-3 py-2 text-xs font-semibold text-violet-700 transition hover:bg-violet-100"
        >

          View All

          <ExternalLink
            size={13}
          />

        </Link>

      </div>


      <div className="divide-y divide-slate-100">

        {
          marketplaceLeads.items.length === 0 ? (

            <div className="px-6 py-12 text-center">

              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">

                <Store
                  size={20}
                />

              </div>

              <p className="mt-4 text-sm font-medium text-slate-900">

                No marketplace leads yet

              </p>

              <p className="mt-1 text-xs text-slate-500">

                New booking requests will appear here.

              </p>

            </div>

          ) : (

            marketplaceLeads.items.map(
              (
                lead,
              ) => (

                <div
                  key={
                    lead.id
                  }
                  className="group px-6 py-5 transition hover:bg-slate-50"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div className="min-w-0">

                      <div className="flex items-center gap-2">

                        <p className="truncate text-sm font-semibold text-slate-900">

                          {
                            lead.order_number
                          }

                        </p>


                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-semibold capitalize text-amber-700">

                          {
                            lead.status
                          }

                        </span>

                      </div>


                      {
                        lead.customer_message && (

                          <p className="mt-2 line-clamp-2 text-xs leading-5 text-slate-500">

                            {
                              lead.customer_message
                            }

                          </p>

                        )
                      }


                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                        <CalendarDays
                          size={13}
                        />

                        <span>

                          {
                            formatDate(
                              lead.requested_date,
                            )
                          }

                        </span>


                        {
                          lead.requested_start_time && (

                            <>

                              <span className="h-1 w-1 rounded-full bg-slate-300" />

                              <span>

                                {
                                  lead.requested_start_time.slice(
                                    0,
                                    5,
                                  )
                                }

                              </span>

                            </>

                          )
                        }

                      </div>

                    </div>


                    <ExternalLink
                      size={16}
                      className="mt-1 shrink-0 text-slate-300 transition group-hover:text-slate-700"
                    />

                  </div>

                </div>

              ),
            )

          )
        }

      </div>

    </section>

  );

}
