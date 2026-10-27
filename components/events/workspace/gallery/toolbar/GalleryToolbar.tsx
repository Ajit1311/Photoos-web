"use client";

import {
  Download,
  Filter,
  MoreHorizontal,
  SlidersHorizontal,
  Star,
  Tag,
  UserRound,
  CheckSquare,
  Square,
} from "lucide-react";

import type {
  GalleryFilter,
  GallerySort,
} from "@/hooks/events/useGalleryFilters";

interface GalleryToolbarProps {
  total: number;
  filteredCount: number;

  search: string;
  onSearch: (value: string) => void;

  filter: GalleryFilter;
  onFilter: (value: GalleryFilter) => void;

  sort: GallerySort;
  onSort: (value: GallerySort) => void;
}

export default function GalleryToolbar({
  total,
  filteredCount,
  search,
  onSearch,
  filter,
  onFilter,
  sort,
  onSort,
}: GalleryToolbarProps) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-5 p-6">

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-sm font-medium text-slate-500">
              Gallery
            </p>

            <p className="mt-1 text-sm text-slate-600">
              Showing{" "}
              <span className="font-semibold text-slate-900">
                {filteredCount}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-slate-900">
                {total}
              </span>{" "}
              photos
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >
              <UserRound size={17} />
              Face Filter
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >
              <Star size={17} />
              Rating
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >
              <Tag size={17} />
              Labels
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:border-[#0A3F61] hover:bg-[#0A3F61]/5"
            >
              <Filter size={17} />
              AI Filter
            </button>

          </div>
        </div>

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">

          <input
            type="search"
            value={search}
            onChange={(event) =>
              onSearch(event.target.value)
            }
            placeholder="Search photos..."
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#0A3F61] focus:ring-2 focus:ring-[#0A3F61]/10 lg:max-w-md"
          />

          <div className="flex flex-wrap items-center gap-3">

            <button
              type="button"
              onClick={() => onFilter("all")}
              className={[
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition",
                filter === "all"
                  ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                  : "border-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              <Square size={17} />
              All
            </button>

            <button
              type="button"
              onClick={() => onFilter("favorites")}
              className={[
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition",
                filter === "favorites"
                  ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                  : "border-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              <Star size={17} />
              Favorites
            </button>

            <button
              type="button"
              onClick={() => onFilter("selected")}
              className={[
                "flex items-center gap-2 rounded-xl border px-4 py-3 text-sm transition",
                filter === "selected"
                  ? "border-[#0A3F61] bg-[#0A3F61] text-white"
                  : "border-slate-200 hover:bg-slate-100",
              ].join(" ")}
            >
              <CheckSquare size={17} />
              Selected
            </button>

            <select
              value={sort}
              onChange={(event) =>
                onSort(
                  event.target.value as GallerySort,
                )
              }
              className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 outline-none focus:border-[#0A3F61]"
            >
              <option value="name">
                Sort by Name
              </option>

              <option value="size">
                Sort by Size
              </option>

              <option value="date">
                Sort by Date
              </option>
            </select>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100"
            >
              <SlidersHorizontal size={17} />
              Sort
            </button>

            <button
              type="button"
              className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-3 text-sm transition hover:bg-slate-100"
            >
              <Download size={17} />
              Download
            </button>

            <button
              type="button"
              className="rounded-xl border border-slate-200 p-3 transition hover:bg-slate-100"
            >
              <MoreHorizontal size={18} />
            </button>

          </div>
        </div>

      </div>
    </section>
  );
}