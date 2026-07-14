"use client";

import {
  Download,
  Filter,
  MoreHorizontal,
  SlidersHorizontal,
  Star,
  Tag,
  Trash2,
  UserRound,
  CheckSquare,
  Square,
} from "lucide-react";

export default function GalleryToolbar() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-5 p-6 xl:flex-row xl:items-center xl:justify-between">

        {/* Left */}

        <div className="flex flex-wrap items-center gap-3">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <UserRound size={17} />

            Face Filter

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <Star size={17} />

            Rating

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <Tag size={17} />

            Labels

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <Filter size={17} />

            AI Filter

          </button>

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-3">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100">

            <Square size={17} />

            Select

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100">

            <CheckSquare size={17} />

            Select All

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100">

            <SlidersHorizontal size={17} />

            Sort

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100">

            <Download size={17} />

            Download

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm text-red-600 transition hover:bg-red-50">

            <Trash2 size={17} />

            Delete

          </button>

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <MoreHorizontal size={18} />

          </button>

        </div>

      </div>

    </section>
  );
}