"use client";

import {
  Download,
  FolderPlus,
  Share2,
  Sparkles,
  Trash2,
} from "lucide-react";

export default function BulkActions() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-wrap items-center gap-4 p-5">

        <span className="font-semibold text-slate-700">
          Bulk Actions
        </span>

        <button className="rounded-xl border px-4 py-3 hover:bg-slate-100">

          <Sparkles size={18} />

        </button>

        <button className="rounded-xl border px-4 py-3 hover:bg-slate-100">

          <FolderPlus size={18} />

        </button>

        <button className="rounded-xl border px-4 py-3 hover:bg-slate-100">

          <Share2 size={18} />

        </button>

        <button className="rounded-xl border px-4 py-3 hover:bg-slate-100">

          <Download size={18} />

        </button>

        <button className="rounded-xl border border-red-200 px-4 py-3 text-red-600 hover:bg-red-50">

          <Trash2 size={18} />

        </button>

      </div>

    </section>
  );
}