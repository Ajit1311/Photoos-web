import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const ALLOWED_MIME_TYPES = new Set([
  // Images
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/tiff",
  // Documents
  "application/pdf",
  // Video
  "video/mp4",
  "video/quicktime",
]);

const MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100 MB

export interface PresignedUploadOptions {
  studioId: string;
  userId: string;
  filename: string;
  contentType: string;
  sizeBytes: number;
}

export interface PresignedUploadResult {
  uploadUrl: string;
  key: string;
  expiresInSeconds: number;
  bucket: string;
}

function getR2Client(): { client: S3Client; bucket: string } | null {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME || "photoos-assets";

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  const client = new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });

  return { client, bucket };
}

export function isR2Configured(): boolean {
  return Boolean(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY,
  );
}

/**
 * Validates file type and size against security policies.
 */
export function validateUploadPolicy(contentType: string, sizeBytes: number): void {
  const normalizedType = contentType.toLowerCase().split(";")[0].trim();
  if (!ALLOWED_MIME_TYPES.has(normalizedType)) {
    throw new Error(
      `File type "${contentType}" is not permitted. Only standard image, PDF, and video formats are allowed.`,
    );
  }

  if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    throw new Error(
      `File size (${Math.round(sizeBytes / 1024 / 1024)}MB) exceeds the maximum allowed limit of 100MB.`,
    );
  }
}

/**
 * Generates an unguessable object key strictly isolated under the tenant's studio namespace.
 */
export function generateObjectKey(studioId: string, filename: string): string {
  const randomUuid = typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : "obj_" + Date.now();

  const cleanFilename = filename
    .replace(/[^a-zA-Z0-9._-]/g, "_")
    .replace(/\.+/g, ".")
    .substring(0, 100);

  return `studios/${studioId}/uploads/${randomUuid}-${cleanFilename}`;
}

/**
 * Generates a short-expiry presigned URL for direct secure browser-to-R2 upload.
 */
export async function createR2PresignedUploadUrl(
  options: PresignedUploadOptions,
): Promise<PresignedUploadResult> {
  validateUploadPolicy(options.contentType, options.sizeBytes);

  const r2 = getR2Client();
  if (!r2) {
    throw new Error("Cloudflare R2 credentials are not configured on the server.");
  }

  const key = generateObjectKey(options.studioId, options.filename);
  const expiresInSeconds = 900; // 15 minutes

  const command = new PutObjectCommand({
    Bucket: r2.bucket,
    Key: key,
    ContentType: options.contentType,
    ContentLength: options.sizeBytes,
    ServerSideEncryption: "AES256",
    Metadata: {
      "studio-id": options.studioId,
      "uploaded-by": options.userId,
    },
  });

  const uploadUrl = await getSignedUrl(r2.client, command, {
    expiresIn: expiresInSeconds,
  });

  return {
    uploadUrl,
    key,
    expiresInSeconds,
    bucket: r2.bucket,
  };
}

/**
 * Generates a short-expiry signed URL to view/download a private object from R2.
 */
export async function createR2PresignedDownloadUrl(
  key: string,
  expiresInSeconds = 3600,
): Promise<string> {
  const r2 = getR2Client();
  if (!r2) {
    throw new Error("Cloudflare R2 credentials are not configured on the server.");
  }

  const command = new GetObjectCommand({
    Bucket: r2.bucket,
    Key: key,
  });

  return getSignedUrl(r2.client, command, {
    expiresIn: expiresInSeconds,
  });
}

/**
 * Deletes an object from R2.
 */
export async function deleteR2Object(key: string): Promise<void> {
  const r2 = getR2Client();
  if (!r2) {
    throw new Error("Cloudflare R2 credentials are not configured on the server.");
  }

  const command = new DeleteObjectCommand({
    Bucket: r2.bucket,
    Key: key,
  });

  await r2.client.send(command);
}

