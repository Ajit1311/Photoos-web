import { supabase } from "@/lib/supabase/client";

import type {
  CreateAssetRequest,
  CreatedAsset,
} from "./types";

const FUNCTION_NAME = "assets";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function createAsset(
  studioId: string,
  payload: CreateAssetRequest,
): Promise<CreatedAsset> {

  const {
    data,
    error,
  } = await supabase.functions.invoke<
    ApiResponse<CreatedAsset>
  >(
    FUNCTION_NAME,
    {
      method: "POST",

      headers: {
        "x-studio-id": studioId,
      },

      body: {
        album_id:
          payload.albumId,

        asset_type:
          payload.assetType,

        original_filename:
          payload.originalFilename,

        storage_filename:
          payload.storageFilename,

        storage_bucket:
          payload.storageBucket,

        storage_path:
          payload.storagePath,

        mime_type:
          payload.mimeType,

        file_size:
          payload.fileSize,

        title:
          payload.title,

        description:
          payload.description,

        width:
          payload.width,

        height:
          payload.height,

        duration_seconds:
          payload.durationSeconds,

        checksum:
          payload.checksum,

        metadata:
          payload.metadata,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to create asset.",
    );

  }

  return data.data;

}