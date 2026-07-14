"use client";

import {
  Filter,
  Image,
  Sparkles,
  Star,
  UserRound,
} from "lucide-react";

const filters = [
  {
    title: "All Photos",
    icon: Image,
  },
  {
    title: "AI Tagged",
    icon: Sparkles,
  },
  {
    title: "Favorites",
    icon: Star,
  },
  {
    title: "People",
    icon: UserRound,
  },
];

export default function GalleryFilters() {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">

      <div className="flex flex-wrap gap-4 p-5">

        {filters.map((filter) => {

          const Icon = filter.icon;

          return (

            <button
              key={filter.title}
              className="flex items-center gap-2 rounded-2xl border border-slate-200 px-5 py-3 transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >

              <Icon size={18} />

              {filter.title}

            </button>

          );

        })}

        <button className="ml-auto flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-3 text-white">

          <Filter size={18} />

          More Filters

        </button>

      </div>

    </section>
  );
}