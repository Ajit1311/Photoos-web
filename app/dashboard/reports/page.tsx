"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  Download,
  FileBarChart,
  FolderKanban,
  Image,
  IndianRupee,
  Loader2,
  RefreshCw,
  Users,
} from "lucide-react";

import {
  resolveUserStudio,
} from "@/lib/auth/resolve-user-studio";

import PlanFeatureGate from "@/components/subscription/PlanFeatureGate";

import {
  getStudioReport,
} from "@/lib/api/reports/get-studio-report";

import {
  getStudioFinancialReport,
} from "@/lib/api/reports/get-studio-financial-report";

import {
  getStudioTeamPerformanceReport,
} from "@/lib/api/reports/get-studio-team-performance-report";


import type {

  MonthlyRevenue,
  StudioFinancialReport,
  StudioReport,
  StudioTeamPerformanceReport,
  TeamPerformanceMember,
} from "@/types/reports/studio-report";


type DateRangePreset =
  "7d"
  | "30d"
  | "90d"
  | "year"
  | "custom";


function formatCurrency(
  value:
    number,
) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style:
        "currency",

      currency:
        "INR",

      maximumFractionDigits:
        0,
    },
  ).format(
    value,
  );

}


function formatNumber(
  value:
    number,
) {

  return new Intl.NumberFormat(
    "en-IN",
  ).format(
    value,
  );

}


function getDateRange(
  preset:
    DateRangePreset,
) {

  const today =
    new Date();

  const toDate =
    today
      .toISOString()
      .slice(
        0,
        10,
      );

  const from =
    new Date(
      today,
    );


  if (
    preset ===
    "7d"
  ) {

    from.setDate(
      today.getDate() -
      7,
    );

  }


  if (
    preset ===
    "30d"
  ) {

    from.setDate(
      today.getDate() -
      30,
    );

  }


  if (
    preset ===
    "90d"
  ) {

    from.setDate(
      today.getDate() -
      90,
    );

  }


  if (
    preset ===
    "year"
  ) {

    from.setFullYear(
      today.getFullYear() -
      1,
    );

  }


  return {
    fromDate:
      from
        .toISOString()
        .slice(
          0,
          10,
        ),

    toDate,
  };

}


function getReportNumber(
  value:
    unknown,
) {

  return typeof value ===
    "number"
    ? value
    : 0;

}


