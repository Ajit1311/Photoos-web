export interface ImageMetadata {
  width: number;

  height: number;

  aspectRatio: number;

  orientation:
    | "landscape"
    | "portrait"
    | "square";

  mimeType: string;

  size: number;

  lastModified: number;
}

export interface ThumbnailOptions {
  maxWidth?: number;

  maxHeight?: number;

  quality?: number;

  type?:
    | "image/jpeg"
    | "image/webp"
    | "image/png";
}

/* -------------------------------------------------------------------------- */
/* Environment                                                                */
/* -------------------------------------------------------------------------- */

function ensureBrowserEnvironment(): void {
  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    throw new Error(
      "Image processing is only available in the browser.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* HEIC Detection                                                             */
/* -------------------------------------------------------------------------- */

function isHeicFile(
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

/* -------------------------------------------------------------------------- */
/* HEIC Conversion                                                            */
/* -------------------------------------------------------------------------- */

async function convertHeicToBlob(
  file: File,
): Promise<Blob> {
  ensureBrowserEnvironment();

  /*
   * Important:
   *
   * Do not import heic2any at the module level.
   *
   * heic2any accesses browser APIs internally and can
   * cause "window is not defined" during Next.js SSR.
   *
   * Dynamic import ensures the package is loaded only
   * when this function runs in the browser.
   */

  const module =
    await import(
      "heic2any"
    );

  const heic2any =
    module.default;

  const result =
    await heic2any({
      blob: file,
      toType: "image/jpeg",
      quality: 0.92,
    });

  if (
    Array.isArray(
      result,
    )
  ) {
    const first =
      result[0];

    if (!first) {
      throw new Error(
        "HEIC conversion returned no image.",
      );
    }

    return first;
  }

  if (!result) {
    throw new Error(
      "HEIC conversion returned no image.",
    );
  }

  return result;
}

/* -------------------------------------------------------------------------- */
/* Source Blob                                                                */
/* -------------------------------------------------------------------------- */

async function getSourceBlob(
  file: File,
): Promise<Blob> {
  if (
    !isHeicFile(
      file,
    )
  ) {
    return file;
  }

  try {
    return await convertHeicToBlob(
      file,
    );
  } catch (
    error
  ) {
    console.error(
      "HEIC CONVERSION FAILED",
      {
        fileName:
          file.name,

        fileType:
          file.type,

        error,
      },
    );

    throw new Error(
      "The HEIC image could not be converted.",
    );
  }
}

/* -------------------------------------------------------------------------- */
/* Image Bitmap                                                               */
/* -------------------------------------------------------------------------- */

async function getBitmapForImage(
  file: File,
): Promise<ImageBitmap> {
  ensureBrowserEnvironment();

  /*
   * HEIC / HEIF files are converted to JPEG first.
   *
   * This gives createImageBitmap a browser-compatible
   * image format for metadata and thumbnail generation.
   */

  if (
    isHeicFile(
      file,
    )
  ) {
    const convertedBlob =
      await getSourceBlob(
        file,
      );

    return await createImageBitmap(
      convertedBlob,
    );
  }

  return await createImageBitmap(
    file,
  );
}

/* -------------------------------------------------------------------------- */
/* Image Metadata                                                             */
/* -------------------------------------------------------------------------- */

export async function getImageMetadata(
  file: File,
): Promise<ImageMetadata> {
  const bitmap =
    await getBitmapForImage(
      file,
    );

  try {
    const width =
      bitmap.width;

    const height =
      bitmap.height;

    let orientation:
      ImageMetadata["orientation"] =
        "landscape";

    if (
      height > width
    ) {
      orientation =
        "portrait";
    } else if (
      width === height
    ) {
      orientation =
        "square";
    }

    return {
      width,

      height,

      aspectRatio:
        width / height,

      orientation,

      mimeType:
        file.type,

      size:
        file.size,

      lastModified:
        file.lastModified,
    };
  } finally {
    bitmap.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Thumbnail Generation                                                       */
/* -------------------------------------------------------------------------- */

export async function generateThumbnail(
  file: File,
  options: ThumbnailOptions = {},
): Promise<Blob> {
  ensureBrowserEnvironment();

  const {
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.9,
    type = "image/jpeg",
  } = options;

  const bitmap =
    await getBitmapForImage(
      file,
    );

  try {
    let width =
      bitmap.width;

    let height =
      bitmap.height;

    if (
      width <= 0 ||
      height <= 0
    ) {
      throw new Error(
        "Image dimensions are invalid.",
      );
    }

    const ratio =
      Math.min(
        maxWidth / width,
        maxHeight / height,
        1,
      );

    width =
      Math.max(
        1,
        Math.round(
          width * ratio,
        ),
      );

    height =
      Math.max(
        1,
        Math.round(
          height * ratio,
        ),
      );

    const canvas =
      document.createElement(
        "canvas",
      );

    canvas.width =
      width;

    canvas.height =
      height;

    const context =
      canvas.getContext(
        "2d",
      );

    if (!context) {
      throw new Error(
        "Canvas context unavailable.",
      );
    }

    context.drawImage(
      bitmap,
      0,
      0,
      width,
      height,
    );

    return await new Promise<
      Blob
    >(
      (
        resolve,
        reject,
      ) => {
        canvas.toBlob(
          (
            blob,
          ) => {
            if (!blob) {
              reject(
                new Error(
                  "Thumbnail generation failed.",
                ),
              );

              return;
            }

            resolve(
              blob,
            );
          },
          type,
          quality,
        );
      },
    );
  } finally {
    bitmap.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Image Dimensions                                                           */
/* -------------------------------------------------------------------------- */

export async function getImageDimensions(
  file: File,
): Promise<{
  width: number;

  height: number;
}> {
  const bitmap =
    await getBitmapForImage(
      file,
    );

  try {
    return {
      width:
        bitmap.width,

      height:
        bitmap.height,
    };
  } finally {
    bitmap.close();
  }
}

/* -------------------------------------------------------------------------- */
/* Orientation Helpers                                                        */
/* -------------------------------------------------------------------------- */

export async function isImageLandscape(
  file: File,
): Promise<boolean> {
  const {
    width,
    height,
  } =
    await getImageDimensions(
      file,
    );

  return width > height;
}

export async function isImagePortrait(
  file: File,
): Promise<boolean> {
  const {
    width,
    height,
  } =
    await getImageDimensions(
      file,
    );

  return height > width;
}

export async function isSquareImage(
  file: File,
): Promise<boolean> {
  const {
    width,
    height,
  } =
    await getImageDimensions(
      file,
    );

  return width === height;
}