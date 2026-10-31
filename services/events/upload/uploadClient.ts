import type { SupabaseClient } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";

const STORAGE_BUCKET = "assets";

export interface UploadRequest {
  path: string;
  file: File;
  contentType: string;
  signal?: AbortSignal;
  uploadUrl?: string | null;
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
    if (request.signal?.aborted) {
      throw new DOMException("Upload cancelled.", "AbortError");
    }

    // 1. Direct Presigned PUT Upload (Bypasses Storage RLS and Vercel Payload Limits)
    if (request.uploadUrl) {
      try {
        const response = await new Promise<StorageUploadResponse>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          if (request.signal) {
            request.signal.addEventListener("abort", () => {
              xhr.abort();
              reject(new DOMException("Upload cancelled.", "AbortError"));
            });
          }

          xhr.open("PUT", request.uploadUrl!, true);
          xhr.setRequestHeader("Content-Type", request.contentType || "application/octet-stream");

          xhr.onload = () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve({
                success: true,
                path: request.path,
                fullPath: `${STORAGE_BUCKET}/${request.path}`,
              });
            } else {
              resolve({
                success: false,
                error: `Storage upload returned status ${xhr.status}: ${xhr.statusText}`,
              });
            }
          };

          xhr.onerror = () => {
            resolve({
              success: false,
              error: "Network error during signed storage upload.",
            });
          };

          xhr.send(request.file);
        });

        if (response.success) {
          return response;
        }
        console.warn("[UploadClient] Signed upload did not succeed, trying fallbacks:", response.error);
      } catch (signedErr: any) {
        if (signedErr?.name === "AbortError") throw signedErr;
        console.warn("[UploadClient] Signed upload exception, trying fallbacks:", signedErr);
      }
    }

    // 2. Direct Supabase Client Storage Upload
    try {
      const { data, error } = await this.client.storage
        .from(STORAGE_BUCKET)
        .upload(
          request.path,
          request.file,
          {
            contentType: request.contentType,
            upsert: true,
          },
        );

      if (request.signal?.aborted) {
        throw new DOMException("Upload cancelled.", "AbortError");
      }

      if (!error && data?.path) {
        return {
          success: true,
          path: data.path,
          fullPath: data.fullPath,
        };
      }

      console.warn("[UploadClient] Direct storage upload error:", error?.message);
    } catch (clientErr: any) {
      if (clientErr?.name === "AbortError") throw clientErr;
      console.warn("[UploadClient] Direct storage upload threw:", clientErr);
    }

    // 3. Resilient Server-Side Storage Upload (/api/storage/upload)
    try {
      const formData = new FormData();
      formData.append("file", request.file);
      formData.append("path", request.path);
      formData.append("bucket", STORAGE_BUCKET);

      const res = await fetch("/api/storage/upload", {
        method: "POST",
        body: formData,
        signal: request.signal,
      });

      if (res.ok) {
        const json = await res.json().catch(() => null);
        if (json?.success) {
          return {
            success: true,
            path: json.path || request.path,
            fullPath: json.fullPath || `${STORAGE_BUCKET}/${request.path}`,
          };
        }
        if (json?.error) {
          return {
            success: false,
            error: json.error,
          };
        }
      }
    } catch (serverErr: any) {
      if (serverErr?.name === "AbortError") throw serverErr;
      console.warn("[UploadClient] Server-side storage upload fallback failed:", serverErr);
    }

    return {
      success: false,
      error: "Failed to upload file to storage.",
    };
  }

  async remove(path: string) {
    try {
      return await this.client.storage
        .from(STORAGE_BUCKET)
        .remove([path]);
    } catch {
      return { data: null, error: null };
    }
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

export const uploadClient = new UploadClient();
