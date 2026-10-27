"use client";

import {
  FolderOpen,
  Image,
  Sparkles,
  Users,
} from "lucide-react";

import {
  useDashboardContext,
} from "@/context/DashboardContext";


export default function StudioSnapshot() {

  const dashboard =
    useDashboardContext();


  const metrics =
    dashboard.data?.metrics ??
    null;


  const stats = [
    {
      title: "Active Projects",

      value:
        metrics?.activeProjects ??
        0,

      icon:
        FolderOpen,
    },

    {
      title: "Active Galleries",

      value:
        metrics?.activeAlbums ??
        0,

      icon:
        Image,
    },

    {
      title: "Pending Payments",

      value:
        metrics?.pendingPayments ??
        0,

      icon:
        Users,
    },

    {
      title: "AI Jobs",

      value:
        metrics?.pendingProcessingJobs ??
        0,

      icon:
        Sparkles,
    },
  ];


  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-6">

        <h2 className="text-xl font-bold text-slate-900">
          Studio Snapshot
        </h2>

        <p className="mt-2 text-sm text-slate-500">
          Live studio overview.
        </p>

      </div>


      <div className="grid grid-cols-2 gap-4 p-6">

        {
          stats.map(
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
                  className="rounded-2xl border border-slate-200 p-4 transition-all duration-200 hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
                >

                  <div className="mb-4 flex items-center justify-between">

                    <div className="rounded-xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

                      <Icon
                        size={18}
                      />

                    </div>


                    <span className="text-2xl font-bold text-slate-900">

                      {item.value}

                    </span>

                  </div>


                  <p className="text-sm font-medium text-slate-600">

                    {item.title}

                  </p>

                </div>

              );

            },
          )
        }

      </div>

    </section>
  );

}
