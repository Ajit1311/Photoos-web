"use client";

import { Images } from "lucide-react";

import UploadButton from "./upload/UploadButton";

export interface GalleryHeaderProps {
  totalPhotos: number;

  onFilesSelected: (files: File[]) => void;
}

export default function GalleryHeader({
  totalPhotos,
  onFilesSelected,
}: GalleryHeaderProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        {/* Left */}

        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0A3F61]/10">
            <Images className="h-6 w-6 text-[#0A3F61]" />
          </div>

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Gallery
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Manage uploaded photos, preview images and client selections.
            </p>
          </div>
        </div>

        {/* Right */}

        <div className="flex flex-col items-end gap-4">
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider text-slate-500">
              Total Photos
            </p>

            <h3 className="text-3xl font-bold text-slate-900">
              {totalPhotos}
            </h3>
          </div>

          <UploadButton
            onFilesSelected={onFilesSelected}
          />
        </div>
      </div>
    </div>
  );
}