"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { galleryService } from "@/services/events/gallery.service";

import type { GalleryPhoto } from "@/types/events/gallery";
import type { GalleryTab } from "@/types/events/gallery-tabs";

export function useGallery(eventId: string) {
  const [photos, setPhotos] = useState<GalleryPhoto[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const [searchQuery, setSearchQuery] = useState("");

  const [activeTab, setActiveTab] = useState<GalleryTab>("all");

  const loadPhotos = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const data = await galleryService.getPhotos(eventId);

      setPhotos(data);

      if (data.length > 0) {
        setSelectedIds((current) =>
          current.length > 0 ? current : [data[0].id]
        );
      }
    } catch (err) {
      console.warn("[useGallery] Failed to load gallery photos:", err);
      setPhotos([]);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  useEffect(() => {
    void loadPhotos();
  }, [loadPhotos]);

  const tabFilteredPhotos = useMemo(() => {
    switch (activeTab) {
      case "favorites":
        return photos.filter((photo) => photo.isFavorite);

      case "client-selected":
        return photos.filter((photo) => photo.isSelected);

      case "hidden":
        return photos.filter((photo) => photo.visibility === "hidden");

      case "rejected":
        return photos.filter((photo) => photo.visibility === "rejected");

      case "ai-categories":
        return photos.filter((photo) => photo.aiProcessed);

      case "albums":
        return photos;

      case "all":
      default:
        return photos;
    }
  }, [photos, activeTab]);

  const filteredPhotos = useMemo(() => {
    if (!searchQuery.trim()) {
      return tabFilteredPhotos;
    }

    const query = searchQuery.toLowerCase();

    return tabFilteredPhotos.filter((photo) => {
      return (
        photo.fileName.toLowerCase().includes(query) ||
        (photo.aiCategory ?? "").toLowerCase().includes(query) ||
        photo.uploadedBy.toLowerCase().includes(query)
      );
    });
  }, [tabFilteredPhotos, searchQuery]);

  const selectedPhoto = useMemo(() => {
    return (
      filteredPhotos.find((photo) => selectedIds.includes(photo.id)) ?? null
    );
  }, [filteredPhotos, selectedIds]);

  const isSelected = useCallback(
    (id: string) => selectedIds.includes(id),
    [selectedIds]
  );

  const count = selectedIds.length;

  const clearSelection = useCallback(() => {
    setSelectedIds([]);
  }, []);

  const select = useCallback(
    (
      id: string,
      options?: {
        multi?: boolean;
      }
    ) => {
      setSelectedIds((previous) => {
        if (options?.multi) {
          if (previous.includes(id)) {
            return previous.filter((value) => value !== id);
          }

          return [...previous, id];
        }

        return [id];
      });
    },
    []
  );

  const refresh = useCallback(async () => {
    await loadPhotos();
  }, [loadPhotos]);

  return {
    loading,

    error,

    photos: filteredPhotos,

    allPhotos: photos,

    selectedPhoto,

    searchQuery,

    setSearchQuery,

    activeTab,

    setActiveTab,

    refresh,

    selectedIds,

    count,

    select,

    isSelected,

    clearSelection,
  };
}