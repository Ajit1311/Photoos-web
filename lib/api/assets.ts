import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import { supabase } from "@/lib/supabase/client";

const ASSET_PREPARE_FUNCTION = "asset-prepare";
const ASSET_COMPLETE_FUNCTION = "asset-complete";

async function getHeaders(
  studioId: string,
): Promise<Record<string, string>> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error("User is not authenticated.");
  }

  return {
    Authorization: `Bearer ${accessToken}`,
    "x-studio-id": studioId,
  };
}

function getErrorMessage(
  error: unknown,
): string {
  if (error instanceof Error) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const value =
      error as Record<string, unknown>;

    const context =
      value.context;

    if (
      context &&
      typeof context === "object"
    ) {
      const contextValue =
        context as Record<string, unknown>;

      const body =
        contextValue.body;

      if (
        typeof body === "string" &&
        body.trim().length > 0
      ) {
        try {
          const parsed =
            JSON.parse(body) as Record<
              string,
              unknown
            >;

          const parsedError =
            parsed.error;

          if (
            parsedError &&
            typeof parsedError === "object"
          ) {
            const errorValue =
              parsedError as Record<
                string,
                unknown
              >;

            if (
              typeof errorValue.message ===
              "string"
            ) {
              return errorValue.message;
            }
          }

          if (
            typeof parsed.message ===
            "string"
          ) {
            return parsed.message;
          }
        } catch {
          return body;
        }
      }
    }

    if (
      typeof value.message === "string"
    ) {
      return value.message;
    }

    try {
      return JSON.stringify(
        error,
        Object.getOwnPropertyNames(error),
        2,
      );
    } catch {
      return "Unknown asset API error.";
    }
  }

  return "Unknown asset API error.";
}

function normalizeDimension(
  value: number | null | undefined,
): number | null {
  if (
    typeof value !== "number" ||
    !Number.isFinite(value) ||
    value <= 0
  ) {
    return null;
  }

  return Math.round(value);
}

export type PreparedAsset = {
  id: string;
  studio_id: string;
  album_id: string;
  asset_type: string;
  original_filename: string;
  storage_filename: string;
  storage_bucket: string;
  storage_path: string;
  mime_type: string;
  file_size: number | string;
  width: number | null;
  height: number | null;
  checksum: string | null;
  status: string;
};

export type CompletedAsset = {
  id: string;
  studio_id: string;
  album_id: string;
  storage_bucket: string;
  storage_path: string;
  storage_filename: string;
  mime_type: string;
  file_size: number | string;
  width: number | null;
  height: number | null;
  processing_status: string;
};

type AssetPrepareRpcResponse = {
  asset_id: string;
  bucket: string;
  storage_filename: string;
  storage_path: string;
};

type AssetCompleteRpcResponse = {
  id?: string;
  asset_id?: string;

  studio_id?: string;
  album_id?: string;

  storage_bucket?: string;
  bucket?: string;

  storage_path: string;
  storage_filename: string;

  mime_type: string;
  file_size: number | string;

  width?: number | null;
  height?: number | null;

  checksum?: string | null;

  processing_status: string;

  status?: string;
};

