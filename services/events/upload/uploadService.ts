import { UploadClient } from "./uploadClient";
import {
  buildStoragePath,
  createUploadMetadata,
} from "./uploadMetadata";
import { getImageMetadata } from "./uploadImage";
import { UploadTransport } from "./uploadTransport";
import { validateFile } from "./uploadValidator";
import {
  createAsset,
  deleteAsset,
} from "@/services/events/assets";

import {
  completeUpload,
} from "@/services/events/storage";
import type { UploadMetadata } from "./uploadMetadata";

export interface UploadProgress {
  progress: number;
  transferredBytes: number;
  totalBytes: number;
}

export interface UploadRequest {
  file: File;
  eventId: string;
  studioId: string; 
  albumId: string;  
  signal?: AbortSignal; // <--- ADDED SIGNAL HERE
}

export interface UploadResponse {
  success: boolean;
  assetId?: string;
  storagePath?: string;
  metadata?: UploadMetadata;
  processingStatus?: string;
  cancelled?: boolean;
  error?: string;
}

export interface UploadServiceOptions {
  client?: UploadClient;
  transport?: UploadTransport;
}

export class UploadService {
  private readonly client: UploadClient;
  private readonly transport: UploadTransport;

  constructor({
    client = new UploadClient(),
    transport = new UploadTransport(),
  }: UploadServiceOptions = {}) {
    this.client = client;
    this.transport = transport;
  }

  cancel() {
    this.transport.cancel();
  }

  async upload(
    request: UploadRequest,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<UploadResponse> {
    const validation = validateFile(request.file);

    if (!validation.valid) {
      return {
        success: false,
        error: validation.error?.message,
      };
    }

    try {
      const image = await getImageMetadata(request.file);

      const metadata = createUploadMetadata(
  request.file,
  {
    eventId: request.eventId,
    albumId: request.albumId,
    width: image.width,
    height: image.height,
    aspectRatio: image.aspectRatio,
    orientation: image.orientation,
  }
);

      const storagePath = buildStoragePath(metadata);

      const asset = await createAsset(
        request.studioId,
        {
          albumId: request.albumId,
          assetType: metadata.assetType,
          originalFilename: metadata.originalFileName,
          storageFilename: metadata.fileName,
          storageBucket: "assets",
          storagePath,
          mimeType: metadata.mimeType,
          fileSize: metadata.size,
          width: metadata.width,
          height: metadata.height,
          checksum: metadata.checksum,
          metadata: {
            aspectRatio: metadata.aspectRatio,
            orientation: metadata.orientation,
            camera: metadata.camera,
            location: metadata.location,
            ai: metadata.ai,
            custom: metadata.custom,
            eventId: metadata.eventId,
            uploadedAt: metadata.uploadedAt,
          },
        },
      );

      let uploadResult: Awaited<ReturnType<UploadClient["upload"]>> | null = null;
      let uploadError: string | undefined;
      let cancelled = false;

      await this.transport.execute(
        {
          file: request.file,
          // इथून signal पास केला आहे
          upload: async (signal) => {
            const result = await this.client.upload({
              path: storagePath,
              file: request.file,
              contentType: request.file.type,
              signal, // <--- थेट signal वापरला आहे
            });

            if (!result.success) {
              throw new Error(result.error ?? "Upload failed.");
            }

            uploadResult = result;
            return result;
          },
        },
        {
          onProgress: (progress, uploadedBytes, totalBytes) => {
            onProgress?.({
              progress,
              transferredBytes: uploadedBytes,
              totalBytes,
            });
          },
          onCancelled: () => {
            cancelled = true;
          },
          onError: (error) => {
            uploadError = error.message;
          },
        }
      );

      if (cancelled) {
        return {
          success: false,
          assetId: asset.id,
          cancelled: true,
          error: "Upload cancelled.",
        };
      }

      if (uploadError) {
        return {
          success: false,
          assetId: asset.id,
          error: uploadError,
        };
      }

      if (uploadResult === null) {
        return {
          success: false,
          assetId: asset.id,
          error: "Upload failed.",
        };
      }

      let completedAsset;

      try {
        completedAsset = await completeUpload(
          request.studioId,
          {
            assetId: asset.id,
            storageBucket: "assets",
            storagePath: (uploadResult as any).path, 
            storageFilename: metadata.fileName,
            mimeType: metadata.mimeType,
            fileSize: metadata.size,
            checksum: metadata.checksum,
            width: metadata.width,
            height: metadata.height,
            durationSeconds: undefined,
          },
        );
      } catch (error) {
        try {
          await this.client.remove(
            (uploadResult as any)?.path,
          );
        } catch {}

        try {
          await deleteAsset(
            request.studioId,
            asset.id,
          );
        } catch {}

        return {
          success: false,
          assetId: asset.id,
          error:
            error instanceof Error
              ? error.message
              : "Failed to finalize upload.",
        };
      }

      return {
        success: true,
        assetId: completedAsset.id,
        storagePath: completedAsset.storage_path,
        processingStatus: completedAsset.processing_status,
        metadata,
      };

    } catch (error: any) {
      return {
        success: false,
        error: error?.message ?? "An unexpected error occurred during upload.",
      };
    }
  }
}