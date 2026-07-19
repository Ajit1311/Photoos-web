"use client";

import {
  DragEvent,
  ReactNode,
  useCallback,
  useRef,
  useState,
} from "react";
import { Loader2 } from "lucide-react";

export interface UploadDropzoneProps {
  children: ReactNode;

  onFilesDropped: (files: File[]) => void;

  onValidationError?: (message: string) => void;

  disabled?: boolean;

  maxFiles?: number;

  maxFileSize?: number;
}

const DEFAULT_MAX_FILES = 500;
const DEFAULT_MAX_FILE_SIZE = 100 * 1024 * 1024;

const HIDDEN_FILES = [
  ".DS_Store",
  "Thumbs.db",
];

async function readEntry(
  entry: FileSystemEntry
): Promise<File[]> {
  if (entry.isFile) {
    return new Promise((resolve) => {
      (entry as FileSystemFileEntry).file((file) => {
        if (
          HIDDEN_FILES.includes(file.name) ||
          !file.type.startsWith("image/")
        ) {
          resolve([]);
          return;
        }

        resolve([file]);
      });
    });
  }

  if (entry.isDirectory) {
    const reader = (
      entry as FileSystemDirectoryEntry
    ).createReader();

    const collected: File[] = [];

    async function readAll(): Promise<File[]> {
      const entries =
        await new Promise<FileSystemEntry[]>((resolve) =>
          reader.readEntries(resolve)
        );

      if (!entries.length) {
        return collected;
      }

      for (const child of entries) {
        collected.push(...(await readEntry(child)));
      }

      return readAll();
    }

    return readAll();
  }

  return [];
}

async function extractFiles(
  items: DataTransferItemList
) {
  const supportsEntries =
    typeof items[0]?.webkitGetAsEntry === "function";

  if (!supportsEntries) {
    return Array.from(items)
      .map((i) => i.getAsFile())
      .filter(
        (file): file is File =>
          !!file &&
          file.type.startsWith("image/")
      );
  }

  const all = await Promise.all(
    Array.from(items).map(async (item) => {
      const entry = item.webkitGetAsEntry?.();

      if (!entry) {
        return [];
      }

      return readEntry(entry);
    })
  );

  return all.flat();
}

export default function UploadDropzone({
  children,
  onFilesDropped,
  onValidationError,
  disabled = false,
  maxFiles = DEFAULT_MAX_FILES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
}: UploadDropzoneProps) {
  const dragCounter = useRef(0);

  const [dragActive, setDragActive] =
    useState(false);

  const [scanning, setScanning] =
    useState(false);

  const stop = (
    e: DragEvent<HTMLDivElement>
  ) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      stop(e);

      if (disabled || scanning) {
        return;
      }

      dragCounter.current++;

      setDragActive(true);
    },
    [disabled, scanning]
  );

  const handleDragLeave = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      stop(e);

      if (disabled || scanning) {
        return;
      }

      dragCounter.current--;

      if (dragCounter.current <= 0) {
        dragCounter.current = 0;

        setDragActive(false);
      }
    },
    [disabled, scanning]
  );

  const handleDragOver = useCallback(
    (e: DragEvent<HTMLDivElement>) => {
      stop(e);

      if (disabled || scanning) {
        return;
      }

      e.dataTransfer.dropEffect = "copy";
    },
    [disabled, scanning]
  );

  const handleDrop = useCallback(
    async (
      e: DragEvent<HTMLDivElement>
    ) => {
      stop(e);

      dragCounter.current = 0;

      setDragActive(false);

      if (disabled || scanning) {
        return;
      }

      setScanning(true);

      try {
        const files =
          await extractFiles(
            e.dataTransfer.items
          );

        if (!files.length) {
          onValidationError?.(
            "No supported image files found."
          );
          return;
        }

        if (files.length > maxFiles) {
          onValidationError?.(
            `Maximum ${maxFiles} files allowed.`
          );
          return;
        }

        const valid = files.filter(
          (file) =>
            file.size <= maxFileSize
        );

        if (!valid.length) {
          onValidationError?.(
            "Files exceed maximum size."
          );
          return;
        }

        onFilesDropped(valid);
      } finally {
        setScanning(false);
      }
    },
    [
      disabled,
      scanning,
      maxFiles,
      maxFileSize,
      onFilesDropped,
      onValidationError,
    ]
  );

  return (
    <div
      className="relative"
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {children}

      {(dragActive || scanning) && (
        <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center rounded-2xl border-4 border-dashed border-[#0A3F61] bg-[#0A3F61]/10 backdrop-blur-sm">
          <div className="rounded-2xl bg-white px-10 py-8 shadow-xl text-center">
            {scanning ? (
              <>
                <Loader2 className="mx-auto h-10 w-10 animate-spin text-[#0A3F61]" />

                <h2 className="mt-4 text-2xl font-bold">
                  Scanning Folder...
                </h2>

                <p className="mt-2 text-slate-500">
                  Please wait while files are being discovered.
                </p>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">
                  Drop Photos or Folder
                </h2>

                <p className="mt-2 text-slate-500">
                  Release to add files to the upload queue.
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}