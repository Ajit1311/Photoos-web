import {
  Search,
  Filter,
  Plus,
} from "lucide-react";

export default function EventFilters() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

        <div className="relative w-full max-w-md">

          <Search
            size={18}
            className="absolute left-4 top-3.5 text-slate-400"
          />

          <input
            type="text"
            placeholder="Search events..."
            className="w-full rounded-2xl border border-slate-200 py-3 pl-11 pr-4 outline-none transition focus:border-[#0A3F61]"
          />

        </div>

        <div className="flex gap-3">

          <button className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 hover:bg-slate-50">

            <Filter size={18} />

            Filters

          </button>

          <button className="flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3 font-medium text-white hover:bg-[#155983]">

            <Plus size={18} />

            Create Event

          </button>

        </div>

      </div>

    </section>
  );
}