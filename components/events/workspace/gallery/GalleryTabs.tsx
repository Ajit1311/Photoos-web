"use client";

import {
  CircleX,
  EyeOff,
 FolderOpen,
  Heart,
  Images,
  Sparkles,
  Star,
} from "lucide-react";

import type { GalleryTab } from "@/types/events/gallery-tabs";

export interface GalleryTabsProps {
  activeTab: GalleryTab;

  onTabChange: (tab: GalleryTab) => void;
}

const tabs: {
  id: GalleryTab;
  label: string;
  icon: React.ElementType;
  count: number;
}[] = [
  {
    id: "all",
    label: "All Photos",
    icon: Images,
    count: 0,
  },
  {
    id: "client-selected",
    label: "Client Selected",
    icon: Heart,
    count: 0,
  },
  {
    id: "favorites",
    label: "Favorites",
    icon: Star,
    count: 0,
  },
  {
    id: "albums",
    label: "Albums",
    icon: FolderOpen,
    count: 0,
  },
  {
    id: "ai-categories",
    label: "AI Categories",
    icon: Sparkles,
    count: 0,
  },
  {
    id: "rejected",
    label: "Rejected",
    icon: CircleX,
    count: 0,
  },
  {
    id: "hidden",
    label: "Hidden",
    icon: EyeOff,
    count: 0,
  },
];

export default function GalleryTabs({
  activeTab,
  onTabChange,
}: GalleryTabsProps) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex min-w-max gap-2 p-3">
        {tabs.map((tab) => {
          const Icon = tab.icon;

          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-3 rounded-xl px-4 py-3 transition-all ${
                isActive
                  ? "bg-[#0A3F61] text-white shadow-sm"
                  : "text-slate-700 hover:bg-slate-100"
              }`}
            >
              <Icon className="h-4 w-4" />

              <span className="whitespace-nowrap text-sm font-medium">
                {tab.label}
              </span>

              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  isActive
                    ? "bg-white/20 text-white"
                    : "bg-slate-100 text-slate-600"
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}