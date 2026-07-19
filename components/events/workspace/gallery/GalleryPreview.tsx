"use client";

import Image from "next/image";
import {
  Calendar,
  Camera,
  HardDrive,
  Heart,
  MapPin,
  MessageSquare,
  Star,
  User,
} from "lucide-react";

import type { GalleryPhoto } from "@/types/events/gallery";

import GalleryQuickActions from "./GalleryQuickActions";

export interface GalleryPreviewProps {
  photo: GalleryPhoto | null;
}

function formatFileSize(bytes: number) {
  if (bytes === 0) return "0 Bytes";

  const units = ["Bytes", "KB", "MB", "GB"];

  const index = Math.floor(Math.log(bytes) / Math.log(1024));

  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
}

export default function GalleryPreview({
  photo,
}: GalleryPreviewProps) {
  if (!photo) {
    return (
      <aside className="sticky top-6 space-y-6">
        <GalleryQuickActions />

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h3 className="text-lg font-semibold text-slate-700">
            No Photo Selected
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Select a photo from the gallery to preview it.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-6 space-y-6">
      <GalleryQuickActions />

      {/* Preview */}

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="relative aspect-square bg-slate-100">
          <Image
            src={photo.originalUrl}
            alt={photo.fileName}
            fill
            sizes="500px"
            className="object-cover"
          />
        </div>

        <div className="p-5">
          <h2 className="truncate text-lg font-semibold text-slate-900">
            {photo.fileName}
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            AI Category: {photo.aiCategory ?? "Uncategorized"}
          </p>
        </div>
      </div>

      {/* Photo Details */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          Photo Details
        </h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Camera className="h-4 w-4" />
              <span>Camera</span>
            </div>

            <span className="text-sm font-medium">
              {photo.cameraModel ?? "-"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <Calendar className="h-4 w-4" />
              <span>Date</span>
            </div>

            <span className="text-sm font-medium">
              {photo.captureDate ?? "-"}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <HardDrive className="h-4 w-4" />
              <span>Size</span>
            </div>

            <span className="text-sm font-medium">
              {formatFileSize(photo.fileSize)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <User className="h-4 w-4" />
              <span>Uploaded By</span>
            </div>

            <span className="text-sm font-medium">
              {photo.uploadedBy}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
              <MapPin className="h-4 w-4" />
              <span>Location</span>
            </div>

            <span className="text-sm font-medium">
              {photo.location ?? "-"}
            </span>
          </div>
        </div>
      </div>

      {/* Client Activity */}

      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold">
          Client Activity
        </h3>

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <Heart className="mx-auto mb-2 h-5 w-5 text-red-500" />

            <p className="text-xl font-bold">
              {photo.likes}
            </p>

            <p className="text-xs text-slate-500">
              Likes
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <Star className="mx-auto mb-2 h-5 w-5 text-yellow-500" />

            <p className="text-xl font-bold">
              {photo.rating.toFixed(1)}
            </p>

            <p className="text-xs text-slate-500">
              Rating
            </p>
          </div>

          <div className="rounded-xl bg-slate-50 p-4 text-center">
            <MessageSquare className="mx-auto mb-2 h-5 w-5 text-sky-500" />

            <p className="text-xl font-bold">
              {photo.comments}
            </p>

            <p className="text-xs text-slate-500">
              Comments
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}