import { UploadClient } from "./uploadClient";

import {
  createUploadMetadata,
} from "./uploadMetadata";

import {
  getImageMetadata,
} from "./uploadImage";

import {
  UploadTransport,
} from "./uploadTransport";

import {
  validateFile,
} from "./uploadValidator";

import {
  deleteAsset,
} from "@/services/events/assets";

import {
  getOrCreateMainAlbum,
} from "@/lib/api/albums";

import {
  prepareAsset,
  completeAsset,
} from "@/lib/api/assets";

import {
  galleryService,
} from "@/services/events/gallery.service";

export interface UploadProgress {
  progress: number;

  transferredBytes: number;

  totalBytes: number;
}

export interface UploadRequest {
  file: File;

  eventId: string;

  studioId: string;

  projectId: string;

  signal?: AbortSignal;
}

export interface UploadResponse {
  success: boolean;

  assetId?: string;

  storagePath?: string;

  metadata?: ReturnType<
    typeof createUploadMetadata
  >;

  processingStatus?: string;

  cancelled?: boolean;

  error?: string;
}

export interface UploadServiceOptions {
  client?: UploadClient;

  transport?: UploadTransport;
}

function getErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error &&
    error.message
  ) {
    return error.message;
  }

  if (
    typeof error === "string"
  ) {
    return error;
  }

  if (
    error &&
    typeof error === "object"
  ) {
    const value =
      error as {
        message?: unknown;
      };

    if (
      typeof value.message ===
      "string"
    ) {
      return value.message;
    }

    try {
      return JSON.stringify(
        error,
      );
    } catch {
      return "Upload failed.";
    }
  }

  return "Upload failed.";
}

function isHeicLike(
  file: File,
): boolean {
  const fileName =
    file.name.toLowerCase();

  const mimeType =
    file.type.toLowerCase();

  return (
    mimeType === "image/heic" ||
    mimeType === "image/heif" ||
    mimeType === "image/heic-sequence" ||
    mimeType === "image/heif-sequence" ||
    fileName.endsWith(".heic") ||
    fileName.endsWith(".heif")
  );
}

export class UploadService {
  private readonly client:
    UploadClient;

  private readonly transport:
    UploadTransport;

  constructor({
    client = new UploadClient(),
    transport = new UploadTransport(),
  }: UploadServiceOptions = {}) {
    this.client =
      client;

    this.transport =
      transport;
  }

  cancel() {
    this.transport.cancel();
  }

