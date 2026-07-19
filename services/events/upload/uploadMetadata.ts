export interface UploadMetadata {
  fileName: string;

  originalFileName: string;

  mimeType: string;

  extension: string;

  size: number;

  assetType:
    | "photo"
    | "video"
    | "raw"
    | "audio"
    | "document"
    | "other";

  width?: number;

  height?: number;

  aspectRatio?: number;

  orientation?:
    | "landscape"
    | "portrait"
    | "square";

  eventId: string;

  albumId: string;

  uploadedAt: string;

  checksum?: string;

  camera?: CameraMetadata;

  location?: LocationMetadata;

  ai?: AIMetadata;

  custom?: Record<string, unknown>;
}

export interface CameraMetadata {
  make?: string;

  model?: string;

  lens?: string;

  focalLength?: number;

  aperture?: number;

  iso?: number;

  shutterSpeed?: string;

  capturedAt?: string;
}

export interface LocationMetadata {
  latitude?: number;

  longitude?: number;

  altitude?: number;

  city?: string;

  state?: string;

  country?: string;
}

export interface AIMetadata {
  tags?: string[];

  caption?: string;

  faces?: number;

  objects?: string[];

  dominantColors?: string[];
}

export interface CreateMetadataOptions {
  eventId: string;

  albumId: string;

  assetType?:
    | "photo"
    | "video"
    | "raw"
    | "audio"
    | "document"
    | "other";

  width?: number;

  height?: number;

  aspectRatio?: number;

  orientation?:
    | "landscape"
    | "portrait"
    | "square";
}

export function createUploadMetadata(
  file: File,
  options: CreateMetadataOptions
): UploadMetadata {
  const extension =
    file.name.includes(".")
      ? file.name.substring(
          file.name.lastIndexOf(".")
        )
      : "";

  return {
  fileName: crypto.randomUUID(),

  originalFileName: file.name,

  mimeType: file.type,

  extension,

  size: file.size,

  assetType:
    options.assetType ??
    "photo",

  width:
    options.width,

  height:
    options.height,

  aspectRatio:
    options.aspectRatio,

  orientation:
    options.orientation,

  eventId:
    options.eventId,

  albumId:
    options.albumId,

  uploadedAt:
    new Date().toISOString(),

    ai: {
    tags: [],

    caption: "",

    faces: 0,

    objects: [],

    dominantColors: [],
  },
};
}

export function buildStoragePath(
  metadata: UploadMetadata
) {
  const extension =
    metadata.extension || "";

  return [
    metadata.eventId,

    metadata.albumId ??
      "unassigned",

    `${metadata.fileName}${extension}`,
  ].join("/");
}

export function buildDatabasePayload(
  metadata: UploadMetadata
) {
  return {
    album_id:
      metadata.albumId,

    asset_type:
      metadata.assetType,

    original_filename:
      metadata.originalFileName,

    storage_filename:
      metadata.fileName,

    storage_bucket:
      "assets",

    storage_path:
      buildStoragePath(metadata),

    mime_type:
      metadata.mimeType,

    file_size:
      metadata.size,

    width:
      metadata.width,

    height:
      metadata.height,

    checksum:
      metadata.checksum,

    metadata: {
      aspectRatio:
        metadata.aspectRatio,

      orientation:
        metadata.orientation,

      camera:
        metadata.camera,

      location:
        metadata.location,

      ai:
        metadata.ai,

      custom:
        metadata.custom,

      uploadedAt:
        metadata.uploadedAt,

      eventId:
        metadata.eventId,
    },
  };
}