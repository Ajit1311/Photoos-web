"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  ReactNode,
} from "react";

export type AlbumPhoto = {
  id: string;
  image: string;
};

type AlbumSessionContextType = {
  selectedPhotos: AlbumPhoto[];
  addPhoto: (photo: AlbumPhoto) => void;
  removePhoto: (id: string) => void;
  clearPhotos: () => void;
};

const AlbumSessionContext =
  createContext<AlbumSessionContextType | null>(null);

export function AlbumSessionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [selectedPhotos, setSelectedPhotos] = useState<AlbumPhoto[]>([]);

  function addPhoto(photo: AlbumPhoto) {
    setSelectedPhotos((current) => {
      if (current.some((item) => item.id === photo.id)) {
        return current;
      }

      return [...current, photo];
    });
  }

  function removePhoto(id: string) {
    setSelectedPhotos((current) =>
      current.filter((photo) => photo.id !== id)
    );
  }

  function clearPhotos() {
    setSelectedPhotos([]);
  }

  const value = useMemo(
    () => ({
      selectedPhotos,
      addPhoto,
      removePhoto,
      clearPhotos,
    }),
    [selectedPhotos]
  );

  return (
    <AlbumSessionContext.Provider value={value}>
      {children}
    </AlbumSessionContext.Provider>
  );
}

export function useAlbumSessionContext() {
  const context = useContext(AlbumSessionContext);

  if (!context) {
    throw new Error(
      "useAlbumSessionContext must be used inside AlbumSessionProvider"
    );
  }

  return context;
}