  async upload(
    request: UploadRequest,
    onProgress?: (
      progress: UploadProgress,
    ) => void,
  ): Promise<UploadResponse> {
    const validation =
      validateFile(
        request.file,
      );

    if (!validation.valid) {
      return {
        success: false,

        error:
          validation.error?.message,
      };
    }

    let stage =
      "initializing";

    let preparedAsset:
      Awaited<
        ReturnType<
          typeof prepareAsset
        >
      > | null =
      null;

    let uploadedPath:
      string | undefined;

    let uploadResult:
      Awaited<
        ReturnType<
          UploadClient["upload"]
        >
      > | null =
      null;

    let metadata:
      ReturnType<
        typeof createUploadMetadata
      > | null =
      null;

    try {
      /*
       * ------------------------------------------------------------
       * 0. Check cancellation before starting
       * ------------------------------------------------------------
       */

      stage =
        "check_cancellation";

      if (
        request.signal?.aborted
      ) {
        return {
          success: false,

          cancelled: true,

          error:
            "Upload cancelled.",
        };
      }

      /*
       * ------------------------------------------------------------
       * 1. Read image metadata
       * ------------------------------------------------------------
       */

      stage =
        "read_image_metadata";

      let image;

      try {
        image =
          await getImageMetadata(
            request.file,
          );
      } catch (
        metadataError
      ) {
        /*
         * HEIC / HEIF must not permanently
         * break the upload pipeline if the
         * browser-side decoder fails.
         */

        if (
          !isHeicLike(
            request.file,
          )
        ) {
          throw metadataError;
        }

        console.warn(
          "HEIC METADATA FALLBACK",
          {
            fileName:
              request.file.name,

            fileType:
              request.file.type,

            fileSize:
              request.file.size,

            error:
              metadataError,
          },
        );

        image = {
          width: 0,

          height: 0,

          aspectRatio: 0,

          orientation:
            "landscape" as const,

          mimeType:
            request.file.type,

          size:
            request.file.size,

          lastModified:
            request.file.lastModified,
        };
      }

      /*
       * ------------------------------------------------------------
       * 2. Resolve Project, Studio, and Main Album
       * ------------------------------------------------------------
       */

      stage =
        "resolve_album";

      let projectId = request.projectId;
      let studioId = request.studioId;

      if (!projectId || !studioId) {
        const { supabase } = await import("@/lib/supabase/client");
        const { data: ev } = await supabase
          .from("events")
          .select("project_id, studio_id")
          .eq("id", request.eventId)
          .maybeSingle();
        if (ev) {
          projectId = projectId || ev.project_id;
          studioId = studioId || ev.studio_id;
        }
      }

      let album: { id: string } | null = null;
      try {
        if (projectId && studioId) {
          album = await getOrCreateMainAlbum(studioId, projectId);
        }
      } catch (albumErr) {
        console.warn("[uploadService] getOrCreateMainAlbum notice, using DB fallback:", albumErr);
      }

      if (!album?.id && projectId && studioId) {
        const { supabase } = await import("@/lib/supabase/client");
        const { data: existingAlbum } = await supabase
          .from("albums")
          .select("id")
          .eq("project_id", projectId)
          .maybeSingle();

        if (existingAlbum?.id) {
          album = existingAlbum;
        } else {
          const { data: createdAlbum } = await supabase
            .from("albums")
            .insert({
              studio_id: studioId,
              project_id: projectId,
              title: "Main Album",
            })
            .select("id")
            .maybeSingle();
          album = createdAlbum;
        }
      }

      if (!album?.id) {
        throw new Error(
          "Main Album could not be resolved for this event.",
        );
      }

      /*
       * ------------------------------------------------------------
       * 3. Build application metadata
       * ------------------------------------------------------------
       */

      stage =
        "create_metadata";

      metadata =
        createUploadMetadata(
          request.file,
          {
            eventId:
              request.eventId,

            albumId:
              album.id,

            width:
              image.width,

            height:
              image.height,

            aspectRatio:
              image.aspectRatio,

            orientation:
              image.orientation,
          },
        );

      /*
       * IMPORTANT
       *
       * From this point onward we use
       * uploadMetadata instead of the nullable
       * metadata variable.
       */

      const uploadMetadata =
        metadata;

      /*
       * ------------------------------------------------------------
       * 4. Prepare Asset
       * ------------------------------------------------------------
       */

      stage =
        "prepare_asset";

      preparedAsset =
        await prepareAsset(
          studioId,
          {
            albumId:
              album.id,

            assetType:
              uploadMetadata.assetType,

            originalFilename:
              uploadMetadata.originalFileName,

            mimeType:
              uploadMetadata.mimeType,

            fileSize:
              uploadMetadata.size,

            width:
              uploadMetadata.width,

            height:
              uploadMetadata.height,

            checksum:
              uploadMetadata.checksum,

            metadata: {
              aspectRatio:
                uploadMetadata.aspectRatio,

              orientation:
                uploadMetadata.orientation,

              camera:
                uploadMetadata.camera,

              location:
                uploadMetadata.location,

              ai:
                uploadMetadata.ai,

              custom:
                uploadMetadata.custom,

              eventId:
                uploadMetadata.eventId,

              uploadedAt:
                uploadMetadata.uploadedAt,

              sourceFormat:
                isHeicLike(
                  request.file,
                )
                  ? "heic"
                  : uploadMetadata.mimeType,
            },
          },
        );

      /*
       * ------------------------------------------------------------
       * 5. Validate Backend Asset Context
       * ------------------------------------------------------------
       */

      stage =
        "validate_prepared_asset";

      if (
        !preparedAsset?.id
      ) {
        throw new Error(
          "Asset preparation succeeded but asset ID is missing.",
        );
      }

      if (
        !preparedAsset.storage_path
      ) {
        throw new Error(
          "Asset preparation succeeded but canonical storage path is missing.",
        );
      }

      if (
        !preparedAsset.storage_bucket
      ) {
        throw new Error(
          "Asset preparation succeeded but storage bucket is missing.",
        );
      }

      if (
        !preparedAsset.storage_filename
      ) {
        throw new Error(
          "Asset preparation succeeded but storage filename is missing.",
        );
      }

      /*
       * ------------------------------------------------------------
       * 6. Use Backend Canonical Storage Context
       * ------------------------------------------------------------
       */

      stage =
        "resolve_storage_context";

      const storagePath =
        preparedAsset.storage_path;

      const storageFilename =
        preparedAsset.storage_filename;

      /*
       * ------------------------------------------------------------
       * 7. Upload Original File to Storage
       * ------------------------------------------------------------
       */

      stage =
        "upload_storage";

      let uploadError:
        string | undefined;

      let cancelled =
        false;

      await this.transport.execute(
        {
          file:
            request.file,

          signal:
            request.signal,

          upload:
            async (
              signal,
            ) => {
              const result =
                await this.client.upload(
                  {
                    path:
                      storagePath,

                    file:
                      request.file,

                    contentType:
                      request.file.type ||
                      uploadMetadata.mimeType,

                    signal,
                  },
                );

              if (
                !result.success
              ) {
                throw new Error(
                  result.error ??
                    "Storage upload failed.",
                );
              }

              uploadedPath =
                result.path;

              uploadResult =
                result;

              return result;
            },
        },
        {
          onProgress:
            (
              progress,
              uploadedBytes,
              totalBytes,
            ) => {
              onProgress?.({
                progress,

                transferredBytes:
                  uploadedBytes,

                totalBytes,
              });
            },

          onCancelled:
            () => {
              cancelled =
                true;
            },

          onError:
            (
              error,
            ) => {
              uploadError =
                error.message;
            },
        },
      );

      /*
       * ------------------------------------------------------------
       * 8. Cancellation Cleanup
       * ------------------------------------------------------------
       */

      stage =
        "handle_cancellation";

      if (
        cancelled ||
        request.signal?.aborted
      ) {
        if (
          uploadedPath
        ) {
          try {
            await this.client.remove(
              uploadedPath,
            );
          } catch {}
        }

        if (
          preparedAsset?.id
        ) {
          try {
            await deleteAsset(
              request.studioId,
              preparedAsset.id,
            );
          } catch {}
        }

        return {
          success: false,

          assetId:
            preparedAsset?.id,

          cancelled: true,

          error:
            "Upload cancelled.",
        };
      }

      /*
       * ------------------------------------------------------------
       * 9. Storage Upload Error Cleanup
       * ------------------------------------------------------------
       */

      stage =
        "handle_upload_error";

      if (
        uploadError
      ) {
        if (
          uploadedPath
        ) {
          try {
            await this.client.remove(
              uploadedPath,
            );
          } catch {}
        }

        if (
          preparedAsset?.id
        ) {
          try {
            await deleteAsset(
              request.studioId,
              preparedAsset.id,
            );
          } catch {}
        }

        return {
          success: false,

          assetId:
            preparedAsset?.id,

          error:
            uploadError,
        };
      }

      /*
       * ------------------------------------------------------------
       * 10. Validate Storage Result
       * ------------------------------------------------------------
       */

      stage =
        "validate_storage_result";

      if (
        uploadResult ===
          null ||
        !uploadedPath
      ) {
        throw new Error(
          "Storage upload failed or returned no uploaded path.",
        );
      }

      /*
       * ------------------------------------------------------------
       * 11. Complete Asset
       * ------------------------------------------------------------
       */

      stage =
        "complete_asset";

      let completedAsset;

      try {
        completedAsset =
          await completeAsset(
            studioId,
            {
              assetId:
                preparedAsset.id,

              storagePath:
                uploadedPath,

              storageFilename:
                storageFilename,

              mimeType:
                uploadMetadata.mimeType,

              fileSize:
                uploadMetadata.size,

              checksum:
                uploadMetadata.checksum,

              width:
                uploadMetadata.width,

              height:
                uploadMetadata.height,

              durationSeconds:
                null,
            },
          );
      } catch (
        completeError
      ) {
        const message =
          getErrorMessage(
            completeError,
          );

        console.error(
          "ASSET COMPLETE FAILED",
          {
            eventId:
              request.eventId,

            studioId:
              request.studioId,

            projectId:
              request.projectId,

            assetId:
              preparedAsset.id,

            storagePath:
              uploadedPath,

            fileName:
              request.file.name,

            fileType:
              request.file.type,

            stage,

            error:
              completeError,

            message,
          },
        );

        if (
          uploadedPath
        ) {
          try {
            await this.client.remove(
              uploadedPath,
            );
          } catch {}
        }

        try {
          await deleteAsset(
            request.studioId,
            preparedAsset.id,
          );
        } catch {}

        return {
          success: false,

          assetId:
            preparedAsset.id,

          storagePath:
            uploadedPath,

          error:
            message,
        };
      }

      if (
        !completedAsset?.id
      ) {
        throw new Error(
          "Asset completion succeeded but completed asset ID is missing.",
        );
      }

      /*
       * ------------------------------------------------------------
       * 12. Add Asset to Main Gallery
       *
       * Gallery linking must not invalidate a
       * successfully completed upload.
       * ------------------------------------------------------------
       */

      stage =
        "link_gallery";

      try {
        await galleryService.addAssetToMainGallery(
          request.eventId,
          completedAsset.id,
        );
      } catch (
        galleryError
      ) {
        console.error(
          "EVENT MAIN GALLERY LINK FAILED",
          {
            eventId:
              request.eventId,

            assetId:
              completedAsset.id,

            storagePath:
              completedAsset.storage_path,

            error:
              galleryError,
          },
        );
      }

      /*
       * ------------------------------------------------------------
       * 13. Success
       * ------------------------------------------------------------
       */

      stage =
        "completed";

      return {
        success: true,

        assetId:
          completedAsset.id,

        storagePath:
          completedAsset.storage_path,

        processingStatus:
          completedAsset.processing_status,

        metadata:
          uploadMetadata,
      };
    } catch (
      error
    ) {
      const errorMessage =
        getErrorMessage(
          error,
        );

      console.error(
        "UPLOAD PIPELINE FAILED",
        {
          error,

          errorMessage,

          eventId:
            request.eventId,

          studioId:
            request.studioId,

          projectId:
            request.projectId,

          fileName:
            request.file.name,

          fileSize:
            request.file.size,

          fileType:
            request.file.type,

          preparedAssetId:
            preparedAsset?.id ??
            null,

          preparedStoragePath:
            preparedAsset?.storage_path ??
            null,

          uploadedPath:
            uploadedPath ??
            null,

          stage,
        },
      );

      /*
       * Cleanup only when the asset was prepared
       * but the pipeline failed before completion.
       */

      if (
        uploadedPath
      ) {
        try {
          await this.client.remove(
            uploadedPath,
          );
        } catch {}
      }

      if (
        preparedAsset?.id
      ) {
        try {
          await deleteAsset(
            request.studioId,
            preparedAsset.id,
          );
        } catch {}
      }

      return {
        success: false,

        assetId:
          preparedAsset?.id,

        storagePath:
          preparedAsset?.storage_path,

        error:
          errorMessage ||
          "An unexpected error occurred during upload.",
      };
    }
  }
}