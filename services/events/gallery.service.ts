import type { GalleryPhoto } from "@/types/events/gallery";

const DEMO_PHOTOS: GalleryPhoto[] = [
  {
    id: "1",
    eventId: "demo-event",

    fileName: "Bride_001.jpg",

    thumbnailUrl: "/images/photo-placeholder.jpg",

    originalUrl: "/images/photo-placeholder.jpg",

    width: 4000,
    height: 6000,

    fileSize: 18432000,

    mimeType: "image/jpeg",

    uploadedBy: "John Photographer",

    uploadedAt: "2026-07-15T09:30:00Z",

    status: "ready",

    visibility: "visible",

    rating: 5,

    likes: 12,

    comments: 8,

    isFavorite: true,

    isSelected: true,

    aiProcessed: true,

    aiCategory: "Bride",

    cameraModel: "Sony A7 IV",

    lensModel: "Sony FE 85mm F1.4 GM",

    captureDate: "2026-07-15",

    location: "Kolhapur",

    iso: 100,

    shutterSpeed: "1/500",

    aperture: "f/1.8",

    focalLength: "85mm",

    colorLabel: "Green",
  },

  {
    id: "2",
    eventId: "demo-event",

    fileName: "Reception_001.jpg",

    thumbnailUrl: "/images/photo-placeholder.jpg",

    originalUrl: "/images/photo-placeholder.jpg",

    width: 4000,

    height: 6000,

    fileSize: 17200000,

    mimeType: "image/jpeg",

    uploadedBy: "John Photographer",

    uploadedAt: "2026-07-15T10:10:00Z",

    status: "ready",

    visibility: "visible",

    rating: 4,

    likes: 6,

    comments: 2,

    isFavorite: false,

    isSelected: false,

    aiProcessed: true,

    aiCategory: "Reception",

    cameraModel: "Sony A7 IV",

    lensModel: "Sony FE 24-70mm F2.8 GM",

    captureDate: "2026-07-15",

    location: "Kolhapur",

    iso: 250,

    shutterSpeed: "1/320",

    aperture: "f/2.8",

    focalLength: "50mm",

    colorLabel: "Blue",
  },

  {
    id: "3",
    eventId: "demo-event",

    fileName: "Family_001.jpg",

    thumbnailUrl: "/images/photo-placeholder.jpg",

    originalUrl: "/images/photo-placeholder.jpg",

    width: 4000,

    height: 6000,

    fileSize: 16500000,

    mimeType: "image/jpeg",

    uploadedBy: "John Photographer",

    uploadedAt: "2026-07-15T11:00:00Z",

    status: "ready",

    visibility: "visible",

    rating: 5,

    likes: 18,

    comments: 4,

    isFavorite: true,

    isSelected: false,

    aiProcessed: true,

    aiCategory: "Family",

    cameraModel: "Sony A7 IV",

    lensModel: "Sony FE 70-200mm F2.8 GM",

    captureDate: "2026-07-15",

    location: "Kolhapur",

    iso: 125,

    shutterSpeed: "1/640",

    aperture: "f/2.8",

    focalLength: "135mm",

    colorLabel: "Yellow",
  },
];

class GalleryService {
  async getPhotos(eventId: string): Promise<GalleryPhoto[]> {
    return DEMO_PHOTOS.filter(
      (photo) => photo.eventId === eventId
    );
  }

  async getPhoto(photoId: string): Promise<GalleryPhoto | null> {
    return (
      DEMO_PHOTOS.find((photo) => photo.id === photoId) ?? null
    );
  }

  async searchPhotos(
    eventId: string,
    search: string
  ): Promise<GalleryPhoto[]> {
    return DEMO_PHOTOS.filter(
      (photo) =>
        photo.eventId === eventId &&
        photo.fileName
          .toLowerCase()
          .includes(search.toLowerCase())
    );
  }

  async getClientSelected(
    eventId: string
  ): Promise<GalleryPhoto[]> {
    return DEMO_PHOTOS.filter(
      (photo) =>
        photo.eventId === eventId &&
        photo.isSelected
    );
  }
}

export const galleryService = new GalleryService();