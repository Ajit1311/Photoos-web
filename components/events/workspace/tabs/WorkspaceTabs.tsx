"use client";

import {
  LayoutDashboard,
  Images,
  ScanFace,
  Wallet,
  MessageSquare,
  BellRing,
  Settings,
  type LucideIcon,
} from "lucide-react";

import type {
  WorkspaceTab,
} from "@/types/events/workspace";


const tabs: {
  id:
    WorkspaceTab;

  label:
    string;

  icon:
    LucideIcon;
}[] = [

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
    id: "face-gallery",
    label: "Face Gallery",
    icon: ScanFace,
  },

  {
    id: "payments",
    label: "Payment Transactions",
    icon: Wallet,
  },

  {
    id: "chat",
    label: "Chat",
    icon: MessageSquare,
  },

  {
    id: "reminder",
    label: "Reminder",
    icon: BellRing,
  },

  {
    id: "settings",
    label: "Settings",
    icon: Settings,
  },

];


interface WorkspaceTabsProps {

  activeTab:
    WorkspaceTab;

  onTabChange:
    (
      tab:
        WorkspaceTab,
    ) => void;

}


export default function WorkspaceTabs({
  activeTab,
  onTabChange,
}: WorkspaceTabsProps) {

  return (

    <div className="border-b border-slate-200 bg-white">

      <div className="w-full overflow-x-auto px-8">

        <div className="flex min-w-max gap-2 py-3">

          {tabs.map(
            (
              tab,
            ) => {

              const Icon =
                tab.icon;


              const active =
                activeTab ===
                tab.id;


              return (

                <button
                  key={
                    tab.id
                  }
                  type="button"
                  onClick={() =>
                    onTabChange(
                      tab.id,
                    )
                  }
                  className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all ${
                    active
                      ? "bg-[#0A3F61] text-white shadow-sm"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >

                  <Icon className="h-4 w-4" />

                  <span>
                    {tab.label}
                  </span>

                </button>

              );

            },
          )}

        </div>

      </div>

    </div>

  );

}