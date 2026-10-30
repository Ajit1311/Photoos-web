"use client";

import { useState } from "react";

import PhotoCard from "./PhotoCard";
import FaceSearchModal from "./FaceSearchModal";
import CustomToast from "@/components/ui/custom-toast";

import {
  toggleGalleryPhotoFavorite,
} from "@/lib/api/functions";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";

interface PhotoGridProps {
  photos: GalleryPhoto[];

  selectedIds: string[];

  onSelectionChange: (
    ids: string[],
  ) => void;

  galleryId?: string;
}

export default function PhotoGrid({
  photos,
  selectedIds,
  onSelectionChange,
  galleryId,
}: PhotoGridProps) {
  const [
    isAiFiltered,
    setIsAiFiltered,
  ] = useState(false);

  const [
    filteredPhotos,
    setFilteredPhotos,
  ] = useState<GalleryPhoto[]>(photos);

  const [
    isModalOpen,
    setIsModalOpen,
  ] = useState(false);

  const [
    isProcessing,
    setIsProcessing,
  ] = useState(false);

  const [
    toast,
    setToast,
  ] = useState<{
    message: string;
    type: "success" | "error" | "warning";
  } | null>(null);

  const handleToggleFavorite = async (
    assetId: string,
  ) => {
    if (isProcessing) {
      return;
    }

    setIsProcessing(true);

    try {
      const currentPhoto = photos.find((p) => p.id === assetId);
      const effectiveGalleryId =
        galleryId ||
        (currentPhoto as any)?.gallery_id ||
        (currentPhoto as any)?.event_id ||
        "";

      const result =
        await toggleGalleryPhotoFavorite(
          assetId,
          effectiveGalleryId,
        );

      if (!result.success) {
        setToast({
          message:
            result.message ||
            "Something went wrong. Please try again.",
          type: "error",
        });

        return;
      }

      if (
        result.message
          .toLowerCase()
          .includes("limit")
      ) {
        setToast({
          message:
            "Limit reached! You can select a maximum of 200 photos.",
          type: "warning",
        });

        return;
      }

      const currentlySelected =
        selectedIds.includes(assetId);

      const nextSelectedIds =
        currentlySelected
          ? selectedIds.filter(
              (id) => id !== assetId,
            )
          : [
              ...selectedIds,
              assetId,
            ];

      onSelectionChange(
        nextSelectedIds,
      );

      setToast({
        message: currentlySelected
          ? "Selection removed."
          : "Photo selected successfully.",
        type: "success",
      });
    } catch (error) {
      console.error(
        "PHOTO SELECTION ERROR:",
        error,
      );

      setToast({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong. Please try again.",
        type: "error",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFaceMatched = (
    _faceProfileId: string,
  ) => {
    const matched =
      photos.filter(
        (photo) =>
          photo.aiProcessed,
      );

    setFilteredPhotos(
      matched,
    );

    setIsAiFiltered(true);

    setToast({
      message:
        `AI found ${matched.length} matching photos.`,
      type: "success",
    });
  };

  const resetAiFilter = () => {
    setFilteredPhotos(
      photos,
    );

    setIsAiFiltered(false);

    setToast({
      message:
        "Gallery filter reset successfully.",
      type: "success",
    });
  };

  if (filteredPhotos.length === 0) {
    return (
      <section className="relative rounded-3xl border border-slate-200 bg-white shadow-sm">

        {toast && (
          <CustomToast
            message={toast.message}
            type={toast.type}
            onClose={() =>
              setToast(null)
            }
          />
        )}

        <div className="border-b border-slate-100 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h2 className="text-2xl font-bold text-slate-900">
                Photo Gallery
              </h2>

              <p className="mt-2 text-slate-500">
                Select photos for albums, AI and delivery.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setIsModalOpen(true)
              }
              className="rounded-2xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A3F61]/95"
            >
              Find My Photos (AI)
            </button>

          </div>
        </div>

        <FaceSearchModal
          isOpen={isModalOpen}
          onClose={() =>
            setIsModalOpen(false)
          }
          galleryId=""
          studioId=""
          onFaceMatched={
            handleFaceMatched
          }
        />

        <div className="px-6 py-16 text-center text-slate-400">
          No matching photos found.
        </div>

      </section>
    );
  }

  return (
    <section className="relative rounded-3xl border border-slate-200 bg-white shadow-sm">

      {toast && (
        <CustomToast
          message={toast.message}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      <FaceSearchModal
        isOpen={isModalOpen}
        onClose={() =>
          setIsModalOpen(false)
        }
        galleryId=""
        studioId=""
        onFaceMatched={
          handleFaceMatched
        }
      />

      <div className="border-b border-slate-100 px-6 py-5">

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              Photo Gallery
            </h2>

            <p className="mt-2 text-slate-500">
              Select photos for albums, AI and delivery.
            </p>
          </div>

          <div className="flex items-center gap-4">

            {isAiFiltered ? (
              <button
                type="button"
                onClick={
                  resetAiFilter
                }
                className="rounded-2xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-600 transition hover:bg-red-100"
              >
                Clear AI Filter
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  setIsModalOpen(true)
                }
                className="flex items-center gap-2 rounded-2xl bg-[#0A3F61] px-5 py-2.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#0A3F61]/95"
              >
                Find My Photos (AI)
              </button>
            )}

            <div className="rounded-2xl bg-[#0A3F61]/10 px-5 py-2 text-center">

              <p className="text-[10px] font-medium uppercase tracking-wide text-[#0A3F61]">
                Photos
              </p>

              <h3 className="text-lg font-bold text-[#0A3F61]">
                {filteredPhotos.length}
              </h3>

            </div>

          </div>
        </div>

      </div>

      <div className="max-h-[900px] overflow-y-auto p-6">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">

          {filteredPhotos.map(
            (photo) => (
              <PhotoCard
                key={photo.id}
                id={photo.fileName}
                image={
                  photo.thumbnailUrl ||
                  photo.originalUrl
                }
                rating={
                  photo.rating
                }
                favorite={
                  photo.isFavorite
                }
                selected={
                  selectedIds.includes(
                    photo.id,
                  )
                }
                faces={
                  photo.aiProcessed
                    ? 1
                    : 0
                }
                label={
                  photo.colorLabel ===
                  "Red"
                    ? "Red"
                    : photo.colorLabel ===
                        "Blue"
                      ? "Blue"
                      : photo.colorLabel ===
                          "Green"
                        ? "Green"
                        : photo.colorLabel ===
                            "Yellow"
                          ? "Yellow"
                          : "Purple"
                }
                onToggleFavorite={
                  handleToggleFavorite
                }
              />
            ),
          )}

        </div>

      </div>

    </section>
  );
}
