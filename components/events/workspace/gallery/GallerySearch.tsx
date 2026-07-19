"use client";

import { Search } from "lucide-react";

export interface GallerySearchProps {
  value: string;

  onChange: (value: string) => void;
}

export default function GallerySearch({
  value,
  onChange,
}: GallerySearchProps) {
  return (
    <div className="relative">
      <Search
        className="
          absolute
          left-4
          top-1/2
          h-5
          w-5
          -translate-y-1/2
          text-slate-400
        "
      />

      <input
        type="search"
        placeholder="Search photos, AI category or photographer..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          rounded-2xl
          border
          border-slate-200
          bg-white
          py-3
          pl-12
          pr-4
          text-sm
          outline-none
          transition-all
          focus:border-violet-500
          focus:ring-2
          focus:ring-violet-100
        "
      />
    </div>
  );
}