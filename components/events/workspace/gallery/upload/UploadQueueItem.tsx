"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  CheckCircle2,
  Clock3,
  Loader2,
  Trash2,
  XCircle,
} from "lucide-react";

import type { UploadItem as QueueItem } from "@/types/events/upload";

interface UploadQueueItemProps {
  item: QueueItem;
  index: number;
  onRemove: (id: string) => void;
}

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB", "TB"];

  const power = Math.floor(
    Math.log(bytes) / Math.log(1024)
  );

  return `${(
    bytes / Math.pow(1024, power)
  ).toFixed(2)} ${units[power]}`;
}

export default function UploadQueueItem({
  item,
  index,
  onRemove,
}: UploadQueueItemProps) {
  const [previewUrl, setPreviewUrl] =
    useState<string>();

  useEffect(() => {
    if (!item.file.type.startsWith("image/")) {
      return;
    }

    const url = URL.createObjectURL(item.file);

    setPreviewUrl(url);

    return () => {
      URL.revokeObjectURL(url);
    };
  }, [item.file]);

  const statusConfig = useMemo(() => {
    switch (item.status) {
      case "queued":
        return {
          label: "Queued",
          icon: Clock3,
          className:
            "bg-slate-100 text-slate-700",
        };

      case "uploading":
        return {
          label: "Uploading",
          icon: Loader2,
          className:
            "bg-blue-100 text-blue-700",
        };

      case "processing":
  return {
    label: "Processing",
    icon: Loader2,
    className:
      "bg-purple-100 text-purple-700",
  };

      case "completed":
        return {
          label: "Uploaded",
          icon: CheckCircle2,
          className:
            "bg-green-100 text-green-700",
        };

      case "failed":
        return {
          label: "Failed",
          icon: AlertCircle,
          className:
            "bg-red-100 text-red-700",
        };

      case "cancelled":
        return {
          label: "Cancelled",
          icon: XCircle,
          className:
            "bg-orange-100 text-orange-700",
        };

      default:
        return {
          label: item.status,
          icon: Clock3,
          className:
            "bg-slate-100 text-slate-700",
        };
    }
  }, [item.status]);

  const StatusIcon =
    statusConfig.icon;

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">

      <div className="flex gap-4">

        <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl bg-slate-100">

          {previewUrl ? (
            <img
              src={previewUrl}
              alt={item.file.name}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="text-xs text-slate-400">
              FILE
            </span>
          )}

        </div>

        <div className="flex-1">

          <div className="flex items-start justify-between gap-4">

            <div>

              <h4 className="line-clamp-1 font-semibold text-slate-900">
                {item.file.name}
              </h4>

              <p className="mt-1 text-sm text-slate-500">
                #{index + 1} • {formatBytes(item.file.size)}
              </p>

            </div>

            <button
              type="button"
              onClick={() =>
                onRemove(item.id)
              }
              className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
            >
              <Trash2 className="h-5 w-5" />
            </button>

          </div>

          <div className="mt-4">

            <div className="mb-2 flex items-center justify-between">

              <div
                className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${statusConfig.className}`}
              >
                <StatusIcon
                  className={`h-4 w-4 ${
                    item.status ===
                    "uploading"
                      ? "animate-spin"
                      : ""
                  }`}
                />

                {statusConfig.label}
              </div>

              <span className="text-sm font-medium text-slate-600">
                {item.progress ?? 0}%
              </span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-slate-200">

              <div
                className="h-full rounded-full bg-[#0A3F61] transition-all duration-300"
                style={{
                  width: `${item.progress ?? 0}%`,
                }}
              />

            </div>

            {item.error && (
              <p className="mt-3 text-sm text-red-600">
                {item.error}
              </p>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}