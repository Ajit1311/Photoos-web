"use client";

import { useState } from "react";
import PhotoCard from "./PhotoCard";
import FaceSearchModal from "./FaceSearchModal";
import { toggleGalleryPhotoFavorite } from "@/lib/api/functions";
import CustomToast from "@/components/ui/custom-toast";

const initialPhotos = Array.from({ length: 48 }, (_, index) => ({
  id: `IMG_${String(index + 1).padStart(4, "0")}`,
  image: `https://picsum.photos/600/600?random=${index + 1}`,
  rating: 5,
  favorite: index % 7 === 0,
  selected: index % 11 === 0,
  faces: (index % 6) + 1,
  label: (
    ["Blue", "Green", "Yellow", "Purple", "Red"] as const
  )[index % 5],
}));

export default function PhotoGrid() {
  const [photos, setPhotos] = useState(initialPhotos);
  const [filteredPhotos, setFilteredPhotos] = useState(initialPhotos);
  const [isAiFiltered, setIsAiFiltered] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "warning" } | null>(null);

  const handleToggleFavorite = async (assetId: string) => {
    if (isProcessing) return;
    setIsProcessing(true);

    const result = await toggleGalleryPhotoFavorite(assetId, "demo-gallery-id");

    if (result.success) {
      if (result.message.includes("limit")) {
        setToast({ message: "Limit reached! You can select a maximum of 200 photos.", type: "warning" });
      } else {
        const updateState = (prev: typeof photos) =>
          prev.map((photo) =>
            photo.id === assetId ? { ...photo, favorite: !photo.favorite } : photo
          );

        setPhotos(updateState);
        setFilteredPhotos(updateState);

        const currentPhoto = photos.find((p) => p.id === assetId);
        setToast({
          message: currentPhoto?.favorite ? "Selection removed! 🤍" : "Photo selected successfully! ❤️",
          type: "success",
        });
      }
    } else {
      setToast({ message: "Something went wrong. Please try again.", type: "error" });
    }

    setIsProcessing(false);
  };

  const handleFaceMatched = (faceProfileId: string) => {
    const matched = photos.filter((p) => p.faces > 2);
    setFilteredPhotos(matched);
    setIsAiFiltered(true);
    setToast({ message: `AI found ${matched.length} matching photos! ✨`, type: "success" });
  };

  const resetAiFilter = () => {
    setFilteredPhotos(photos);
    setIsAiFiltered(false);
    setToast({ message: "Gallery filter reset successfully.", type: "success" });
  };

  return (
    <section className="relative rounded-3xl border border-slate-200 bg-white shadow-sm">
      {toast && (
        <CustomToast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}

      <FaceSearchModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        galleryId="demo-gallery-id"
        studioId="demo-studio-id"
        onFaceMatched={handleFaceMatched}
      />

      <div className="border-b border-slate-100 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Photo Gallery</h2>
            <p className="mt-2 text-slate-500">Select photos for albums, AI and delivery.</p>
          </div>

          <div className="flex items-center gap-4">
            {isAiFiltered ? (
              <button
                onClick={resetAiFilter}
                className="px-4 py-2.5 rounded-2xl bg-red-50 border border-red-200 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all"
              >
                Clear AI Filter 🔄
              </button>
            ) : (
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-5 py-2.5 rounded-2xl bg-[#0A3F61] text-sm font-semibold text-white hover:bg-[#0A3F61]/95 shadow-md transition-all flex items-center gap-2"
              >
                🔍 Find My Photos (AI)
              </button>
            )}

            <div className="rounded-2xl bg-[#0A3F61]/10 px-5 py-2 text-center">
              <p className="text-[10px] uppercase tracking-wide text-[#0A3F61] font-medium">Photos</p>
              <h3 className="text-lg font-bold text-[#0A3F61]">{filteredPhotos.length}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-h-[900px] overflow-y-auto p-6">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-12 text-slate-400 font-medium">
            No matching photos found. 📸
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-2 2xl:grid-cols-3">
            {filteredPhotos.map((photo) => (
              <PhotoCard
                key={photo.id}
                id={photo.id}
                image={photo.image}
                rating={photo.rating}
                favorite={photo.favorite}
                selected={photo.selected}
                faces={photo.faces}
                label={photo.label}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}