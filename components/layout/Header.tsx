import {
  Bell,
  Search,
  Plus,
  Sparkles,
  Command,
  ChevronDown,
} from "lucide-react";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-8 backdrop-blur">

      {/* Left */}

      <div className="flex items-center gap-6">

        {/* Search */}

        <button className="group flex h-12 w-[380px] items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 transition-all duration-300 hover:border-[#0A3F61]/20 hover:bg-white hover:shadow-sm">

          <div className="flex items-center gap-3">

            <Search
              size={18}
              className="text-slate-400 group-hover:text-[#0A3F61]"
            />

            <span className="text-sm text-slate-400">
              Search events, galleries, clients...
            </span>

          </div>

          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs text-slate-500">

            <Command size={12} />

            K

          </div>

        </button>

      </div>

      {/* Right */}

      <div className="flex items-center gap-3">

        {/* AI */}

        <button className="flex items-center gap-2 rounded-2xl border border-[#0A3F61]/20 bg-[#0A3F61]/5 px-4 py-3 text-[#0A3F61] transition hover:bg-[#0A3F61] hover:text-white">

          <Sparkles size={18} />

          <span className="text-sm font-semibold">
            AI Assistant
          </span>

        </button>

        {/* Create */}

        <button className="flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3 font-medium text-white transition hover:bg-[#155983]">

          <Plus size={18} />

          Create

        </button>

        {/* Notification */}

        <button className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 transition hover:bg-slate-100">

          <Bell size={19} />

          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500"></span>

        </button>

        {/* Profile */}

        <button className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-2 transition hover:shadow-md">

          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-[#0A3F61] to-[#3495A1] text-lg font-bold text-white">
            P
          </div>

          <div className="hidden text-left xl:block">

            <p className="text-sm font-semibold text-slate-900">
              Parashuram
            </p>

            <p className="text-xs text-slate-500">
              Studio Owner
            </p>

          </div>

          <ChevronDown
            size={16}
            className="hidden text-slate-400 xl:block"
          />

        </button>

      </div>

    </header>
  );
}