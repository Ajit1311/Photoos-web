"use client";

import {
  ChevronLeft,
  ChevronRight,
  Copy,
  FilePlus2,
  GripVertical,
} from "lucide-react";

const pages = Array.from({ length: 12 }, (_, index) => ({
  id: index + 1,
  title: `Page ${index + 1}`,
}));

export default function PageNavigator() {
  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center justify-between">

          <div>

            <h2 className="text-lg font-bold text-slate-900">
              Album Pages
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              12 Pages
            </p>

          </div>

          <button className="rounded-xl bg-[#0A3F61] p-3 text-white transition hover:bg-[#14557F]">

            <FilePlus2 size={18} />

          </button>

        </div>

      </div>

      {/* Pages */}

      <div className="max-h-[850px] space-y-4 overflow-y-auto p-5">

        {pages.map((page, index) => (

          <button
            key={page.id}
            className={`w-full rounded-2xl border p-4 text-left transition ${
              index === 0
                ? "border-[#0A3F61] bg-[#0A3F61]/5"
                : "border-slate-200 hover:border-[#0A3F61]/40 hover:bg-slate-50"
            }`}
          >

            <div className="flex items-center justify-between">

              <div className="flex items-center gap-3">

                <GripVertical
                  size={16}
                  className="text-slate-400"
                />

                <div>

                  <h3 className="font-semibold text-slate-900">
                    {page.title}
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    8 Photos
                  </p>

                </div>

              </div>

              <Copy
                size={16}
                className="text-slate-400"
              />

            </div>

            {/* Thumbnail */}

            <div className="mt-4 aspect-[3/2] rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-200" />

          </button>

        ))}

      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 p-5">

        <div className="flex items-center justify-between">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-100">

            <ChevronLeft size={18} />

            Previous

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 transition hover:bg-slate-100">

            Next

            <ChevronRight size={18} />

          </button>

        </div>

      </div>

    </aside>
  );
}