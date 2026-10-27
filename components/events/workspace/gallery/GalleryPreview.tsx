"use client";

import Image from "next/image";

import {
  Calendar,
  Camera,
  ChevronLeft,
  ChevronRight,
  Expand,
  HardDrive,
  Heart,
  MapPin,
  MessageSquare,
  Star,
  User,
  X,
} from "lucide-react";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";


export interface GalleryPreviewProps {
  photo: GalleryPhoto | null;

  currentIndex?: number;

  total?: number;

  onPrevious?: () => void;

  onNext?: () => void;
}

function formatFileSize(
  bytes: number,
): string {
  if (!bytes || bytes <= 0) {
    return "0 Bytes";
  }

  const units = [
    "Bytes",
    "KB",
    "MB",
    "GB",
  ];

  const index = Math.min(
    Math.floor(
      Math.log(bytes) /
        Math.log(1024),
    ),
    units.length - 1,
  );

  return `${(
    bytes /
    Math.pow(1024, index)
  ).toFixed(1)} ${units[index]}`;
}

function formatDate(
  value?: string,
): string {
  if (!value) {
    return "-";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return date.toLocaleString(
    undefined,
    {
      dateStyle: "medium",
      timeStyle: "short",
    },
  );
}

export default function GalleryPreview({
  photo,
  currentIndex = -1,
  total = 0,
  onPrevious,
  onNext,
}: GalleryPreviewProps) {
  const [
    lightboxOpen,
    setLightboxOpen,
  ] = useState(false);

  /*
   * Keep the selected image source stable.
   *
   * GalleryPhoto already provides signed Supabase URLs.
   * We prefer thumbnail for the normal preview and
   * original for the fullscreen lightbox.
   */
  const previewUrl = useMemo(
    () => {
      if (!photo) {
        return "";
      }

      return (
        photo.thumbnailUrl ||
        photo.originalUrl ||
        ""
      );
    },
    [photo],
  );

  const originalUrl = useMemo(
    () => {
      if (!photo) {
        return "";
      }

      return (
        photo.originalUrl ||
        photo.thumbnailUrl ||
        ""
      );
    },
    [photo],
  );

  const closeLightbox =
    useCallback(() => {
      setLightboxOpen(false);
    }, []);

  const handlePrevious =
    useCallback(() => {
      onPrevious?.();
    }, [onPrevious]);

  const handleNext =
    useCallback(() => {
      onNext?.();
    }, [onNext]);

  /*
   * Keyboard navigation
   */
  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (
        event.key === "Escape"
      ) {
        closeLightbox();
        return;
      }

      if (
        event.key === "ArrowLeft"
      ) {
        handlePrevious();
        return;
      }

      if (
        event.key === "ArrowRight"
      ) {
        handleNext();
      }
    };

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [
    lightboxOpen,
    closeLightbox,
    handlePrevious,
    handleNext,
  ]);

  /*
   * Prevent page scrolling while fullscreen
   * preview is open.
   */
  useEffect(() => {
    if (!lightboxOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      "hidden";

    return () => {
      document.body.style.overflow =
        previousOverflow;
    };
  }, [lightboxOpen]);

  /*
   * Close the lightbox whenever the selected
   * photo changes.
   */

  if (!photo) {
    return (
      <aside className="sticky top-6 space-y-6">

        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100">
            <Expand className="h-6 w-6 text-slate-400" />
          </div>

          <h3 className="mt-4 text-lg font-semibold text-slate-700">
            No Photo Selected
          </h3>

          <p className="mt-2 text-sm text-slate-500">
            Select a photo from the
            gallery to preview it.
          </p>
        </div>
      </aside>
    );
  }

  return (
    <>
      <aside className="sticky top-6 space-y-6">

        {/* ================================================================ */}
        {/* PHOTO PREVIEW */}
        {/* ================================================================ */}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="relative aspect-square bg-slate-100">
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt={photo.fileName}
                fill
                sizes="500px"
                priority
                unoptimized
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <div className="text-center">
                  <Expand className="mx-auto h-8 w-8 text-slate-400" />

                  <p className="mt-3 text-sm text-slate-500">
                    Preview unavailable
                  </p>
                </div>
              </div>
            )}

            {/* Open Lightbox */}

            {previewUrl && (
              <button
                type="button"
                onClick={() =>
                  setLightboxOpen(true)
                }
                className="absolute right-3 top-3 inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                aria-label="Open photo preview"
                title="Open full preview"
              >
                <Expand className="h-5 w-5" />
              </button>
            )}

            {/* Previous */}

            {total > 1 &&
              onPrevious && (
                <button
                  type="button"
                  onClick={
                    handlePrevious
                  }
                  className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Previous photo"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
              )}

            {/* Next */}

            {total > 1 &&
              onNext && (
                <button
                  type="button"
                  onClick={
                    handleNext
                  }
                  className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-black/60 text-white backdrop-blur transition hover:bg-black/75"
                  aria-label="Next photo"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              )}

            {/* Counter */}

            {currentIndex >= 0 &&
              total > 0 && (
                <div className="absolute bottom-3 left-3 rounded-lg bg-black/65 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
                  {currentIndex + 1}
                  {" / "}
                  {total}
                </div>
              )}
          </div>

          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <h2 className="truncate text-lg font-semibold text-slate-900">
                  {photo.fileName}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  AI Category:{" "}
                  {photo.aiCategory ??
                    "Uncategorized"}
                </p>
              </div>

              <span
                className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                  photo.status ===
                  "ready"
                    ? "bg-emerald-50 text-emerald-700"
                    : photo.status ===
                        "processing"
                      ? "bg-amber-50 text-amber-700"
                      : photo.status ===
                          "failed"
                        ? "bg-red-50 text-red-700"
                        : "bg-slate-100 text-slate-600"
                }`}
              >
                {photo.status}
              </span>
            </div>
          </div>
        </div>

        {/* ================================================================ */}
        {/* PHOTO DETAILS */}
        {/* ================================================================ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Photo Details
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Camera className="h-4 w-4" />
                <span>Camera</span>
              </div>

              <span className="truncate text-right text-sm font-medium text-slate-800">
                {photo.cameraModel ??
                  "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Camera className="h-4 w-4" />
                <span>Lens</span>
              </div>

              <span className="truncate text-right text-sm font-medium text-slate-800">
                {photo.lensModel ??
                  "-"}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <Calendar className="h-4 w-4" />
                <span>Captured</span>
              </div>

              <span className="text-right text-sm font-medium text-slate-800">
                {formatDate(
                  photo.captureDate,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <HardDrive className="h-4 w-4" />
                <span>Size</span>
              </div>

              <span className="text-sm font-medium text-slate-800">
                {formatFileSize(
                  photo.fileSize,
                )}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <User className="h-4 w-4" />
                <span>Uploaded By</span>
              </div>

              <span className="truncate text-right text-sm font-medium text-slate-800">
                {photo.uploadedBy}
              </span>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-slate-500">
                <MapPin className="h-4 w-4" />
                <span>Location</span>
              </div>

              <span className="truncate text-right text-sm font-medium text-slate-800">
                {photo.location ??
                  "-"}
              </span>
            </div>

            {photo.iso !==
              undefined && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  ISO
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {photo.iso}
                </span>
              </div>
            )}

            {photo.aperture && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Aperture
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {photo.aperture}
                </span>
              </div>
            )}

            {photo.shutterSpeed && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Shutter
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {photo.shutterSpeed}
                </span>
              </div>
            )}

            {photo.focalLength && (
              <div className="flex items-center justify-between gap-4">
                <span className="text-sm text-slate-500">
                  Focal Length
                </span>

                <span className="text-sm font-medium text-slate-800">
                  {photo.focalLength}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* ================================================================ */}
        {/* CLIENT ACTIVITY */}
        {/* ================================================================ */}

        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">
            Client Activity
          </h3>

          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <Heart className="mx-auto mb-2 h-5 w-5 text-red-500" />

              <p className="text-xl font-bold text-slate-900">
                {photo.likes}
              </p>

              <p className="text-xs text-slate-500">
                Likes
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <Star className="mx-auto mb-2 h-5 w-5 text-yellow-500" />

              <p className="text-xl font-bold text-slate-900">
                {photo.rating.toFixed(
                  1,
                )}
              </p>

              <p className="text-xs text-slate-500">
                Rating
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 text-center">
              <MessageSquare className="mx-auto mb-2 h-5 w-5 text-sky-500" />

              <p className="text-xl font-bold text-slate-900">
                {photo.comments}
              </p>

              <p className="text-xs text-slate-500">
                Comments
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* ================================================================== */}
      {/* FULLSCREEN PHOTO LIGHTBOX */}
      {/* ================================================================== */}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`Preview ${photo.fileName}`}
          onMouseDown={(
            event,
          ) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeLightbox();
            }
          }}
        >
          {/* Close */}

          <button
            type="button"
            onClick={
              closeLightbox
            }
            className="absolute right-5 top-5 z-20 inline-flex h-11 w-11 items-center justify-center rounded-xl border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
            aria-label="Close preview"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Counter */}

          {currentIndex >= 0 &&
            total > 0 && (
              <div className="absolute left-5 top-5 z-20 rounded-xl border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur">
                {currentIndex + 1}
                {" / "}
                {total}
              </div>
            )}

          {/* Previous */}

          {total > 1 &&
            onPrevious && (
              <button
                type="button"
                onClick={
                  handlePrevious
                }
                className="absolute left-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Previous photo"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
            )}

          {/* Next */}

          {total > 1 &&
            onNext && (
              <button
                type="button"
                onClick={
                  handleNext
                }
                className="absolute right-4 top-1/2 z-20 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white backdrop-blur transition hover:bg-white/20"
                aria-label="Next photo"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
            )}

          {/* Image */}

          <div className="relative h-[calc(100vh-7rem)] w-[calc(100vw-7rem)] max-w-[1600px]">
            {originalUrl ? (
              <Image
                src={originalUrl}
                alt={photo.fileName}
                fill
                sizes="100vw"
                priority
                unoptimized
                className="object-contain"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-white/70">
                Preview unavailable
              </div>
            )}
          </div>

          {/* Bottom information */}

          <div className="absolute bottom-5 left-1/2 z-20 w-[min(700px,calc(100vw-2rem))] -translate-x-1/2 rounded-2xl border border-white/10 bg-black/60 px-5 py-4 text-white backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">
                  {photo.fileName}
                </p>

                <p className="mt-1 truncate text-xs text-white/60">
                  {photo.aiCategory ??
                    "Uncategorized"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4 text-xs text-white/70">
                <span>
                  {photo.likes} likes
                </span>

                <span>
                  {photo.comments} comments
                </span>

                {photo.isFavorite && (
                  <Heart className="h-4 w-4 fill-current text-red-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}