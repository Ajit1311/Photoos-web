"use client";

import {
  RotateCcw,
  Trash2,
  XCircle,
} from "lucide-react";

import type {
  UploadItem,
} from "@/types/events/upload";

import UploadQueueItemCard from "./UploadQueueItem";

interface Props {
  items: UploadItem[];

  isUploading: boolean;

  overallProgress: number;

  onRemove: (id: string) => void;

  onRetry: (id: string) => void;

  onCancel: (id: string) => void;

  onClearCompleted: () => void;
}

export default function UploadQueue({
  items,
  isUploading,
  overallProgress,
  onRemove,
  onRetry,
  onCancel,
  onClearCompleted,
}: Props) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">

      <div className="border-b border-slate-200 p-6">

        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-xl font-bold">
              Upload Queue
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {items.length} file(s)
            </p>
          </div>

          <button
            type="button"
            onClick={onClearCompleted}
            disabled={isUploading}
            className="rounded-lg border px-4 py-2 text-sm disabled:opacity-50"
          >
            Clear Completed
          </button>

        </div>

      </div>

      <div className="border-b p-6">

        <div className="mb-2 flex justify-between text-sm">

          <span>
            Overall Progress
          </span>

          <span>
            {overallProgress}%
          </span>

        </div>

        <div className="h-3 rounded-full bg-slate-200">

          <div
            className="h-full rounded-full bg-[#0A3F61] transition-all duration-300"
            style={{
              width: `${overallProgress}%`,
            }}
          />

        </div>

      </div>

      <div className="max-h-[520px] space-y-4 overflow-y-auto p-6">

        {items.map(
          (item, index) => (
            <UploadQueueItemCard
              key={item.id}
              item={item}
              index={index}
              onRemove={onRemove}
            />
          ),
        )}

      </div>

      <div className="flex flex-wrap gap-3 border-t bg-slate-50 p-6">

        <button
          type="button"
          onClick={onClearCompleted}
          className="inline-flex items-center rounded-xl border px-6 py-3"
        >
          <Trash2 className="mr-2 h-5 w-5" />
          Clear Completed
        </button>

        <button
          type="button"
          onClick={() => {
            items
              .filter(
                (item) =>
                  item.status === "failed",
              )
              .forEach(
                (item) =>
                  onRetry(item.id),
              );
          }}
          className="inline-flex items-center rounded-xl border px-6 py-3"
        >
          <RotateCcw className="mr-2 h-5 w-5" />
          Retry
        </button>

        <button
          type="button"
          onClick={() => {
            items
              .filter(
                (item) =>
                  item.status === "uploading" ||
                  item.status === "processing",
              )
              .forEach(
                (item) =>
                  onCancel(item.id),
              );
          }}
          disabled={!isUploading}
          className="inline-flex items-center rounded-xl border border-red-300 px-6 py-3 text-red-600 disabled:opacity-50"
        >
          <XCircle className="mr-2 h-5 w-5" />
          Cancel Uploads
        </button>

      </div>

    </div>
  );
}
