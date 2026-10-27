import {
  getSupabaseClient,
} from "@/lib/supabase/client";

import type {
  GalleryPhoto,
} from "@/types/events/gallery";

const STORAGE_BUCKET =
  "assets";

const SIGNED_URL_TTL =
  60 * 60;

type GalleryRow = {
  id: string;

  studio_id: string;

  event_id: string;

  name: string;

  slug: string;

  description: string | null;

  gallery_type: string;

  status: string;

  cover_asset_id: string | null;

  sort_order: number;

  asset_count: number;

  metadata:
    | Record<string, unknown>
    | null;

  created_at: string;

  updated_at: string;
};

type GalleryAssetFile = {
  id?: string;

  filename?: string;

  original_filename?: string;

  file_path?: string;

  storage_path?: string;

  thumbnail_path?: string | null;

  mime_type?: string;

  file_size?: number | string;

  width?: number | null;

  height?: number | null;
};

type GalleryAssetRow = {
  id: string;

  studio_id: string;

  gallery_id: string;

  asset_id: string;

  display_order: number;

  is_featured: boolean;

  metadata:
    | Record<string, unknown>
    | null;

  created_at: string;

  asset:
    | GalleryAssetFile
    | null;
};

type Heic2AnyModule = {
  default: (
    options: {
      blob: Blob;
      toType?: string;
      quality?: number;
    },
  ) => Promise<
    Blob | Blob[]
  >;
};

function getAssetFileName(
  asset: GalleryAssetFile,
): string {
  const value =
    asset.filename ??
    asset.original_filename ??
    "Untitled";

  return value;
}

function getAssetStoragePath(
  asset: GalleryAssetFile,
): string {
  const value =
    asset.file_path ??
    asset.storage_path ??
    "";

  return value.trim();
}

function getThumbnailPath(
  asset: GalleryAssetFile,
): string {
  const value =
    asset.thumbnail_path ??
    "";

  return value.trim();
}

function getMetadataString(
  metadata:
    | Record<string, unknown>
    | null,
  key: string,
): string | undefined {
  const value =
    metadata?.[key];

  return typeof value === "string"
    ? value
    : undefined;
}

function getMetadataBoolean(
  metadata:
    | Record<string, unknown>
    | null,
  key: string,
): boolean {
  return Boolean(
    metadata?.[key],
  );
}

function isHeicMimeType(
  mimeType: string | undefined,
): boolean {
  const normalized =
    mimeType
      ?.trim()
      .toLowerCase() ??
    "";

  return (
    normalized === "image/heic" ||
    normalized === "image/heif" ||
    normalized === "image/heic-sequence" ||
    normalized === "image/heif-sequence"
  );
}

function isHeicFileName(
  fileName: string,
): boolean {
  const normalized =
    fileName
      .trim()
      .toLowerCase();

  return (
    normalized.endsWith(
      ".heic",
    ) ||
    normalized.endsWith(
      ".heif",
    )
  );
}

function isHeicAsset(
  asset: GalleryAssetFile,
): boolean {
  return (
    isHeicMimeType(
      asset.mime_type,
    ) ||
    isHeicFileName(
      getAssetFileName(
        asset,
      ),
    )
  );
}

function normalizeStoragePath(
  path: string,
): string {
  return path
    .trim()
    .replace(
      /^\/+/,
      "",
    );
}

class GalleryService {
  private readonly client =
    getSupabaseClient();

  private readonly heicPreviewCache =
    new Map<
      string,
      string
    >();

  private readonly heicPreviewRequests =
    new Map<
      string,
      Promise<string>
    >();

  // ===========================================================================
  // CREATE SIGNED URL
  // ===========================================================================

  private async createAssetUrl(
    path: string,
  ): Promise<string> {
    if (!path) {
      return "";
    }

    const normalizedPath =
      normalizeStoragePath(
        path,
      );

    if (!normalizedPath) {
      return "";
    }

    const {
      data,
      error,
    } =
      await this.client.storage
        .from(
          STORAGE_BUCKET,
        )
        .createSignedUrl(
          normalizedPath,
          SIGNED_URL_TTL,
        );

    if (error) {
      console.error(
        "GALLERY SIGNED URL ERROR:",
        {
          path:
            normalizedPath,
          error,
        },
      );

      return "";
    }

    return (
      data?.signedUrl ??
      ""
    );
  }

