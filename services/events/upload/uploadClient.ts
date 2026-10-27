import type { SupabaseClient } from "@supabase/supabase-js";

import { supabase } from "@/lib/supabase/client";

const STORAGE_BUCKET = "assets";

export interface UploadRequest {
  path: string;
  file: File;
  contentType: string;
  signal?: AbortSignal;
}

export interface StorageUploadResponse {
  success: boolean;
  path?: string;
  fullPath?: string;
  error?: string;
}

export class UploadClient {
  constructor(
    private readonly client: SupabaseClient = supabase,
  ) {}

  async upload(
  request: UploadRequest
): Promise<StorageUploadResponse> {

  const {
    data: {
      session,
    },
  } = await this.client.auth.getSession();

  if (!session) {
    return {
      success: false,
      error: "Authentication session required for upload.",
    };
  }

  const { data, error } =
    await this.client.storage
      .from(STORAGE_BUCKET)
      .upload(
        request.path,
        request.file,
        {
          contentType:
            request.contentType,
          upsert: false,
        },
      );

    if (request.signal?.aborted) {
      throw new DOMException(
        "Upload cancelled.",
        "AbortError",
      );
    }

    if (error) {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: true,
      path: data.path,
      fullPath: data.fullPath,
    };
  }

  async remove(path: string) {
    return this.client.storage
      .from(STORAGE_BUCKET)
      .remove([path]);
  }

  getPublicUrl(path: string) {
    return this.client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(path);
  }

  async createSignedUrl(
    path: string,
    expiresIn = 3600,
  ) {
    return this.client.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(
        path,
        expiresIn,
      );
  }
}

export const uploadClient =
  new UploadClient();
