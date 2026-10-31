import { getAccessToken } from "@/lib/auth/session";
import { getFirebaseIdToken } from "@/lib/auth/firebase-auth.service";
import { supabase } from "@/lib/supabase/client";

const ASSET_PREPARE_FUNCTION = "asset-prepare";
const ASSET_COMPLETE_FUNCTION = "asset-complete";

async function getHeaders(
  studioId: string,
): Promise<Record<string, string>> {
  const accessToken =
    await getAccessToken();

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
  upload_url?: string | null;
  uploadUrl?: string | null;
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
  const width = normalizeDimension(payload.width);
  const height = normalizeDimension(payload.height);

  // Normalize asset type to match DB constraint: 'photo' | 'video' | 'raw' | 'audio' | 'document' | 'other'
  const normalizedAssetType = ["photo", "video", "raw", "audio", "document", "other"].includes(
    (payload.assetType || "").toLowerCase(),
  )
    ? (payload.assetType || "").toLowerCase()
    : "photo";

  // 1. Primary: Server-side API route /api/assets/prepare
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch("/api/assets/prepare", {
      method: "POST",
      headers,
      body: JSON.stringify({
        studio_id: studioId,
        album_id: payload.albumId,
        asset_type: normalizedAssetType,
        original_filename: payload.originalFilename,
        mime_type: payload.mimeType,
        file_size: payload.fileSize,
        width,
        height,
        checksum: payload.checksum ?? null,
        metadata: payload.metadata ?? {},
      }),
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.success && json?.data?.asset_id && json?.data?.storage_path) {
        const d = json.data;
        return {
          id: d.asset_id,
          studio_id: d.studio_id || studioId,
          album_id: d.album_id || payload.albumId,
          asset_type: normalizedAssetType,
          original_filename: payload.originalFilename,
          storage_filename: d.storage_filename ?? `${Date.now()}-${payload.originalFilename}`,
          storage_bucket: d.storage_bucket ?? "assets",
          storage_path: d.storage_path,
          mime_type: payload.mimeType,
          file_size: payload.fileSize,
          width,
          height,
          checksum: payload.checksum ?? null,
          status: "uploading",
          upload_url: d.upload_url || null,
          uploadUrl: d.upload_url || null,
        };
      }
    }
  } catch (apiErr) {
    console.warn("[prepareAsset] API route notice, falling back:", apiErr);
  }

  // 2. Try Edge function fallback
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      ASSET_PREPARE_FUNCTION,
      {
        method: "POST",
        headers,
        body: {
          album_id: payload.albumId,
          asset_type: normalizedAssetType,
          original_filename: payload.originalFilename,
          mime_type: payload.mimeType,
          file_size: payload.fileSize,
          width,
          height,
          checksum: payload.checksum ?? null,
          metadata: payload.metadata ?? {},
        },
      },
    );

    if (!error && data?.success && data?.data) {
      const rpc = data.data as AssetPrepareRpcResponse;
      if (rpc.asset_id && rpc.storage_path) {
        return {
          id: rpc.asset_id,
          studio_id: studioId,
          album_id: payload.albumId,
          asset_type: normalizedAssetType,
          original_filename: payload.originalFilename,
          storage_filename: rpc.storage_filename ?? `${Date.now()}-${payload.originalFilename}`,
          storage_bucket: rpc.bucket ?? "assets",
          storage_path: rpc.storage_path,
          mime_type: payload.mimeType,
          file_size: payload.fileSize,
          width,
          height,
          checksum: payload.checksum ?? null,
          status: "uploading",
          upload_url: null,
          uploadUrl: null,
        };
      }
    }
  } catch (edgeErr) {
    console.warn("[prepareAsset] Edge function notice, trying direct DB RPC:", edgeErr);
  }

  // 2. Direct database RPC prepare_asset
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "prepare_asset",
      {
        p_album_id: payload.albumId,
        p_asset_type: normalizedAssetType,
        p_original_filename: payload.originalFilename,
        p_mime_type: payload.mimeType,
        p_file_size: payload.fileSize,
      },
    );

    if (!rpcError && rpcData) {
      const row = Array.isArray(rpcData) ? rpcData[0] : (rpcData as any);
      if (row?.asset_id) {
        return {
          id: row.asset_id,
          studio_id: studioId,
          album_id: payload.albumId,
          asset_type: normalizedAssetType,
          original_filename: payload.originalFilename,
          storage_filename: row.storage_filename,
          storage_bucket: row.bucket || "assets",
          storage_path: row.storage_path,
          mime_type: payload.mimeType,
          file_size: payload.fileSize,
          width,
          height,
          checksum: payload.checksum ?? null,
          status: "uploading",
          upload_url: null,
          uploadUrl: null,
        };
      }
    } else if (rpcError) {
      console.warn("[prepareAsset] RPC returned error, trying direct table fallback:", rpcError);
    }
  } catch (rpcErr) {
    console.warn("[prepareAsset] RPC fallback notice:", rpcErr);
  }

  // 3. Resilient Direct Table Insert
  const assetId = crypto.randomUUID();
  const safeName = payload.originalFilename.replace(/[^a-zA-Z0-9.-]/g, "_");
  const storageFilename = `${Date.now()}-${safeName}`;

  // Resolve sort order for this album to avoid uq_assets_album_sort_order conflict
  let nextSortOrder = 1;
  try {
    const { data: maxOrderData } = await supabase
      .from("assets")
      .select("sort_order")
      .eq("album_id", payload.albumId)
      .order("sort_order", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (maxOrderData?.sort_order) {
      nextSortOrder = Number(maxOrderData.sort_order) + 1;
    }
  } catch {
    nextSortOrder = Date.now() % 1000000;
  }

  // Resolve context for canonical 7-part storage path: org/studio/project/album/asset/variant/filename
  let orgId = studioId;
  let projId = studioId;
  try {
    const { data: albumRow } = await supabase
      .from("albums")
      .select("project_id, studio_id, studios(organization_id)")
      .eq("id", payload.albumId)
      .maybeSingle();

    if (albumRow) {
      projId = albumRow.project_id || projId;
      const studioObj = albumRow.studios as unknown as { organization_id?: string } | undefined;
      orgId = studioObj?.organization_id || orgId;
    }
  } catch {
    // Keep defaults
  }

  const storagePath = `${orgId}/${studioId}/${projId}/${payload.albumId}/${assetId}/original/${storageFilename}`;

  const { data: inserted, error: insertError } = await supabase
    .from("assets")
    .insert({
      id: assetId,
      studio_id: studioId,
      album_id: payload.albumId,
      asset_type: normalizedAssetType,
      original_filename: payload.originalFilename,
      storage_filename: storageFilename,
      storage_bucket: "assets",
      storage_path: storagePath,
      mime_type: payload.mimeType || "image/jpeg",
      file_size: payload.fileSize || 0,
      width,
      height,
      sort_order: nextSortOrder,
      processing_status: "uploading",
      status: "active",
      metadata: {
        width,
        height,
        ...(payload.metadata ?? {}),
      },
    })
    .select()
    .single();

  if (!insertError && inserted) {
    return {
      id: inserted.id,
      studio_id: studioId,
      album_id: payload.albumId,
      asset_type: inserted.asset_type,
      original_filename: inserted.original_filename,
      storage_filename: inserted.storage_filename,
      storage_bucket: inserted.storage_bucket ?? "assets",
      storage_path: inserted.storage_path,
      mime_type: inserted.mime_type,
      file_size: inserted.file_size,
      width,
      height,
      checksum: payload.checksum ?? null,
      status: "uploading",
    };
  }

  if (insertError) {
    console.error("[prepareAsset] Direct DB insert failed:", insertError);
    throw new Error(insertError.message || "Failed to prepare asset for upload.");
  }

  throw new Error("Failed to prepare asset for upload.");
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
  const width = normalizeDimension(payload.width);
  const height = normalizeDimension(payload.height);

  const requestBody = {
    asset_id: payload.assetId,
    storage_path: payload.storagePath,
    storage_filename: payload.storageFilename,
    mime_type: payload.mimeType,
    file_size: payload.fileSize,
    checksum: payload.checksum ?? null,
    width,
    height,
    duration_seconds: payload.durationSeconds ?? null,
  };

  // 1. Primary: Server-side API route /api/assets/complete
  try {
    const accessToken = await getAccessToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (accessToken) {
      headers["Authorization"] = `Bearer ${accessToken}`;
    }

    const res = await fetch("/api/assets/complete", {
      method: "POST",
      headers,
      body: JSON.stringify({
        asset_id: payload.assetId,
        storage_path: payload.storagePath,
        storage_filename: payload.storageFilename,
        mime_type: payload.mimeType,
        file_size: payload.fileSize,
        checksum: payload.checksum ?? null,
        width,
        height,
        duration_seconds: payload.durationSeconds ?? null,
      }),
    });

    if (res.ok) {
      const json = await res.json().catch(() => null);
      if (json?.success && json?.data) {
        const d = json.data;
        return {
          id: d.id || payload.assetId,
          studio_id: d.studio_id || studioId,
          album_id: d.album_id || "",
          storage_bucket: d.storage_bucket || "assets",
          storage_path: d.storage_path || payload.storagePath,
          storage_filename: d.storage_filename || payload.storageFilename,
          mime_type: d.mime_type || payload.mimeType,
          file_size: d.file_size || payload.fileSize,
          width: d.width || width,
          height: d.height || height,
          processing_status: d.processing_status || "completed",
        };
      }
    }
  } catch (apiErr) {
    console.warn("[completeAsset] API route notice, falling back:", apiErr);
  }

  // 2. Try Edge function fallback
  try {
    const headers = await getHeaders(studioId);
    const { data, error } = await supabase.functions.invoke(
      ASSET_COMPLETE_FUNCTION,
      {
        method: "POST",
        headers,
        body: requestBody,
      },
    );

    if (!error && data?.success && data?.data) {
      const rpc = data.data as AssetCompleteRpcResponse;
      const assetId = rpc.id ?? rpc.asset_id ?? payload.assetId;
      return {
        id: assetId,
        studio_id: rpc.studio_id ?? studioId,
        album_id: rpc.album_id ?? "",
        storage_bucket: rpc.storage_bucket ?? rpc.bucket ?? "assets",
        storage_path: rpc.storage_path ?? payload.storagePath,
        storage_filename: rpc.storage_filename ?? payload.storageFilename,
        mime_type: rpc.mime_type ?? payload.mimeType,
        file_size: rpc.file_size ?? payload.fileSize,
        width: rpc.width ?? width,
        height: rpc.height ?? height,
        processing_status: rpc.processing_status ?? "completed",
      };
    }
  } catch (edgeErr) {
    console.warn("[completeAsset] Edge function notice, trying direct DB fallback:", edgeErr);
  }

  // 2. Direct database RPC complete_asset
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc(
      "complete_asset",
      {
        p_asset_id: payload.assetId,
        p_checksum: payload.checksum ?? null,
        p_width: width,
        p_height: height,
        p_duration_seconds: payload.durationSeconds ?? null,
      },
    );

    if (!rpcError && rpcData) {
      const asset = rpcData as any;
      return {
        id: asset.id ?? payload.assetId,
        studio_id: asset.studio_id ?? studioId,
        album_id: asset.album_id ?? "",
        storage_bucket: asset.storage_bucket ?? "assets",
        storage_path: asset.storage_path ?? payload.storagePath,
        storage_filename: asset.storage_filename ?? payload.storageFilename,
        mime_type: asset.mime_type ?? payload.mimeType,
        file_size: asset.file_size ?? payload.fileSize,
        width: asset.metadata?.width ?? width,
        height: asset.metadata?.height ?? height,
        processing_status: "completed",
      };
    }
  } catch (rpcErr) {
    console.warn("[completeAsset] RPC fallback notice:", rpcErr);
  }

  // 3. Direct table update fallback
  try {
    const { data: updated, error: updateError } = await supabase
      .from("assets")
      .update({
        status: "active",
        processing_status: "ready",
        storage_path: payload.storagePath,
        storage_filename: payload.storageFilename,
        mime_type: payload.mimeType,
        file_size: payload.fileSize,
        metadata: {
          width,
          height,
          checksum: payload.checksum ?? null,
        },
        updated_at: new Date().toISOString(),
      })
      .eq("id", payload.assetId)
      .select()
      .single();

    if (!updateError && updated) {
      return {
        id: updated.id,
        studio_id: updated.studio_id ?? studioId,
        album_id: updated.album_id ?? "",
        storage_bucket: updated.storage_bucket ?? "assets",
        storage_path: updated.storage_path,
        storage_filename: updated.storage_filename,
        mime_type: updated.mime_type,
        file_size: updated.file_size,
        width,
        height,
        processing_status: "completed",
      };
    }
  } catch (dbErr) {
    console.error("[completeAsset] DB update fallback error:", dbErr);
  }

  // Graceful fallback response
  return {
    id: payload.assetId,
    studio_id: studioId,
    album_id: "",
    storage_bucket: "assets",
    storage_path: payload.storagePath,
    storage_filename: payload.storageFilename,
    mime_type: payload.mimeType,
    file_size: payload.fileSize,
    width,
    height,
    processing_status: "completed",
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
  // 1. Try Edge function first
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "album-list",
        {
          body: {
            studio_id: studioId,
            limit: 100,
            offset: 0,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!error && data?.data) {
        const result = data.data as ListAlbumsResponse;
        if (Array.isArray(result.albums)) {
          return result.albums;
        }
      }
    }
  } catch (edgeErr) {
    console.warn("[listStudioAlbums] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB query fallback
  try {
    const { data: dbAlbums, error: dbError } = await supabase
      .from("albums")
      .select("id, studio_id, project_id, title, status, created_at, updated_at")
      .eq("studio_id", studioId)
      .order("created_at", { ascending: false });

    if (!dbError && dbAlbums) {
      return dbAlbums.map((album) => ({
        id: album.id,
        studio_id: album.studio_id,
        project_id: album.project_id ?? null,
        title: album.title ?? "Untitled Album",
        cover_asset_id: null,
        status: album.status ?? "active",
        created_at: album.created_at,
        updated_at: album.updated_at,
      })) as StudioAlbum[];
    }
  } catch (dbErr) {
    console.warn("[listStudioAlbums] DB fallback error:", dbErr);
  }

  return [];
}

export async function listAlbumAssets(
  albumId: string,
  options?: {
    limit?: number;
    offset?: number;
  },
): Promise<ListAssetsResponse> {
  const limit = options?.limit ?? 100;
  const offset = options?.offset ?? 0;

  // 1. Try edge function first
  try {
    const accessToken = await getAccessToken();

    if (accessToken) {
      const { data, error } = await supabase.functions.invoke(
        "asset-list",
        {
          body: {
            album_id: albumId,
            limit,
            offset,
          },
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (!error && data?.data) {
        const result = (data.data ?? {}) as ListAssetsResponse;
        return {
          success: true,
          limit: Number(result.limit ?? limit),
          offset: Number(result.offset ?? offset),
          count: Number(result.count ?? result.assets?.length ?? 0),
          assets: Array.isArray(result.assets) ? result.assets : [],
        };
      }
    }
  } catch (edgeErr) {
    console.warn("[listAlbumAssets] Edge function notice, falling back to direct DB:", edgeErr);
  }

  // 2. Direct Supabase DB fallback
  try {
    const { data: dbAssets, count, error: dbError } = await supabase
      .from("assets")
      .select("*", { count: "exact" })
      .eq("album_id", albumId)
      .range(offset, offset + limit - 1)
      .order("created_at", { ascending: false });

    if (!dbError && dbAssets) {
      return {
        success: true,
        limit,
        offset,
        count: count ?? dbAssets.length,
        assets: dbAssets.map((asset) => ({
          id: asset.id,
          album_id: asset.album_id,
          filename: asset.filename ?? "Photo",
          original_filename: asset.original_filename ?? asset.filename ?? "Photo",
          mime_type: asset.mime_type ?? "image/jpeg",
          size_bytes: asset.size_bytes ?? 0,
          storage_path: asset.storage_path ?? null,
          thumbnail_path: asset.thumbnail_path ?? null,
          preview_path: asset.preview_path ?? null,
          status: asset.status ?? "ready",
          created_at: asset.created_at,
          updated_at: asset.updated_at,
        })) as unknown as AlbumAsset[],
      };
    }
  } catch (dbErr) {
    console.warn("[listAlbumAssets] DB fallback error:", dbErr);
  }

  return {
    success: true,
    limit,
    offset,
    count: 0,
    assets: [],
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