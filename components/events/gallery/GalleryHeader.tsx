"use client";

import {
  Grid2X2,
  List,
  Search,
  Upload,
  Images,
} from "lucide-react";

export default function GalleryHeader() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-6 p-6 xl:flex-row xl:items-center xl:justify-between">

        {/* Left */}

        <div>

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

              <Images size={24} />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Gallery
              </h1>

              <p className="mt-1 text-slate-500">
                Manage event photos, AI workflow and gallery delivery.
              </p>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap items-center gap-3">

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <Grid2X2 size={18} />

          </button>

          <button className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100">

            <List size={18} />

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-white transition hover:bg-[#14557F]">

            <Upload size={18} />

            Upload Photos

          </button>

        </div>

      </div>

      <div className="border-t border-slate-100 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          {/* Search */}

          <div className="relative w-full lg:max-w-md">

            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              type="text"
              placeholder="Search photos..."
              className="w-full rounded-2xl border border-slate-200 py-3 pl-12 pr-4 outline-none transition focus:border-[#0A3F61]"
            />

          </div>

          {/* Stats */}

          <div className="flex flex-wrap gap-3">

            <div className="rounded-2xl bg-slate-100 px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-slate-500">
                Total
              </p>

              <p className="mt-1 text-lg font-bold text-slate-900">
                12,482
              </p>

            </div>

            <div className="rounded-2xl bg-blue-50 px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-blue-600">
                Selected
              </p>

              <p className="mt-1 text-lg font-bold text-blue-700">
                248
              </p>

            </div>

            <div className="rounded-2xl bg-green-50 px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-green-600">
                AI Tagged
              </p>

              <p className="mt-1 text-lg font-bold text-green-700">
                11,936
              </p>

            </div>

            <div className="rounded-2xl bg-orange-50 px-5 py-3">

              <p className="text-xs uppercase tracking-wide text-orange-600">
                Favorites
              </p>

              <p className="mt-1 text-lg font-bold text-orange-700">
                364
              </p>

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}