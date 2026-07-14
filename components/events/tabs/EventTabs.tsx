"use client";

import { useState } from "react";

import {
  Activity,
  BookOpen,
  CreditCard,
  GalleryHorizontal,
  LayoutDashboard,
  Send,
  Settings,
} from "lucide-react";

import AlbumWorkspace from "@/components/events/albums/AlbumWorkspace";
import DeliveryWorkspace from "@/components/events/delivery/DeliveryWorkspace";
import GalleryWorkspace from "@/components/events/gallery/GalleryWorkspace";
import EventOverviewWorkspace from "@/components/events/overview/EventOverviewWorkspace";

const tabs = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    id: "gallery",
    label: "Gallery",
    icon: GalleryHorizontal,
  },
  {
    id: "albums",
    label: "Albums",
    icon: BookOpen,
  },
  {
    id: "delivery",
    label: "Delivery",
    icon: Send,
  },
  {
    id: "payments",
    label: "Payments",
    icon: CreditCard,
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
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <section className="space-y-6">

      <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">

        <div className="flex flex-wrap gap-3">

          {tabs.map((tab) => {
            const Icon = tab.icon;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 rounded-2xl px-5 py-3 text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-[#0A3F61] text-white shadow-md"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon size={18} />

                {tab.label}
              </button>
            );
          })}
        </div>

      </div>

      {activeTab === "overview" && <EventOverviewWorkspace />}

      {activeTab === "gallery" && <GalleryWorkspace />}

      {activeTab === "albums" && <AlbumWorkspace />}

      {activeTab === "delivery" && <DeliveryWorkspace />}

      {!["overview", "gallery", "albums", "delivery"].includes(activeTab) && (
        <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-20 text-center">

          <h2 className="text-2xl font-bold text-slate-900">
            {tabs.find((tab) => tab.id === activeTab)?.label}
          </h2>

          <p className="mt-3 text-slate-500">
            This module will be implemented in the next sprint.
          </p>

        </div>
      )}

    </section>
  );
}