"use client";

import type {
  GalleryFilter,
} from "@/hooks/events/useGalleryFilters";

interface Props {
  value: GalleryFilter;

  onChange: (
    value: GalleryFilter,
  ) => void;
}

const FILTERS: {
  value: GalleryFilter;
  label: string;
}[] = [
  {
    value: "all",
    label: "All",
  },
  {
    value: "favorites",
    label: "Favorites",
  },
  {
    value: "selected",
    label: "Selected",
  },
  {
    value: "hidden",
    label: "Hidden",
  },
  {
    value: "rejected",
    label: "Rejected",
  },
  {
    value: "ai",
    label: "AI",
  },
];

export default function GalleryFilters({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter.value}
          type="button"
          onClick={() =>
            onChange(filter.value)
          }
          className={[
            "rounded-full",
            "px-4",
            "py-2",
            "text-sm",
            "font-medium",
            "transition",

            value === filter.value
              ? "bg-[#0A3F61] text-white"
              : "border border-slate-300 bg-white text-slate-700 hover:border-[#0A3F61]",
          ].join(" ")}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}