export default function ReportsPage() {

  const [
    studioReport,
    setStudioReport,
  ] =
    useState<
      StudioReport
      | null
    >(
      null,
    );


  const [
    teamPerformanceReport,
    setTeamPerformanceReport,
  ] =
    useState<
      StudioTeamPerformanceReport
      | null
    >(
      null,
    );


  const [
    financialReport,
    setFinancialReport,
  ] =
    useState<
      StudioFinancialReport
      | null
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


  const [
    refreshing,
    setRefreshing,
  ] =
    useState(
      false,
    );


  const [
    error,
    setError,
  ] =
    useState<
      string
      | null
    >(
      null,
    );


  const [
    datePreset,
    setDatePreset,
  ] =
    useState<
      DateRangePreset
    >(
      "30d",
    );


  const [
    customFromDate,
    setCustomFromDate,
  ] =
    useState(
      "",
    );


  const [
    customToDate,
    setCustomToDate,
  ] =
    useState(
      "",
    );


  const loadReports =
    useCallback(
      async (
        isRefresh =
          false,
      ) => {

        try {

          if (
            isRefresh
          ) {

            setRefreshing(
              true,
            );

          } else {

            setLoading(
              true,
            );

          }


          setError(
            null,
          );


          const membership =
            await resolveUserStudio();


          if (
            !membership
          ) {

            throw new Error(
              "Unable to resolve your studio.",
            );

          }


          let fromDate:
            string;

          let toDate:
            string;


          if (
            datePreset ===
            "custom"
          ) {

            if (
              !customFromDate ||
              !customToDate
            ) {

              throw new Error(
                "Select both custom dates.",
              );

            }


            fromDate =
              customFromDate;

            toDate =
              customToDate;

          } else {

            const range =
              getDateRange(
                datePreset,
              );

            fromDate =
              range.fromDate;

            toDate =
              range.toDate;

          }


          const [
            studioResult,
            financialResult,
            teamPerformanceResult,
          ] =
            await Promise.all(
              [
                getStudioReport(
                  membership.studioId,
                  fromDate,
                  toDate,
                ),

                getStudioFinancialReport(
                  membership.studioId,
                  fromDate,
                  toDate,
                ),

                getStudioTeamPerformanceReport(
                  membership.studioId,
                  fromDate,
                  toDate,
                ),
              ],
            );


          setStudioReport(
            studioResult,
          );

          setFinancialReport(
            financialResult,
          );


          setTeamPerformanceReport(
            teamPerformanceResult,
          );

        } catch (
          loadError
        ) {

          const reportError =
            loadError as {
              message?: string;
              details?: string;
              hint?: string;
              code?: string;
              name?: string;
            };


          console.error(
            "Unable to load reports:",
            reportError,
          );


          console.error(
            "REPORT ERROR DETAILS:",
            {
              message:
                reportError?.message,

              details:
                reportError?.details,

              hint:
                reportError?.hint,

              code:
                reportError?.code,

              name:
                reportError?.name,

              raw:
                JSON.stringify(
                  loadError,
                  Object.getOwnPropertyNames(
                    loadError ??
                    {},
                  ),
                ),
            },
          );


          setError(
            reportError?.message ??
            reportError?.details ??
            "Unable to load reports.",
          );

        } finally {

          setLoading(
            false,
          );

          setRefreshing(
            false,
          );

        }

      },
      [
        datePreset,
        customFromDate,
        customToDate,
      ],
    );


  useEffect(
    () => {

      if (
        datePreset !==
        "custom"
      ) {

        void loadReports();

      }

    },
    [
      datePreset,
      loadReports,
    ],
  );


  const overview:
    Record<
      string,
      number
    > =
    (
      studioReport?.overview ??
      {}
    ) as Record<
      string,
      number
    >;


  const teamPerformanceSummary =
    teamPerformanceReport?.summary;


  const teamPerformanceMembers:
    TeamPerformanceMember[] =
    teamPerformanceReport?.members ??
    [];


  const financialSummary =
    financialReport?.summary;


  const monthlyRevenue:
    MonthlyRevenue[] =
    financialReport?.monthly_revenue ??
    [];


  const maxRevenue =
    useMemo(
      () =>
        Math.max(
          ...monthlyRevenue.map(
            (
              item,
            ) =>
              Number(
                item.revenue,
              ) ||
              0,
          ),
          1,
        ),
      [
        monthlyRevenue,
      ],
    );


  const reportCards =
    [

      {
        label:
          "Total Events",

        value:
          getReportNumber(
            overview.events_total,
          ),

        icon:
          CalendarDays,

        description:
          "Events created in selected period.",
      },

      {
        label:
          "Upcoming Events",

        value:
          getReportNumber(
            overview.events_upcoming,
          ),

        icon:
          Clock3,

        description:
          "Events scheduled ahead.",
      },

      {
        label:
          "Completed Events",

        value:
          getReportNumber(
            overview.events_completed,
          ),

        icon:
          CheckCircle2,

        description:
          "Events marked as completed.",
      },

      {
        label:
          "New Clients",

        value:
          getReportNumber(
            overview.clients_new,
          ),

        icon:
          Users,

        description:
          "Clients added during the period.",
      },

      {
        label:
          "Projects",

        value:
          getReportNumber(
            overview.projects_total,
          ),

        icon:
          FolderKanban,

        description:
          "Projects created during the period.",
      },

      {
        label:
          "Assets",

        value:
          getReportNumber(
            overview.assets_total,
          ),

        icon:
          Image,

        description:
          "Media assets added during the period.",
      },

    ];


  if (
    loading
  ) {

    return (

      <main className="min-h-screen bg-slate-50 p-6 lg:p-8">

        <div className="mx-auto flex min-h-[70vh] max-w-7xl items-center justify-center">

          <div className="flex flex-col items-center gap-4 text-slate-500">

            <Loader2
              className="h-8 w-8 animate-spin"
            />

            <p className="text-sm font-medium">

              Preparing your studio reports...

            </p>

          </div>

        </div>

      </main>

    );

  }


  return (
    <PlanFeatureGate feature="reports">
      <main className="min-h-screen bg-slate-50 p-4 sm:p-6 lg:p-8">

      <div className="mx-auto max-w-7xl space-y-8">


        {/* Header */}

        <section className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">

          <div>

            <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0A3F61]">

              <FileBarChart
                className="h-4 w-4"
              />

              Studio Intelligence

            </div>


            <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">

              Reports & Analytics

            </h1>


            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500 sm:text-base">

              Track studio performance, events, clients, assets and financial activity from one place.

            </p>

          </div>


          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              onClick={() =>
                void loadReports(
                  true,
                )
              }
              disabled={
                refreshing
              }
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
            >

              <RefreshCw
                className={
                  refreshing
                    ? "h-4 w-4 animate-spin"
                    : "h-4 w-4"
                }
              />

              Refresh

            </button>


            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2.5 text-sm font-medium text-white transition hover:bg-[#08344f]"
            >

              <Download
                className="h-4 w-4"
              />

              Export Report

            </button>

          </div>

        </section>


        {/* Date Filters */}

        <section className="rounded-[24px] border border-slate-200 bg-white p-4 shadow-[0_4px_20px_rgb(15,23,42,0.03)] sm:p-5">

          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

            <div className="flex flex-wrap gap-2">

              {
                [
                  {
                    id:
                      "7d",

                    label:
                      "Last 7 Days",
                  },

                  {
                    id:
                      "30d",

                    label:
                      "Last 30 Days",
                  },

                  {
                    id:
                      "90d",

                    label:
                      "Last 90 Days",
                  },

                  {
                    id:
                      "year",

                    label:
                      "Last Year",
                  },

                  {
                    id:
                      "custom",

                    label:
                      "Custom",
                  },
                ].map(
                  (
                    item,
                  ) => (

                    <button
                      key={
                        item.id
                      }
                      type="button"
                      onClick={() =>
                        setDatePreset(
                          item.id as DateRangePreset,
                        )
                      }
                      className={
                        datePreset ===
                        item.id
                          ? "rounded-xl bg-[#0A3F61] px-4 py-2 text-sm font-medium text-white"
                          : "rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                      }
                    >

                      {
                        item.label
                      }

                    </button>

                  ),
                )
              }

            </div>


            {
              datePreset ===
              "custom"
                ? (

                    <div className="flex flex-wrap items-center gap-2">

                      <input
                        type="date"
                        value={
                          customFromDate
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setCustomFromDate(
                              event.target.value,
                            )
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0A3F61]"
                      />


                      <span className="text-sm text-slate-400">

                        to

                      </span>


                      <input
                        type="date"
                        value={
                          customToDate
                        }
                        onChange={
                          (
                            event,
                          ) =>
                            setCustomToDate(
                              event.target.value,
                            )
                        }
                        className="rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#0A3F61]"
                      />


                      <button
                        type="button"
                        onClick={() =>
                          void loadReports()
                        }
                        className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-medium text-white"
                      >

                        Apply

                      </button>

                    </div>

                  )
                : null
            }

          </div>

        </section>


        {
          error
            ? (

                <section className="flex items-start gap-3 rounded-[20px] border border-red-200 bg-red-50 p-5 text-red-700">

                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0"
                  />

                  <div>

                    <p className="font-medium">

                      Unable to load reports

                    </p>

                    <p className="mt-1 text-sm">

                      {
                        error
                      }

                    </p>

                  </div>

                </section>

              )
            : null
        }


        {/* Financial Overview */}

        <section>

          <div className="mb-4 flex items-center gap-2">

            <CircleDollarSign
              className="h-5 w-5 text-[#0A3F61]"
            />

            <h2 className="text-lg font-semibold text-slate-900">

              Financial Overview

            </h2>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">

            {
              [
                {
                  label:
                    "Total Invoiced",

                  value:
                    financialSummary?.total_invoiced ??
                    0,

                  icon:
                    IndianRupee,

                  trend:
                    ArrowUpRight,
                },

                {
                  label:
                    "Payments Received",

                  value:
                    financialSummary?.total_received ??
                    0,

                  icon:
                    CheckCircle2,

                  trend:
                    ArrowUpRight,
                },

                {
                  label:
                    "Pending Amount",

                  value:
                    financialSummary?.total_pending ??
                    0,

                  icon:
                    Clock3,

                  trend:
                    ArrowDownRight,
                },

                {
                  label:
                    "Overdue Amount",

                  value:
                    financialSummary?.total_overdue ??
                    0,

                  icon:
                    AlertCircle,

                  trend:
                    ArrowDownRight,
                },
              ].map(
                (
                  item,
                ) => {

                  const Icon =
                    item.icon;

                  const Trend =
                    item.trend;


                  return (

                    <article
                      key={
                        item.label
                      }
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgb(15,23,42,0.03)]"
                    >

                      <div className="flex items-start justify-between">

                        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3F61]/10 text-[#0A3F61]">

                          <Icon
                            className="h-5 w-5"
                          />

                        </div>


                        <Trend
                          className="h-4 w-4 text-slate-400"
                        />

                      </div>


                      <p className="mt-6 text-sm font-medium text-slate-500">

                        {
                          item.label
                        }

                      </p>


                      <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">

                        {
                          formatCurrency(
                            Number(
                              item.value,
                            ),
                          )
                        }

                      </p>

                    </article>

                  );

                },
              )
            }

          </div>

        </section>


        {/* Team Performance */}

      <section className="space-y-6">

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">

              Team Intelligence

            </p>

            <h2 className="mt-1 text-2xl font-semibold text-slate-900">

              Team Performance & KRA / KPI

            </h2>

            <p className="mt-2 text-sm text-slate-500">

              Measure workload, delivery, productivity and overall team performance.

            </p>

          </div>

        </div>


        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">

          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">

              Team Members

            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-900">

              {
                teamPerformanceSummary?.total_members ??
                teamPerformanceMembers.length
              }

            </p>

          </div>


          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">

              Average KPI

            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-900">

              {
                Number(
                  teamPerformanceSummary?.average_kpi_score ??
                  0,
                ).toFixed(
                  1,
                )
              }%

            </p>

          </div>


          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">

              Average KRA

            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-900">

              {
                Number(
                  teamPerformanceSummary?.average_kra_score ??
                  0,
                ).toFixed(
                  1,
                )
              }%

            </p>

          </div>


          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">

              Overall Performance

            </p>

            <p className="mt-3 text-3xl font-semibold text-slate-900">

              {
                Number(
                  teamPerformanceSummary?.average_performance_score ??
                  0,
                ).toFixed(
                  1,
                )
              }%

            </p>

          </div>


          <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">

            <p className="text-sm text-slate-500">

              Top Performer

            </p>

            <p className="mt-3 truncate text-lg font-semibold text-slate-900">

              {
                teamPerformanceSummary?.top_performer ??
                "No data"
              }

            </p>

          </div>

        </div>


        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">

          <div className="border-b border-slate-100 px-6 py-5">

            <h3 className="text-lg font-semibold text-slate-900">

              Member Performance

            </h3>

            <p className="mt-1 text-sm text-slate-500">

              Individual KRA, KPI, workload and delivery performance.

            </p>

          </div>


          <div className="overflow-x-auto">

            <table className="min-w-full">

              <thead className="border-b border-slate-100 bg-slate-50">

                <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">

                  <th className="px-6 py-4">

                    Member

                  </th>

                  <th className="px-6 py-4">

                    Events

                  </th>

                  <th className="px-6 py-4">

                    Projects

                  </th>

                  <th className="px-6 py-4">

                    Assets

                  </th>

                  <th className="px-6 py-4">

                    KPI

                  </th>

                  <th className="px-6 py-4">

                    KRA

                  </th>

                  <th className="px-6 py-4">

                    Performance

                  </th>

                </tr>

              </thead>


              <tbody className="divide-y divide-slate-100">

                {
                  teamPerformanceMembers.length ===
                  0
                    ? (

                      <tr>

                        <td
                          colSpan={
                            7
                          }
                          className="px-6 py-12 text-center text-sm text-slate-500"
                        >

                          No team performance data available for this period.

                        </td>

                      </tr>

                    )
                    : (

                      teamPerformanceMembers.map(
                        (
                          member,
                          index,
                        ) => (

                          <tr
                            key={
                              member.member_id ??
                              `${member.member_name}-${index}`
                            }
                            className="transition hover:bg-slate-50/70"
                          >

                            <td className="px-6 py-4">

                              <div>

                                <p className="font-medium text-slate-900">

                                  {
                                    member.member_name
                                  }

                                </p>

                                <p className="mt-1 text-xs text-slate-500">

                                  {
                                    member.role_name ??
                                    member.member_email ??
                                    "Team Member"
                                  }

                                </p>

                              </div>

                            </td>


                            <td className="px-6 py-4 text-sm text-slate-700">

                              {
                                member.completed_events
                              }
                              /
                              {
                                member.assigned_events
                              }

                            </td>


                            <td className="px-6 py-4 text-sm text-slate-700">

                              {
                                member.completed_projects
                              }
                              /
                              {
                                member.assigned_projects
                              }

                            </td>


                            <td className="px-6 py-4 text-sm text-slate-700">

                              {
                                member.assets_processed
                              }

                            </td>


                            <td className="px-6 py-4">

                              <span className="font-semibold text-slate-900">

                                {
                                  Number(
                                    member.kpi_score,
                                  ).toFixed(
                                    1,
                                  )
                                }%

                              </span>

                            </td>


                            <td className="px-6 py-4">

                              <span className="font-semibold text-slate-900">

                                {
                                  Number(
                                    member.kra_score,
                                  ).toFixed(
                                    1,
                                  )
                                }%

                              </span>

                            </td>


                            <td className="px-6 py-4">

                              <div className="min-w-[120px]">

                                <div className="flex items-center justify-between gap-3">

                                  <span className="text-sm font-semibold text-slate-900">

                                    {
                                      Number(
                                        member.performance_score,
                                      ).toFixed(
                                        1,
                                      )
                                    }%

                                  </span>

                                </div>


                                <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-100">

                                  <div
                                    className="h-full rounded-full bg-[#0A3F61]"
                                    style={{
                                      width:
                                        `${Math.min(
                                          Math.max(
                                            Number(
                                              member.performance_score,
                                            ) ||
                                            0,
                                            0,
                                          ),
                                          100,
                                        )}%`,
                                    }}
                                  />

                                </div>

                              </div>

                            </td>

                          </tr>

                        ),
                      )

                    )
                }

              </tbody>

            </table>

          </div>

        </div>

      </section>


      {/* Studio Overview */}

        <section>

          <div className="mb-4 flex items-center gap-2">

            <BriefcaseBusiness
              className="h-5 w-5 text-[#0A3F61]"
            />

            <h2 className="text-lg font-semibold text-slate-900">

              Studio Overview

            </h2>

          </div>


          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">

            {
              reportCards.map(
                (
                  item,
                ) => {

                  const Icon =
                    item.icon;


                  return (

                    <article
                      key={
                        item.label
                      }
                      className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgb(15,23,42,0.03)]"
                    >

                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">

                        <Icon
                          className="h-5 w-5"
                        />

                      </div>


                      <p className="mt-5 text-sm font-medium text-slate-500">

                        {
                          item.label
                        }

                      </p>


                      <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">

                        {
                          formatNumber(
                            item.value,
                          )
                        }

                      </p>


                      <p className="mt-2 text-xs leading-5 text-slate-400">

                        {
                          item.description
                        }

                      </p>

                    </article>

                  );

                },
              )
            }

          </div>

        </section>


        {/* Revenue Chart */}

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgb(15,23,42,0.03)] sm:p-7">

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <div className="flex items-center gap-2">

                <BarChart3
                  className="h-5 w-5 text-[#0A3F61]"
                />

                <h2 className="text-lg font-semibold text-slate-900">

                  Monthly Revenue

                </h2>

              </div>


              <p className="mt-2 text-sm text-slate-500">

                Completed payment revenue for the selected period.

              </p>

            </div>

          </div>


          {
            monthlyRevenue.length ===
            0
              ? (

                  <div className="flex h-72 items-center justify-center rounded-[20px] border border-dashed border-slate-200 bg-slate-50">

                    <p className="text-sm text-slate-400">

                      No completed payment data is available for this period.

                    </p>

                  </div>

                )
              : (

                  <div className="mt-8 flex h-72 items-end gap-3 overflow-x-auto border-b border-slate-100 pb-8">

                    {
                      monthlyRevenue.map(
                        (
                          item,
                        ) => {

                          const revenue =
                            Number(
                              item.revenue,
                            ) ||
                            0;


                          const height =
                            Math.max(
                              (
                                revenue /
                                maxRevenue
                              ) *
                                100,
                              4,
                            );


                          return (

                            <div
                              key={
                                item.month
                              }
                              className="flex min-w-[88px] flex-1 flex-col items-center justify-end gap-3"
                            >

                              <span className="text-xs font-medium text-slate-600">

                                {
                                  formatCurrency(
                                    revenue,
                                  )
                                }

                              </span>


                              <div
                                className="w-full rounded-t-2xl bg-[#0A3F61] transition-all"
                                style={
                                  {
                                    height:
                                      `${height}%`,
                                  }
                                }
                              />


                              <span className="text-xs text-slate-400">

                                {
                                  item.month
                                }

                              </span>

                            </div>

                          );

                        },
                      )
                    }

                  </div>

                )
          }

        </section>


        {/* Payment Status */}

        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_4px_20px_rgb(15,23,42,0.03)] sm:p-7">

          <div className="flex items-center gap-2">

            <CheckCircle2
              className="h-5 w-5 text-[#0A3F61]"
            />

            <h2 className="text-lg font-semibold text-slate-900">

              Payment Status Breakdown

            </h2>

          </div>


          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">

            {
              Object.entries(
                financialReport?.payment_status ??
                {},
              ).map(
                (
                  [
                    status,
                    amount,
                  ],
                ) => (

                  <div
                    key={
                      status
                    }
                    className="rounded-2xl bg-slate-50 p-5"
                  >

                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">

                      {
                        status
                          .replaceAll(
                            "_",
                            " ",
                          )
                      }

                    </p>


                    <p className="mt-3 text-xl font-semibold text-slate-900">

                      {
                        formatCurrency(
                          Number(
                            amount,
                          ),
                        )
                      }

                    </p>

                  </div>

                ),
              )
            }

          </div>

        </section>


      </div>

      </main>
    </PlanFeatureGate>
  );

}

