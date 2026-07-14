"use client";

import {
  ArrowRight,
  Sparkles,
} from "lucide-react";

const layouts = [
  {
    title: "Classic Wedding",
    photos: 8,
  },
  {
    title: "Modern Story",
    photos: 6,
  },
  {
    title: "Magazine Style",
    photos: 10,
  },
];

export default function AILayoutSuggestions() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-100 p-5">

        <div className="flex items-center gap-3">

          <Sparkles
            className="text-[#0A3F61]"
            size={20}
          />

          <h2 className="text-lg font-bold">
            AI Layout Suggestions
          </h2>

        </div>

      </div>

      <div className="space-y-4 p-5">

        {layouts.map((layout) => (

          <button
            key={layout.title}
            className="w-full rounded-2xl border border-slate-200 p-4 text-left transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
          >

            <div className="flex items-center justify-between">

              <div>

                <h3 className="font-semibold text-slate-900">

                  {layout.title}

                </h3>

                <p className="mt-1 text-sm text-slate-500">

                  {layout.photos} Photos

                </p>

              </div>

              <ArrowRight
                size={18}
                className="text-[#0A3F61]"
              />

            </div>

          </button>

        ))}

      </div>

      <div className="border-t border-slate-100 p-5">

        <button className="w-full rounded-2xl bg-[#0A3F61] px-5 py-3 font-medium text-white transition hover:bg-[#14557F]">

          Generate AI Layout

        </button>

      </div>

    </section>
  );
}