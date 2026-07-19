export type GalleryPhotoStatus =
  | "uploading"
  | "processing"
  | "ready"
  | "failed";

export type GalleryPhotoVisibility =
  | "visible"
  | "hidden"
  | "rejected";

export interface GalleryPhoto {
  id: string;

  eventId: string;

  fileName: string;

  thumbnailUrl: string;

  originalUrl: string;

  width: number;

  height: number;

  fileSize: number;

  mimeType: string;

  uploadedBy: string;

  uploadedAt: string;

  status: GalleryPhotoStatus;

  visibility: GalleryPhotoVisibility;

  rating: number;

  likes: number;

  comments: number;

  isFavorite: boolean;

  isSelected: boolean;

  aiProcessed: boolean;

  aiCategory?: string;

  cameraModel?: string;

  lensModel?: string;

  captureDate?: string;

  location?: string;

  iso?: number;

  shutterSpeed?: string;

  aperture?: string;

  focalLength?: string;

  colorLabel?: string;
}