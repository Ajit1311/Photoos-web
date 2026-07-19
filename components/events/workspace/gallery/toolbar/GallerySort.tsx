"use client";

import type {
  GallerySort,
} from "@/hooks/events/useGalleryFilters";

interface Props {
  value: GallerySort;

  onChange: (
    value: GallerySort,
  ) => void;
}

export default function GallerySort({
  value,
  onChange,
}: Props) {
  return (
    <select
      value={value}
      onChange={(e) =>
        onChange(
          e.target.value as GallerySort,
        )
      }
      className="
        rounded-xl
        border
        border-slate-300
        bg-white
        px-4
        py-2.5
        outline-none
        focus:border-[#0A3F61]
      "
    >
      <option value="name">
        Name
      </option>

      <option value="size">
        Size
      </option>

      <option value="status">
        Status
      </option>
    </select>
  );
}