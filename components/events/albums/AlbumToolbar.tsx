"use client";

import {
  Grid2X2,
  LayoutTemplate,
  Minus,
  Plus,
  Redo2,
  RotateCcw,
  Sparkles,
  Trash2,
} from "lucide-react";

export default function AlbumToolbar() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-5 p-5 xl:flex-row xl:items-center xl:justify-between">

        {/* Left Actions */}

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <Plus size={18} />

            Add Page

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <LayoutTemplate size={18} />

            Duplicate

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-red-600 transition hover:bg-red-50">

            <Trash2 size={18} />

            Delete

          </button>

        </div>

        {/* Center */}

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl bg-[#0A3F61] px-4 py-3 text-white transition hover:bg-[#14557F]">

            <Sparkles size={18} />

            AI Auto Arrange

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-100">

            <RotateCcw size={18} />

            Undo

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-100">

            <Redo2 size={18} />

            Redo

          </button>

        </div>

        {/* Right */}

        <div className="flex items-center gap-3">

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Minus size={18} />

          </button>

          <div className="min-w-[70px] rounded-xl bg-slate-100 px-4 py-3 text-center font-semibold text-slate-700">

            100%

          </div>

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Plus size={18} />

          </button>

          <button className="rounded-xl border border-slate-200 p-3 transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5">

            <Grid2X2 size={18} />

          </button>

        </div>

      </div>

    </section>
  );
}