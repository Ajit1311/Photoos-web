import { supabase } from "@/lib/supabase/client";

import type {
  CompleteUploadRequest,
  CompleteUploadResponse,
} from "./types";

const FUNCTION_NAME = "storage";

interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export async function completeUpload(
  studioId: string,
  payload: CompleteUploadRequest,
): Promise<CompleteUploadResponse> {

  const {
    data,
    error,
  } = await supabase.functions.invoke<
    ApiResponse<CompleteUploadResponse>
  >(
    FUNCTION_NAME,
    {
      method: "PATCH",

      headers: {
        "x-studio-id": studioId,
      },

      body: {
        asset_id:
          payload.assetId,

        storage_bucket:
          payload.storageBucket,

        storage_path:
          payload.storagePath,

        storage_filename:
          payload.storageFilename,

        mime_type:
          payload.mimeType,

        file_size:
          payload.fileSize,

        checksum:
          payload.checksum,

        width:
          payload.width,

        height:
          payload.height,

        duration_seconds:
          payload.durationSeconds,
      },
    },
  );

  if (error) {
    throw error;
  }

  if (!data?.success) {

    throw new Error(
      "Failed to complete upload.",
    );

  }

  return data.data;

}