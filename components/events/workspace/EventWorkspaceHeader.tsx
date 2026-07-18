import { ArrowLeft, Image as ImageIcon, LayoutDashboard } from "lucide-react";

interface Props {
  activeTab: "overview" | "gallery";
  eventTitle?: string;

  onBack: () => void;

  onOverview: () => void;

  onGallery: () => void;
}

export default function EventWorkspaceHeader({
  activeTab,
  eventTitle,
  onBack,
  onOverview,
  onGallery,
}: Props) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onBack}
          className="p-2 hover:bg-slate-100 rounded-xl text-slate-500 transition-colors"
        >
          <ArrowLeft size={18} />
        </button>

        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-800">
          <span className="h-2 w-2 rounded-full bg-[#0A3F61] animate-pulse"></span>

          PROJECT SLATE: {eventTitle}
        </div>
      </div>

      <div className="flex bg-slate-100 p-1 rounded-xl">
        <button
          onClick={onOverview}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "overview"
              ? "bg-white text-[#0A3F61] shadow-sm"
              : "text-slate-500"
          }`}
        >
          <LayoutDashboard size={14} />

          Production Overview
        </button>

        <button
          onClick={onGallery}
          className={`flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg transition-all ${
            activeTab === "gallery"
              ? "bg-white text-[#0A3F61] shadow-sm"
              : "text-slate-500"
          }`}
        >
          <ImageIcon size={14} />

          Media Catalog
        </button>
      </div>
    </div>
  );
}