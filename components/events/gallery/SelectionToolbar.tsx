"use client";

import {
  BookOpen,
  CheckSquare,
  Download,
 Share2,
  Trash2,
  X,
} from "lucide-react";

type SelectionToolbarProps = {
  selectedCount?: number;
};

export default function SelectionToolbar({
  selectedCount = 12,
}: SelectionToolbarProps) {
  return (
    <section className="sticky top-4 z-20 rounded-3xl border border-[#0A3F61]/20 bg-[#0A3F61] text-white shadow-xl">

      <div className="flex flex-col gap-4 p-5 lg:flex-row lg:items-center lg:justify-between">

        {/* Left */}

        <div className="flex items-center gap-3">

          <div className="rounded-xl bg-white/15 p-3">

            <CheckSquare size={20} />

          </div>

          <div>

            <h2 className="font-semibold">
              {selectedCount} Photos Selected
            </h2>

            <p className="text-sm text-white/70">
              Choose an action for the selected photos.
            </p>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-medium text-[#0A3F61] transition hover:bg-slate-100">

            <BookOpen size={18} />

            Create Album

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 transition hover:bg-white/10">

            <Download size={18} />

            Download

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-white/20 px-4 py-3 transition hover:bg-white/10">

            <Share2 size={18} />

            Share

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-3 text-red-100 transition hover:bg-red-500/20">

            <Trash2 size={18} />

            Delete

          </button>

          <button className="rounded-xl border border-white/20 p-3 transition hover:bg-white/10">

            <X size={18} />

          </button>

        </div>

      </div>

    </section>
  );
}