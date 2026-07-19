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

const FILTERS: GalleryFilter[] = [
  "all",
  "queued",
  "uploading",
  "processing",
  "completed",
  "failed",
  "cancelled",
];

export default function GalleryFilters({
  value,
  onChange,
}: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {FILTERS.map((filter) => (
        <button
          key={filter}
          onClick={() =>
            onChange(filter)
          }
          className={[
            "rounded-full",
            "px-4",
            "py-2",
            "text-sm",
            "font-medium",
            "transition",

            value === filter
              ? "bg-[#0A3F61] text-white"
              : "border border-slate-300 bg-white hover:border-[#0A3F61]",
          ].join(" ")}
        >
          {filter}
        </button>
      ))}
    </div>
  );
}