  // ===========================================================================
  // LOAD HEIC CONVERTER
  // ===========================================================================

  private async loadHeicConverter(): Promise<
    Heic2AnyModule["default"] | null
  > {
    /*
     * IMPORTANT
     *
     * heic2any accesses browser APIs such as window.
     *
     * Do not import it at module level because this service
     * can be evaluated during Next.js SSR.
     */

    if (
      typeof window ===
      "undefined"
    ) {
      return null;
    }

    try {
      const module =
        await import(
          "heic2any"
        ) as unknown as Heic2AnyModule;

      return module.default;
    } catch (error) {
      console.error(
        "HEIC CONVERTER LOAD FAILED:",
        error,
      );

      return null;
    }
  }

  // ===========================================================================
  // CREATE HEIC PREVIEW
  // ===========================================================================

  private async createHeicPreview(
    cacheKey: string,
    sourceUrl: string,
  ): Promise<string> {
    /*
     * HEIC conversion only works in the browser.
     *
     * Returning the original URL during SSR prevents
     * window-related module evaluation errors.
     */
    if (
      typeof window ===
      "undefined"
    ) {
      return sourceUrl;
    }

    if (!sourceUrl) {
      return "";
    }

    const cached =
      this.heicPreviewCache.get(
        cacheKey,
      );

    if (cached) {
      return cached;
    }

    const pending =
      this.heicPreviewRequests.get(
        cacheKey,
      );

    if (pending) {
      return pending;
    }

    const request =
      (async () => {
        try {
          const heic2any =
            await this.loadHeicConverter();

          if (!heic2any) {
            return sourceUrl;
          }

          const response =
            await fetch(
              sourceUrl,
            );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch HEIC image: ${response.status}`,
            );
          }

          const sourceBlob =
            await response.blob();

          const converted =
            await heic2any({
              blob:
                sourceBlob,
              toType:
                "image/jpeg",
              quality:
                0.88,
            });

          const convertedBlob =
            Array.isArray(
              converted,
            )
              ? converted[0]
              : converted;

          if (
            !convertedBlob
          ) {
            throw new Error(
              "HEIC conversion returned no image.",
            );
          }

          const previewUrl =
            URL.createObjectURL(
              convertedBlob,
            );

          this.heicPreviewCache.set(
            cacheKey,
            previewUrl,
          );

          return previewUrl;
        } catch (
          error
        ) {
          console.error(
            "HEIC PREVIEW CONVERSION FAILED:",
            {
              cacheKey,
              sourceUrl,
              error,
            },
          );

          /*
           * Keep the existing gallery functional even when
           * HEIC conversion fails.
           */
          return sourceUrl;
        } finally {
          this.heicPreviewRequests.delete(
            cacheKey,
          );
        }
      })();

    this.heicPreviewRequests.set(
      cacheKey,
      request,
    );

    return request;
  }

  // ===========================================================================
  // RESOLVE PHOTO URLS
  // ===========================================================================

  private async resolvePhotoUrls(
    assetId: string,
    asset: GalleryAssetFile,
  ): Promise<{
    thumbnailUrl: string;
    originalUrl: string;
  }> {
    const originalPath =
      getAssetStoragePath(
        asset,
      );

    const thumbnailPath =
      getThumbnailPath(
        asset,
      );

    if (!originalPath) {
      return {
        thumbnailUrl: "",
        originalUrl: "",
      };
    }

    const resolvedThumbnailPath =
      thumbnailPath ||
      originalPath;

    const [
      signedThumbnailUrl,
      signedOriginalUrl,
    ] =
      await Promise.all(
        [
          this.createAssetUrl(
            resolvedThumbnailPath,
          ),

          this.createAssetUrl(
            originalPath,
          ),
        ],
      );

    const originalUrl =
      signedOriginalUrl ||
      signedThumbnailUrl;

    let thumbnailUrl =
      signedThumbnailUrl ||
      originalUrl;

    /*
     * HEIC / HEIF cannot be reliably rendered
     * directly by every browser.
     *
     * Convert it to a browser-compatible JPEG
     * preview when no real backend thumbnail exists.
     */
    if (
      isHeicAsset(
        asset,
      ) &&
      !thumbnailPath &&
      originalUrl
    ) {
      const heicPreview =
        await this.createHeicPreview(
          assetId,
          originalUrl,
        );

      if (heicPreview) {
        thumbnailUrl =
          heicPreview;
      }
    }

    return {
      thumbnailUrl,

      originalUrl:
        originalUrl ||
        thumbnailUrl,
    };
  }

  // ===========================================================================
  // GET EVENT PHOTOS
  // ===========================================================================

  async getPhotos(
    eventId: string,
  ): Promise<GalleryPhoto[]> {
    if (!eventId) {
      return [];
    }

    const { getFirebaseIdToken } =
      await import("@/lib/auth/firebase-auth.service");

    const accessToken =
      await getFirebaseIdToken();

    if (!accessToken) {
      throw new Error(
        "You must be signed in to load the gallery.",
      );
    }

    const {
      data,
      error,
    } =
      await this.client.functions.invoke(
        "event-gallery",
        {
          method: "POST",
          headers: {
            Authorization:
              `Bearer ${accessToken}`,
          },
          body: {
            event_id: eventId,
          },
        },
      );

    if (error) {
      throw error;
    }

    if (!data?.success) {
      throw new Error(
        data?.error?.message ??
          data?.message ??
          "Unable to load event gallery.",
      );
    }

    const rows =
      Array.isArray(data.data)
        ? data.data
        : [];

    const photos =
      rows.map(
        (
          item: any,
        ): GalleryPhoto | null => {
          const row =
            item?.row;

          const asset =
            item?.asset;

          if (!row || !asset) {
            return null;
          }

          return {
            id:
              row.asset_id,

            eventId,

            fileName:
              getAssetFileName(
                asset,
              ),

            thumbnailUrl:
              item.thumbnailUrl ??
              item.originalUrl ??
              null,

            originalUrl:
              item.originalUrl ??
              item.thumbnailUrl ??
              null,

            width:
              Number(
                asset.width ??
                0,
              ),

            height:
              Number(
                asset.height ??
                0,
              ),

            fileSize:
              Number(
                asset.file_size ??
                0,
              ),

            mimeType:
              asset.mime_type ??
              "",

            uploadedBy:
              "Studio",

            uploadedAt:
              row.created_at,

            status:
              "ready",

            visibility:
              "visible",

            rating:
              0,

            likes:
              0,

            comments:
              0,

            isFavorite:
              getMetadataBoolean(
                row.metadata,
                "is_favorite",
              ),

            isSelected:
              getMetadataBoolean(
                row.metadata,
                "is_selected",
              ),

            aiProcessed:
              getMetadataBoolean(
                row.metadata,
                "ai_processed",
              ),

            aiCategory:
              getMetadataString(
                row.metadata,
                "ai_category",
              ),

            captureDate:
              getMetadataString(
                row.metadata,
                "capture_date",
              ),

            location:
              getMetadataString(
                row.metadata,
                "location",
              ),
          };
        },
      );

    return photos.filter(
      (
        photo: GalleryPhoto | null,
      ): photo is GalleryPhoto =>
        photo !== null &&
        Boolean(
          photo.thumbnailUrl ||
          photo.originalUrl,
        ),
    );
  }

  // ===========================================================================
  // GET SINGLE PHOTO
  // ===========================================================================

  async getPhoto(
    photoId: string,
  ): Promise<
    GalleryPhoto | null
  > {
    const photos =
      await this.getPhotosForAsset(
        photoId,
      );

    return (
      photos[0] ??
      null
    );
  }

  // ===========================================================================
  // SEARCH PHOTOS
  // ===========================================================================

  async searchPhotos(
    eventId: string,
    search: string,
  ): Promise<
    GalleryPhoto[]
  > {
    const photos =
      await this.getPhotos(
        eventId,
      );

    const query =
      search
        .trim()
        .toLowerCase();

    if (!query) {
      return photos;
    }

    return photos.filter(
      (
        photo,
      ) =>
        photo.fileName
          .toLowerCase()
          .includes(
            query,
          ) ||
        (
          photo.aiCategory ??
          ""
        )
          .toLowerCase()
          .includes(
            query,
          ),
    );
  }

  // ===========================================================================
  // ADD ASSET TO MAIN GALLERY
  // ===========================================================================

  async addAssetToMainGallery(
    eventId: string,
    assetId: string,
  ): Promise<void> {
    if (!eventId) {
      throw new Error(
        "Event ID is required.",
      );
    }

    if (!assetId) {
      throw new Error(
        "Asset ID is required.",
      );
    }

    const {
      data: galleryData,
      error: galleryError,
    } =
      await this.client.rpc(
        "list_event_galleries",
        {
          p_event_id:
            eventId,
        },
      );

    if (galleryError) {
      throw galleryError;
    }

    const galleries =
      (
        Array.isArray(
          galleryData,
        )
          ? galleryData
          : []
      ) as GalleryRow[];

    let mainGallery:
      | GalleryRow
      | null =
      galleries.find(
        (
          gallery,
        ) =>
          gallery.slug ===
            "main-gallery" ||
          gallery.gallery_type ===
            "main",
      ) ??
      galleries[0] ??
      null;

    if (!mainGallery) {
      const {
        data:
          createdGalleryData,
        error:
          createGalleryError,
      } =
        await this.client.rpc(
          "create_event_gallery",
          {
            p_event_id:
              eventId,

            p_name:
              "Main Gallery",

            p_slug:
              "main-gallery",

            p_description:
              "Main event gallery",

            p_gallery_type:
              "main",

            p_cover_asset_id:
              null,

            p_sort_order:
              0,

            p_metadata:
              {},
          },
        );

      if (
        createGalleryError
      ) {
        throw createGalleryError;
      }

      if (
        !createdGalleryData
      ) {
        throw new Error(
          "Main gallery creation returned an empty response.",
        );
      }

      mainGallery =
        createdGalleryData as GalleryRow;
    }

    if (
      !mainGallery?.id
    ) {
      throw new Error(
        "Main gallery could not be resolved.",
      );
    }

    const {
      data: assignmentData,
      error: addAssetError,
    } =
      await this.client.rpc(
        "add_gallery_asset",
        {
          p_gallery_id:
            mainGallery.id,

          p_asset_id:
            assetId,

          p_display_order:
            0,

          p_is_featured:
            false,

          p_metadata:
            {},
        },
      );

    if (addAssetError) {
      throw addAssetError;
    }

    if (!assignmentData) {
      throw new Error(
        "Gallery asset assignment returned an empty response.",
      );
    }
  }

  // ===========================================================================
  // GET CLIENT SELECTED
  // ===========================================================================

  async getClientSelected(
    eventId: string,
  ): Promise<
    GalleryPhoto[]
  > {
    const photos =
      await this.getPhotos(
        eventId,
      );

    return photos.filter(
      (
        photo,
      ) =>
        photo.isSelected,
    );
  }

  // ===========================================================================
  // GET PHOTOS FOR ASSET
  // ===========================================================================

  private async getPhotosForAsset(
    assetId: string,
  ): Promise<
    GalleryPhoto[]
  > {
    const {
      data,
      error,
    } =
      await this.client.rpc(
        "asset_get",
        {
          p_asset_id:
            assetId,
        },
      );

    if (
      error ||
      !data
    ) {
      return [];
    }

    return [];
  }

  // ===========================================================================
  // CLEANUP HEIC PREVIEW CACHE
  // ===========================================================================

  clearPreviewCache() {
    /*
     * URL.revokeObjectURL is browser-only.
     *
     * Guarding this also keeps cleanup SSR-safe.
     */
    if (
      typeof window !==
      "undefined"
    ) {
      for (
        const previewUrl of
        this.heicPreviewCache.values()
      ) {
        URL.revokeObjectURL(
          previewUrl,
        );
      }
    }

    this.heicPreviewCache.clear();

    this.heicPreviewRequests.clear();
  }
}

export const galleryService =
  new GalleryService();