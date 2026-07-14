"use client";

import { useState } from "react";

import {
  Activity,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  History,
  Images,
  LayoutDashboard,
  Search,
  Settings,
} from "lucide-react";

import { useEvents } from "@/hooks/useEvents";

import EventOverviewWorkspace from "@/components/events/overview/EventOverviewWorkspace";
import GalleryWorkspace from "@/components/events/gallery/GalleryWorkspace";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: Images,
  },
  {
    id: "albums",
    label: "Albums",
    icon: BookOpen,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
  },
  {
    id: "timeline",
    label: "Timeline",
    icon: History,
  },
  {
    id: "activity",
    label: "Activity",
    icon: Activity,
  },
  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },
];

export default function EventTabs() {

  const {
    events,
    search,
    setSearch,
    page,
    pagination,
    nextPage,
    previousPage,
    loading,
    error,
    reload,
  } = useEvents();

  const [activeTab, setActiveTab] =
    useState("overview");

  if (loading) {

    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
        Loading events...
      </div>
    );

  }

  if (error) {

    return (
      <div className="rounded-3xl border border-red-200 bg-white p-12 text-center">

        <h2 className="text-2xl font-bold text-red-600">
          Unable to load events
        </h2>

        <p className="mt-3 text-slate-500">
          {error}
        </p>

        <button
          onClick={reload}
          className="mt-6 rounded-xl bg-[#0A3F61] px-6 py-3 text-white"
        >
          Retry
        </button>

      </div>
    );

  }

  return (

    <section className="space-y-6">

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="relative mb-4">

          <Search
            size={18}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search events..."
            className="w-full rounded-xl border border-slate-200 py-3 pl-11 pr-4 outline-none focus:border-[#0A3F61]"
          />

        </div>

        <div className="flex flex-wrap gap-3">

          {tabs.map((tab) => {

            const Icon = tab.icon;

            return (

              <button
                key={tab.id}
                onClick={() =>
                  setActiveTab(tab.id)
                }
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition ${
                  activeTab === tab.id
                    ? "bg-[#0A3F61] text-white"
                    : "hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />
                {tab.label}
              </button>

            );

          })}

        </div>

      </div>

      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white px-6 py-4">

        <div className="text-sm text-slate-500">

          Showing page{" "}
          <strong>{page}</strong>
          {" "}of{" "}
          <strong>
            {pagination.totalPages}
          </strong>

          {" • "}

          Total Events{" "}
          <strong>
            {pagination.total}
          </strong>

        </div>

        <div className="flex items-center gap-3">

          <button
            onClick={previousPage}
            disabled={page === 1}
            className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <ChevronLeft size={18} />
            Previous
          </button>

          <button
            onClick={nextPage}
            disabled={
              page >= pagination.totalPages
            }
            className="flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-2 text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            Next
            <ChevronRight size={18} />
          </button>

        </div>

      </div>

      {events.length === 0 && (

        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

          <h2 className="text-2xl font-bold">
            No Events Found
          </h2>

          <p className="mt-3 text-slate-500">
            No events matched your search.
          </p>

        </div>

      )}

      {events.length > 0 &&
        activeTab === "overview" && (
          <EventOverviewWorkspace />
        )}

      {events.length > 0 &&
        activeTab === "gallery" && (
          <GalleryWorkspace />
        )}

      {events.length > 0 &&
        !["overview", "gallery"].includes(activeTab) && (

          <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-16 text-center">

            <h2 className="text-2xl font-bold">
              {
                tabs.find(
                  (tab) =>
                    tab.id === activeTab,
                )?.label
              }
            </h2>

            <p className="mt-3 text-slate-500">
              Coming Soon
            </p>

          </div>

      )}

    </section>

  );

}