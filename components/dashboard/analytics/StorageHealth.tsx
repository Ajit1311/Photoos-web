import { HardDrive, TrendingUp } from "lucide-react";

export default function StorageHealth() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">

      <div className="flex items-center justify-between">

        <div>

          <p className="text-sm text-slate-500">
            Storage Health
          </p>

          <h2 className="mt-2 text-4xl font-bold text-slate-900">
            68%
          </h2>

        </div>

        <div className="rounded-2xl bg-[#0A3F61]/10 p-4 text-[#0A3F61]">
          <HardDrive size={26} />
        </div>

      </div>

      <div className="mt-6 h-3 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full w-[68%] rounded-full bg-gradient-to-r from-[#0A3F61] to-[#3495A1]" />
      </div>

      <div className="mt-4 flex items-center gap-2 text-green-600">

        <TrendingUp size={16} />

        <span className="text-sm font-medium">
          320 GB recoverable using Smart Archive
        </span>

      </div>

    </div>
  );
}