export async function prepareAsset(
  studioId: string,
  payload: {
    albumId: string;
    assetType: string;
    originalFilename: string;
    mimeType: string;
    fileSize: number;
    width?: number | null;
    height?: number | null;
    checksum?: string | null;
    metadata?: Record<string, unknown>;
  },
): Promise<PreparedAsset> {
  const width =
    normalizeDimension(
      payload.width,
    );

  const height =
    normalizeDimension(
      payload.height,
    );

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    ASSET_PREPARE_FUNCTION,
    {
      method: "POST",

      headers:
        await getHeaders(studioId),

      body: {
        album_id:
          payload.albumId,

        asset_type:
          payload.assetType,

        original_filename:
          payload.originalFilename,

        mime_type:
          payload.mimeType,

        file_size:
          payload.fileSize,

        width,

        height,

        checksum:
          payload.checksum ?? null,

        metadata:
          payload.metadata ?? {},
      },
    },
  );

  if (error) {
    console.error(
      "ASSET PREPARE FUNCTION ERROR",
      error,
    );

    throw new Error(
      getErrorMessage(error),
    );
  }

  if (!data) {
    throw new Error(
      "Asset prepare returned an empty response.",
    );
  }

  if (data.success !== true) {
    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to prepare asset.",
    );
  }

  if (!data.data) {
    throw new Error(
      "Asset prepare succeeded but asset data is missing.",
    );
  }

  const rpc =
    data.data as AssetPrepareRpcResponse;

  if (!rpc.asset_id) {
    throw new Error(
      "Asset prepare response is missing asset_id.",
    );
  }

  if (!rpc.bucket) {
    throw new Error(
      "Asset prepare response is missing bucket.",
    );
  }

  if (!rpc.storage_filename) {
    throw new Error(
      "Asset prepare response is missing storage_filename.",
    );
  }

  if (!rpc.storage_path) {
    throw new Error(
      "Asset prepare response is missing storage_path.",
    );
  }

  return {
    id:
      rpc.asset_id,

    studio_id:
      studioId,

    album_id:
      payload.albumId,

    asset_type:
      payload.assetType,

    original_filename:
      payload.originalFilename,

    storage_filename:
      rpc.storage_filename,

    storage_bucket:
      rpc.bucket,

    storage_path:
      rpc.storage_path,

    mime_type:
      payload.mimeType,

    file_size:
      payload.fileSize,

    width,

    height,

    checksum:
      payload.checksum ?? null,

    status:
      "uploading",
  };
}

export async function completeAsset(
  studioId: string,
  payload: {
    assetId: string;
    storagePath: string;
    storageFilename: string;
    mimeType: string;
    fileSize: number;
    checksum?: string | null;
    width?: number | null;
    height?: number | null;
    durationSeconds?: number | null;
  },
): Promise<CompletedAsset> {
  const width =
    normalizeDimension(
      payload.width,
    );

  const height =
    normalizeDimension(
      payload.height,
    );

  const requestBody = {
    asset_id:
      payload.assetId,

    storage_path:
      payload.storagePath,

    storage_filename:
      payload.storageFilename,

    mime_type:
      payload.mimeType,

    file_size:
      payload.fileSize,

    checksum:
      payload.checksum ?? null,

    width,

    height,

    duration_seconds:
      payload.durationSeconds ?? null,
  };

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    ASSET_COMPLETE_FUNCTION,
    {
      method: "POST",

      headers:
        await getHeaders(studioId),

      body:
        requestBody,
    },
  );

  if (error) {
    console.error(
      "ASSET COMPLETE FUNCTION ERROR",
      {
        error,
        assetId:
          payload.assetId,
        requestBody,
      },
    );

    throw new Error(
      getErrorMessage(error),
    );
  }

  if (!data) {
    throw new Error(
      "Asset complete returned an empty response.",
    );
  }

  if (data.success !== true) {
    console.error(
      "ASSET COMPLETE BACKEND RESPONSE",
      data,
    );

    throw new Error(
      data.error?.message ??
        data.message ??
        "Failed to complete asset.",
    );
  }

  if (!data.data) {
    throw new Error(
      "Asset complete succeeded but asset data is missing.",
    );
  }

  const rpc =
    data.data as AssetCompleteRpcResponse;

  const assetId =
    rpc.id ??
    rpc.asset_id;

  if (!assetId) {
    throw new Error(
      "Asset complete response is missing asset ID.",
    );
  }

  return {
    id:
      assetId,

    studio_id:
      rpc.studio_id ??
      studioId,

    album_id:
      rpc.album_id ??
      "",

    storage_bucket:
      rpc.storage_bucket ??
      rpc.bucket ??
      "assets",

    storage_path:
      rpc.storage_path,

    storage_filename:
      rpc.storage_filename,

    mime_type:
      rpc.mime_type,

    file_size:
      rpc.file_size,

    width:
      rpc.width ?? width,

    height:
      rpc.height ?? height,

    processing_status:
      rpc.processing_status,
  };
}
/* -------------------------------------------------------------------------- */
/* Album Assets                                                               */
/* -------------------------------------------------------------------------- */

export type AlbumAsset = {
  id: string;

  studio_id: string;

  album_id: string;

  asset_type: string;

  original_filename: string;

  storage_filename: string;

  storage_bucket: string;

  storage_path: string;

  thumbnail_path?: string | null;

  preview_path?: string | null;

  mime_type: string;

  file_size: number | string;

  width: number | null;

  height: number | null;

  status: string;

  processing_status?: string | null;

  created_at: string;

  updated_at?: string;
};

