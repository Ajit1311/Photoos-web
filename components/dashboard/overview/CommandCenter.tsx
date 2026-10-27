"use client";

import {
  CalendarDays,
  DollarSign,
  HardDrive,
  PackageCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  useDashboardContext,
} from "@/context/DashboardContext";


export default function CommandCenter() {

  const dashboard =
    useDashboardContext();


  const metrics =
    dashboard.data?.metrics ??
    null;


  const items = [
    {
      title: "Today's Events",

      value:
        metrics
          ? metrics.todayEvents
          : 0,

      icon:
        CalendarDays,
    },

    {
      title: "Pending Deliveries",

      value:
        metrics
          ? metrics.pendingDeliveries
          : 0,

      icon:
        PackageCheck,
    },

    {
      title: "AI Queue",

      value:
        metrics
          ? `${metrics.pendingProcessingJobs} Jobs`
          : "0 Jobs",

      icon:
        Sparkles,
    },

    {
      title: "Total Assets",

      value:
        metrics
          ? metrics.totalAssets
          : 0,

      icon:
        HardDrive,
    },

    {
      title: "Active Projects",

      value:
        metrics
          ? metrics.activeProjects
          : 0,

      icon:
        DollarSign,
    },

    {
      title: "Business Score",

      value:
        metrics
          ? `${metrics.businessHealth}%`
          : "0%",

      icon:
        TrendingUp,
    },
  ];


  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="mb-6">

        <h2 className="text-2xl font-bold text-slate-900">
          Studio Command Center
        </h2>

        <p className="mt-2 text-slate-500">
          Live overview of your studio operations.
        </p>

      </div>


      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

        {
          items.map(
            (
              item,
            ) => {

              const Icon =
                item.icon;


              return (

                <div
                  key={
                    item.title
                  }
                  className="rounded-2xl border border-slate-200 p-5 transition hover:border-[#0A3F61]/20 hover:shadow-md"
                >

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-sm text-slate-500">

                        {item.title}

                      </p>


                      <h3 className="mt-3 text-2xl font-bold text-slate-900">

                        {item.value}

                      </h3>

                    </div>


                    <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                      <Icon
                        size={22}
                      />

                    </div>

                  </div>

                </div>

              );

            },
          )
        }

      </div>

    </section>
  );

}
