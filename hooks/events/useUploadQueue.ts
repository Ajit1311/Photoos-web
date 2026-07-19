"use client";

import { useCallback, useMemo, useState } from "react";

import type {
  UploadQueueItem,
  UploadStatus,
} from "@/types/events/gallery-upload";

export function useUploadQueue() {
  const [queue, setQueue] = useState<UploadQueueItem[]>([]);

  const addFiles = useCallback((files: File[]) => {
    setQueue((current) => {
      const existing = new Set(
        current.map(
          (item) =>
            `${item.file.name}-${item.file.size}-${item.file.lastModified}`
        )
      );

      const next: UploadQueueItem[] = [];

      for (const file of files) {
        const key = `${file.name}-${file.size}-${file.lastModified}`;

        if (existing.has(key)) {
          continue;
        }

        existing.add(key);

        next.push({
          id: crypto.randomUUID(),
          file,
          progress: 0,
          status: "queued",
          createdAt: new Date(),
        });
      }

      return [...current, ...next];
    });
  }, []);

  const removeFile = useCallback((id: string) => {
    setQueue((current) =>
      current.filter((item) => item.id !== id)
    );
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const updateProgress = useCallback(
    (id: string, progress: number) => {
      setQueue((current) =>
        current.map((item) =>
          item.id === id
            ? {
                ...item,
                progress,
              }
            : item
        )
      );
    },
    []
  );

  const updateStatus = useCallback(
    (
      id: string,
      status: UploadStatus,
      error?: string
    ) => {
      setQueue((current) =>
        current.map((item) => {
          if (item.id !== id) {
            return item;
          }

          return {
            ...item,
            status,
            error,
            startedAt:
              status === "uploading"
                ? item.startedAt ?? new Date()
                : item.startedAt,
            completedAt:
              status === "uploaded" ||
              status === "failed" ||
              status === "cancelled"
                ? new Date()
                : item.completedAt,
          };
        })
      );
    },
    []
  );

  const stats = useMemo(() => {
    const total = queue.length;

    const queued = queue.filter(
      (item) => item.status === "queued"
    ).length;

    const uploading = queue.filter(
      (item) => item.status === "uploading"
    ).length;

    const paused = queue.filter(
      (item) => item.status === "paused"
    ).length;

    const uploaded = queue.filter(
      (item) => item.status === "uploaded"
    ).length;

    const failed = queue.filter(
      (item) => item.status === "failed"
    ).length;

    const cancelled = queue.filter(
      (item) => item.status === "cancelled"
    ).length;

    const totalBytes = queue.reduce(
      (sum, item) => sum + item.file.size,
      0
    );

    const uploadedBytes = queue.reduce(
      (sum, item) =>
        sum +
        (item.file.size * item.progress) / 100,
      0
    );

    const progress =
      total === 0
        ? 0
        : Math.round(
            queue.reduce(
              (sum, item) =>
                sum + item.progress,
              0
            ) / total
          );

    return {
      total,
      queued,
      uploading,
      paused,
      uploaded,
      failed,
      cancelled,
      progress,
      totalBytes,
      uploadedBytes,
    };
  }, [queue]);

  return {
    queue,

    stats,

    addFiles,

    removeFile,

    clearQueue,

    updateProgress,

    updateStatus,
  };
}