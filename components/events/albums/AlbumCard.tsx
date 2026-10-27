"use client";

import {
  Archive,
  BookOpen,
  ChevronRight,
  Heart,
} from "lucide-react";

import type {
  AlbumCard as AlbumCardType,
} from "@/lib/api/albums";

interface AlbumCardProps {
  album: AlbumCardType;
  onOpen: (
    album: AlbumCardType,
  ) => void;
}

function formatUpdatedAt(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  );
}

function getStatusLabel(
  status: string,
) {
  return status
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (letter) =>
        letter.toUpperCase(),
    );
}

export default function AlbumCard({
  album,
  onOpen,
}: AlbumCardProps) {
  const status =
    getStatusLabel(
      album.status,
    );

  return (
    <button
      type="button"
      onClick={() =>
        onOpen(album)
      }
      className="group overflow-hidden rounded-3xl border border-slate-200 bg-white text-left shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-lg"
    >
      {/* Cover */}
      <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-gradient-to-br from-slate-100 via-white to-slate-200">

        {album.cover_asset?.thumbnail_path ? (
          <div className="flex h-full w-full items-center justify-center bg-slate-100">
            <BookOpen className="h-12 w-12 text-slate-300" />
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-[#0A3F61]/10">
              <BookOpen className="h-9 w-9 text-[#0A3F61]" />
            </div>
          </div>
        )}

        {/* Favorite */}
        {album.is_favorite && (
          <div className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-white/95 shadow-sm">
            <Heart
              className="h-4 w-4 fill-current text-rose-500"
            />
          </div>
        )}

        {/* Status */}
        <div className="absolute bottom-3 left-3">
          <span
            className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${
              album.status ===
              "active"
                ? "bg-emerald-100 text-emerald-700"
                : album.status ===
                    "completed"
                  ? "bg-blue-100 text-blue-700"
                  : album.status ===
                      "archived"
                    ? "bg-slate-200 text-slate-600"
                    : "bg-amber-100 text-amber-700"
            }`}
          >
            {status}
          </span>
        </div>

      </div>

      {/* Details */}
      <div className="p-4">

        <div className="flex items-start justify-between gap-3">

          <div className="min-w-0">
            <h3 className="truncate text-base font-semibold text-slate-900">
              {album.title}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {album.code}
            </p>
          </div>

          <ChevronRight className="mt-1 h-4 w-4 shrink-0 text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-[#0A3F61]" />

        </div>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">

          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Archive className="h-3.5 w-3.5" />
            {album.album_type}
          </div>

          <span className="text-[11px] text-slate-400">
            {formatUpdatedAt(
              album.updated_at,
            )}
          </span>

        </div>

      </div>
    </button>
  );
}