type ListAssetsResponse = {
  success?: boolean;

  limit?: number;

  offset?: number;

  count?: number;

  assets?: AlbumAsset[];
};

export type StudioAlbum = {
  id: string;
  title: string;
  code?: string | null;
};

type ListAlbumsResponse = {
  albums?: StudioAlbum[];
  count?: number;
};

export async function listStudioAlbums(
  studioId: string,
): Promise<StudioAlbum[]> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "album-list",
    {
      body: {
        studio_id: studioId,
        limit: 100,
        offset: 0,
      },
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  const result =
    (data?.data ?? {}) as ListAlbumsResponse;

  return Array.isArray(result.albums)
    ? result.albums
    : [];
}

export async function listAlbumAssets(
  albumId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
): Promise<ListAssetsResponse> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "asset-list",
    {
      body: {
        album_id: albumId,
        limit:
          options?.limit ??
          100,
        offset:
          options?.offset ??
          0,
      },
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  const result =
    (data?.data ?? {}) as ListAssetsResponse;

  return {
    success:
      result.success ??
      true,

    limit:
      Number(
        result.limit ??
          options?.limit ??
          100,
      ),

    offset:
      Number(
        result.offset ??
          options?.offset ??
          0,
      ),

    count:
      Number(
        result.count ??
          result.assets?.length ??
          0,
      ),

    assets:
      Array.isArray(
        result.assets,
      )
        ? result.assets
        : [],
  };
}

export async function generateAssetUrl(
  assetId: string,
  expiresIn = 3600,
): Promise<string | null> {
  const accessToken =
    await getFirebaseIdToken();

  if (!accessToken) {
    throw new Error(
      "User is not authenticated.",
    );
  }

  const {
    data,
    error,
  } = await supabase.functions.invoke(
    "storage-generate-url",
    {
      body: {
        asset_id: assetId,
        expires_in: expiresIn,
      },
      headers: {
        Authorization:
          `Bearer ${accessToken}`,
      },
    },
  );

  if (error) {
    throw error;
  }

  const payload =
    data?.data ?? data ?? {};

  return (
    payload.signed_url ??
    payload.signedUrl ??
    payload.url ??
    null
  );
}

/* -------------------------------------------------------------------------- */
/* Delete Asset                                                               */
/* -------------------------------------------------------------------------- */

function getDeleteAssetErrorMessage(
  error: unknown,
): string {
  if (
    error instanceof Error
  ) {
    return error.message;
  }

  if (
    typeof error === "object" &&
    error !== null
  ) {
    const value =
      error as Record<
        string,
        unknown
      >;

    const message =
      value.message;

    const details =
      value.details;

    const hint =
      value.hint;

    const code =
      value.code;

    const parts = [
      typeof message === "string"
        ? message
        : null,

      typeof details === "string"
        ? details
        : null,

      typeof hint === "string"
        ? hint
        : null,

      typeof code === "string"
        ? `Code: ${code}`
        : null,
    ].filter(
      (
        part,
      ): part is string =>
        Boolean(part),
    );

    if (
      parts.length > 0
    ) {
      return parts.join(
        " | ",
      );
    }

    try {
      return JSON.stringify(
        error,
        Object.getOwnPropertyNames(
          error,
        ),
        2,
      );
    } catch {
      return "Unknown error while deleting asset.";
    }
  }

  return "Unknown error while deleting asset.";
}

export async function deleteAlbumAsset(
  assetId: string,
): Promise<void> {
  const {
    data,
    error,
  } = await supabase.rpc(
    "delete_asset",
    {
      p_asset_id:
        assetId,
    },
  );

  if (error) {
    console.error(
      "DELETE ASSET RPC ERROR",
      {
        assetId,
        error,
        message:
          getDeleteAssetErrorMessage(
            error,
          ),
      },
    );

    throw new Error(
      getDeleteAssetErrorMessage(
        error,
      ),
    );
  }

  const result =
    (
      data ??
      {}
    ) as {
      success?: boolean;
      asset_id?: string;
      status?: string;
    };

  if (
    result.success !== true
  ) {
    console.error(
      "DELETE ASSET RPC INVALID RESPONSE",
      {
        assetId,
        data,
      },
    );

    throw new Error(
      "Delete asset RPC did not return success.",
    );
  }
}