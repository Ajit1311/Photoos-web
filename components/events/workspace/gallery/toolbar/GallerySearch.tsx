"use client";

import { Search } from "lucide-react";

interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function GallerySearch({
  value,
  onChange,
}: Props) {
  return (
    <div className="relative w-full lg:w-80">
      <Search
        className="
          absolute
          left-3
          top-1/2
          h-4
          w-4
          -translate-y-1/2
          text-slate-400
        "
      />

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        placeholder="Search photos..."
        className="
          w-full
          rounded-xl
          border
          border-slate-300
          bg-white
          py-2.5
          pl-10
          pr-4
          outline-none
          transition
          focus:border-[#0A3F61]
          focus:ring-2
          focus:ring-[#0A3F61]/20
        "
      />
    </div>
  );
}