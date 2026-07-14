import { ChevronDown } from "lucide-react";

export default function UserProfile() {
  return (
    <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:bg-slate-50">

      <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#0A3F61] font-bold text-white">
        P
      </div>

      <div className="hidden text-left xl:block">

        <h3 className="text-sm font-semibold text-slate-900">
          Parashuram
        </h3>

        <p className="text-xs text-slate-500">
          Studio Owner
        </p>

      </div>

      <ChevronDown
        size={18}
        className="text-slate-500"
      />

    </button>
  );
}