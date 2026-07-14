"use client";

import {
  ImagePlus,
  Move,
  ZoomIn,
} from "lucide-react";

const placeholders = [
  {
    id: 1,
    className: "col-span-6 row-span-6",
  },
  {
    id: 2,
    className: "col-span-3 row-span-3",
  },
  {
    id: 3,
    className: "col-span-3 row-span-3",
  },
  {
    id: 4,
    className: "col-span-6 row-span-3",
  },
];

export default function AlbumCanvas() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      {/* Header */}

      <div className="flex items-center justify-between border-b border-slate-100 p-5">

        <div>

          <h2 className="text-xl font-bold text-slate-900">
            Album Canvas
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Double Spread • 12 × 36 Inches
          </p>

        </div>

        <div className="flex items-center gap-3">

          <button className="rounded-xl border border-slate-200 p-3 hover:bg-slate-100">

            <Move size={18} />

          </button>

          <button className="rounded-xl border border-slate-200 p-3 hover:bg-slate-100">

            <ZoomIn size={18} />

          </button>

        </div>

      </div>

      {/* Workspace */}

      <div className="overflow-auto bg-slate-100 p-10">

        <div className="mx-auto w-full max-w-6xl">

          {/* Canvas */}

          <div className="relative aspect-[3/1] rounded-xl bg-white shadow-xl">

            {/* Safe Margin */}

            <div className="absolute inset-6 border-2 border-dashed border-blue-300" />

            {/* Center Fold */}

            <div className="absolute bottom-0 left-1/2 top-0 w-px bg-red-300" />

            {/* Grid */}

            <div className="grid h-full grid-cols-12 grid-rows-6 gap-4 p-8">

              {placeholders.map((item) => (

                <button
                  key={item.id}
                  className={`group flex items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5 ${item.className}`}
                >

                  <div className="text-center">

                    <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-slate-200 transition group-hover:bg-[#0A3F61]/10">

                      <ImagePlus
                        size={24}
                        className="text-slate-500 group-hover:text-[#0A3F61]"
                      />

                    </div>

                    <p className="text-sm font-medium text-slate-600">
                      Drop Photo
                    </p>

                  </div>

                </button>

              ))}

            </div>

          </div>

        </div>

      </div>

      {/* Footer */}

      <div className="border-t border-slate-100 px-6 py-5">

        <div className="flex flex-wrap items-center justify-between gap-4">

          <div className="flex gap-6 text-sm text-slate-500">

            <span>
              Layout: Classic Wedding
            </span>

            <span>
              Photos: 8
            </span>

            <span>
              Resolution: Print Ready
            </span>

          </div>

          <div className="rounded-xl bg-green-100 px-4 py-2 text-sm font-medium text-green-700">

            Ready for AI Layout

          </div>

        </div>

      </div>

    </section>
  );
}