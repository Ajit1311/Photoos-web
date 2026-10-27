"use client";

import {
  Image,
  PackageCheck,
  Sparkles,
} from "lucide-react";

import {
  useDashboardContext,
} from "@/context/DashboardContext";


export default function MiniAIInsights() {

  const dashboard =
    useDashboardContext();


  const metrics =
    dashboard.data?.metrics ??
    null;


  const items = [
    {
      title: "AI Processing Queue",

      value:
        metrics?.pendingProcessingJobs ??
        0,

      description:
        "Jobs waiting for processing.",

      icon:
        Sparkles,
    },

    {
      title: "Total Assets",

      value:
        metrics?.totalAssets ??
        0,

      description:
        "Assets currently tracked in your studio.",

      icon:
        Image,
    },

    {
      title: "Pending Deliveries",

      value:
        metrics?.pendingDeliveries ??
        0,

      description:
        "Deliveries that still need attention.",

      icon:
        PackageCheck,
    },
  ];


  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <div className="flex items-center gap-3">

          <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

            <Sparkles
              size={20}
            />

          </div>


          <div>

            <h2 className="text-xl font-bold text-slate-900">
              AI Insights
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Live operational signals from your studio.
            </p>

          </div>

        </div>

      </div>


      <div className="space-y-4 p-6">

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
                  className="rounded-2xl border border-slate-200 p-4"
                >

                  <div className="flex items-start justify-between gap-4">

                    <div>

                      <p className="text-sm font-medium text-slate-700">

                        {item.title}

                      </p>


                      <p className="mt-1 text-xs text-slate-500">

                        {item.description}

                      </p>

                    </div>


                    <div className="flex shrink-0 items-center gap-2">

                      <Icon
                        size={16}
                        className="text-[#0A3F61]"
                      />


                      <span className="text-xl font-bold text-slate-900">

                        {item.value}

                      </span>

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
