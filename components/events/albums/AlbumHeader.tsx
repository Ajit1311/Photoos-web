"use client";

import {
  BookOpen,
  Clock3,
  Download,
  Printer,
  Save,
  Sparkles,
} from "lucide-react";

export default function AlbumHeader() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-col gap-6 p-6 xl:flex-row xl:items-center xl:justify-between">

        {/* Left */}

        <div>

          <div className="flex items-center gap-3">

            <div className="rounded-2xl bg-[#0A3F61]/10 p-3 text-[#0A3F61]">

              <BookOpen size={24} />

            </div>

            <div>

              <h1 className="text-3xl font-bold text-slate-900">
                Wedding Album
              </h1>

              <p className="mt-2 text-slate-500">
                Rahul & Priya Wedding Album
              </p>

            </div>

          </div>

        </div>

        {/* Right */}

        <div className="flex flex-wrap gap-3">

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 hover:bg-slate-100">

            <Sparkles size={18} />

            AI Layout

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 hover:bg-slate-100">

            <Save size={18} />

            Save

          </button>

          <button className="flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 hover:bg-slate-100">

            <Printer size={18} />

            Print

          </button>

          <button className="flex items-center gap-2 rounded-xl bg-[#0A3F61] px-5 py-3 text-white hover:bg-[#14557F]">

            <Download size={18} />

            Export PDF

          </button>

        </div>

      </div>

      <div className="border-t border-slate-100 p-6">

        <div className="grid gap-4 md:grid-cols-4">

          <div className="rounded-2xl bg-slate-100 p-5">

            <p className="text-xs uppercase tracking-wide text-slate-500">
              Pages
            </p>

            <h2 className="mt-2 text-3xl font-bold text-slate-900">
              32
            </h2>

          </div>

          <div className="rounded-2xl bg-blue-50 p-5">

            <p className="text-xs uppercase tracking-wide text-blue-600">
              Selected Photos
            </p>

            <h2 className="mt-2 text-3xl font-bold text-blue-700">
              248
            </h2>

          </div>

          <div className="rounded-2xl bg-green-50 p-5">

            <p className="text-xs uppercase tracking-wide text-green-600">
              Album Status
            </p>

            <h2 className="mt-2 text-xl font-bold text-green-700">
              Draft
            </h2>

          </div>

          <div className="rounded-2xl bg-orange-50 p-5">

            <div className="flex items-center gap-2">

              <Clock3
                size={16}
                className="text-orange-600"
              />

              <p className="text-xs uppercase tracking-wide text-orange-600">
                Last Saved
              </p>

            </div>

            <h2 className="mt-2 text-xl font-bold text-orange-700">
              2 min ago
            </h2>

          </div>

        </div>

      </div>

    </section>
  );
}