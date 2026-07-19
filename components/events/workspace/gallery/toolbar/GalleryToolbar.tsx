"use client";

import GalleryFilters from "./GalleryFilters";
import GallerySearch from "./GallerySearch";
import GallerySort from "./GallerySort";

import type {
  GalleryFilter,
  GallerySort as GallerySortType,
} from "@/hooks/events/useGalleryFilters";

interface Props {
  total: number;

  filteredCount: number;

  search: string;

  filter: GalleryFilter;

 sort: GallerySortType;

  onSearch: (
    value: string,
  ) => void;

  onFilter: (
    value: GalleryFilter,
  ) => void;

  onSort: (
  value: GallerySortType,
) => void;
}

export default function GalleryToolbar({
  total,
  filteredCount,
  search,
  filter,
  sort,
  onSearch,
  onFilter,
  onSort,
}: Props) {
  return (
    <div
      className="
        sticky
        top-0
        z-20
        mb-6
        rounded-2xl
        border
        border-slate-200
        bg-white/95
        p-5
        shadow-sm
        backdrop-blur
      "
    >
      <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">

        <div className="flex flex-col gap-4">
          <GallerySearch
            value={search}
            onChange={onSearch}
          />

          <GalleryFilters
            value={filter}
            onChange={onFilter}
          />
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Showing
            </p>

            <h3 className="text-xl font-bold text-slate-900">
              {filteredCount} / {total}
            </h3>
          </div>

          <GallerySort
            value={sort}
            onChange={onSort}
          />
        </div>

      </div>
    </div>
  );
}