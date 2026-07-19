"use client";

import Image from "next/image";
import {
  CheckCircle2,
  Heart,
  Sparkles,
  Star,
} from "lucide-react";

export interface PhotoThumbnailProps {
  id: string;

  thumbnailUrl: string;

  fileName: string;

  isSelected?: boolean;

  isFavorite?: boolean;

  aiTagged?: boolean;

  rating?: number;

  active?: boolean;

  onClick?: (photoId: string) => void;
}

export default function PhotoThumbnail({
  id,
  thumbnailUrl,
  fileName,
  isSelected = false,
  isFavorite = false,
  aiTagged = false,
  rating = 0,
  active = false,
  onClick,
}: PhotoThumbnailProps) {
  return (
    <button
      type="button"
      onClick={() => onClick?.(id)}
      className={[
        "group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-200",
        "hover:-translate-y-1 hover:shadow-lg",
        active
          ? "border-violet-600 ring-2 ring-violet-200"
          : "border-slate-200",
      ].join(" ")}
    >
      {/* Thumbnail */}

      <div className="relative aspect-square overflow-hidden bg-slate-100">
        <Image
          src={thumbnailUrl}
          alt={fileName}
          fill
          sizes="300px"
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />

        {/* Hover Overlay */}

        <div className="absolute inset-0 bg-black/0 transition-all duration-200 group-hover:bg-black/30" />

        {/* AI Badge */}

        {aiTagged && (
          <div className="absolute left-3 top-3 rounded-full bg-violet-600 px-2 py-1 text-white shadow-lg">
            <Sparkles className="h-3.5 w-3.5" />
          </div>
        )}

        {/* Client Selected */}

        {isSelected && (
          <div className="absolute right-3 top-3 rounded-full bg-emerald-600 p-1.5 text-white shadow-lg">
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )}

        {/* Favorite */}

        {isFavorite && (
          <div className="absolute left-3 bottom-3 rounded-full bg-red-500 p-1.5 text-white shadow-lg">
            <Heart className="h-4 w-4 fill-current" />
          </div>
        )}
      </div>

      {/* Footer */}

      <div className="space-y-2 p-3">
        <p
          className="truncate text-sm font-medium text-slate-800"
          title={fileName}
        >
          {fileName}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <Star
                key={index}
                className={`h-3.5 w-3.5 ${
                  index < rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-slate-300"
                }`}
              />
            ))}
          </div>

          <span
            className={`text-xs font-medium ${
              active
                ? "text-violet-600"
                : "text-slate-500"
            }`}
          >
            {active ? "Selected" : "Preview"}
          </span>
        </div>
      </div>
    </button>
  );
}