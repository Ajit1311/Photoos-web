export const MAX_FILE_SIZE =
  50 * 1024 * 1024; // 50 MB

export const MAX_UPLOAD_FILES = 1000;

export const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
  "image/avif",
  "image/gif",
  "image/tiff",
] as const;

export const ALLOWED_EXTENSIONS = [
  ".jpg",
  ".jpeg",
  ".png",
  ".webp",
  ".heic",
  ".heif",
  ".avif",
  ".gif",
  ".tif",
  ".tiff",
] as const;

export type UploadValidationErrorCode =
  | "INVALID_FILE_TYPE"
  | "INVALID_EXTENSION"
  | "FILE_TOO_LARGE"
  | "EMPTY_FILE"
  | "TOO_MANY_FILES"
  | "DUPLICATE_FILE";

export interface UploadValidationError {
  code: UploadValidationErrorCode;

  message: string;
}

export interface UploadValidationResult {
  valid: boolean;

  error?: UploadValidationError;
}

export function validateFile(
  file: File
): UploadValidationResult {
  if (file.size === 0) {
    return {
      valid: false,
      error: {
        code: "EMPTY_FILE",
        message: "File is empty.",
      },
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: {
        code: "FILE_TOO_LARGE",
        message: `Maximum allowed size is ${
          MAX_FILE_SIZE / 1024 / 1024
        } MB.`,
      },
    };
  }

  if (
    !ALLOWED_IMAGE_TYPES.includes(
      file.type as (typeof ALLOWED_IMAGE_TYPES)[number]
    )
  ) {
    return {
      valid: false,
      error: {
        code: "INVALID_FILE_TYPE",
        message: "Unsupported image format.",
      },
    };
  }

  const extension =
    "." +
    file.name
      .split(".")
      .pop()
      ?.toLowerCase();

  if (
    !ALLOWED_EXTENSIONS.includes(
      extension as (typeof ALLOWED_EXTENSIONS)[number]
    )
  ) {
    return {
      valid: false,
      error: {
        code: "INVALID_EXTENSION",
        message: "Invalid file extension.",
      },
    };
  }

  return {
    valid: true,
  };
}

export function validateUploadLimit(
  currentCount: number,
  incomingCount: number
): UploadValidationResult {
  if (
    currentCount + incomingCount >
    MAX_UPLOAD_FILES
  ) {
    return {
      valid: false,
      error: {
        code: "TOO_MANY_FILES",
        message: `Maximum ${MAX_UPLOAD_FILES} files allowed in upload queue.`,
      },
    };
  }

  return {
    valid: true,
  };
}

export function isDuplicateFile(
  file: File,
  existingFiles: File[]
): boolean {
  return existingFiles.some(
    (existing) =>
      existing.name === file.name &&
      existing.size === file.size &&
      existing.lastModified ===
        file.lastModified
  );
}

export function validateFiles(
  files: File[],
  existingFiles: File[] = []
) {
  const validFiles: File[] = [];

  const errors: Array<{
    file: File;
    error: UploadValidationError;
  }> = [];

  for (const file of files) {
    if (
      isDuplicateFile(
        file,
        existingFiles
      )
    ) {
      errors.push({
        file,
        error: {
          code: "DUPLICATE_FILE",
          message:
            "Duplicate file skipped.",
        },
      });

      continue;
    }

    const result =
      validateFile(file);

    if (!result.valid) {
      errors.push({
        file,
        error: result.error!,
      });

      continue;
    }

    validFiles.push(file);
  }

  return {
    validFiles,
    errors,
  };
}