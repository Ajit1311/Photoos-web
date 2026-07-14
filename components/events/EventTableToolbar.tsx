import {
  Download,
  Plus,
  SlidersHorizontal,
} from "lucide-react";

export default function EventTableToolbar() {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 bg-slate-50 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">

      <div>

        <h2 className="text-xl font-bold text-slate-900">
          Event Records
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage every photography event from one place.
        </p>

      </div>

      <div className="flex flex-wrap gap-3">

        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-100">

          <SlidersHorizontal size={18} />

          Advanced Filters

        </button>

        <button className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 hover:bg-slate-100">

          <Download size={18} />

          Export

        </button>

        <button className="flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3 font-medium text-white hover:bg-[#155983]">

          <Plus size={18} />

          New Event

        </button>

      </div>

    </div>
  );
}