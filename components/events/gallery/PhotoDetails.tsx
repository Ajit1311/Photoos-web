"use client";

import {
  CalendarDays,
  HardDrive,
  Image as ImageIcon,
  Sparkles,
} from "lucide-react";
import type { GalleryPhoto } from "@/types/events/gallery";

interface PhotoDetailsProps {
  photo?: GalleryPhoto | null;
}

export default function PhotoDetails({ photo }: PhotoDetailsProps) {
  if (!photo) {
    return (
      <aside className="rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-50 text-slate-400">
          <ImageIcon size={26} />
        </div>
        <h3 className="mt-4 text-base font-bold text-slate-900">No Photo Selected</h3>
        <p className="mt-1 text-xs text-slate-500 leading-relaxed">
          Click on any photo in the gallery to inspect resolution, file size, and AI status.
        </p>
      </aside>
    );
  }

  const imageUrl = photo.originalUrl || photo.thumbnailUrl;

  return (
    <aside className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
      <div className="border-b border-slate-100 p-6">
        <h2 className="text-xl font-bold text-slate-900 truncate">
          {photo.fileName || "Photo Details"}
        </h2>
        {photo.uploadedAt && (
          <p className="mt-1 text-xs text-slate-500">
            Uploaded on {new Date(photo.uploadedAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </p>
        )}
      </div>

      <div className="space-y-6 p-6">
        {/* Preview */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-slate-100 flex items-center justify-center">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={photo.fileName || "Photo preview"}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400">
              <ImageIcon size={32} />
              <span className="text-xs">Preview unavailable</span>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-4 text-sm">
          {photo.width > 0 && photo.height > 0 && (
            <InfoRow
              icon={<ImageIcon size={16} />}
              label="Resolution"
              value={`${photo.width} × ${photo.height}`}
            />
          )}

          {photo.fileSize > 0 && (
            <InfoRow
              icon={<HardDrive size={16} />}
              label="File Size"
              value={`${(photo.fileSize / (1024 * 1024)).toFixed(1)} MB`}
            />
          )}

          {photo.uploadedAt && (
            <InfoRow
              icon={<CalendarDays size={16} />}
              label="Uploaded"
              value={new Date(photo.uploadedAt).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            />
          )}
        </div>

        {/* AI Processing Status */}
        <div className="rounded-2xl bg-[#0A3F61]/5 p-5">
          <div className="flex items-center gap-2 text-[#0A3F61]">
            <Sparkles size={18} />
            <h3 className="font-semibold text-sm">AI Analysis</h3>
          </div>

          <div className="mt-3 flex items-center justify-between text-xs text-slate-700">
            <span>Face Recognition</span>
            <span className="font-bold text-emerald-700">
              {photo.aiProcessed ? "Processed" : "Pending"}
            </span>
          </div>
        </div>
      </div>
    </aside>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between text-xs">
      <div className="flex items-center gap-2 text-slate-500">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-semibold text-slate-800 truncate max-w-[160px]">{value}</span>
    </div>
  );
}
