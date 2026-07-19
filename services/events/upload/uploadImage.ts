export interface ImageMetadata {
  width: number;

  height: number;

  aspectRatio: number;

  orientation: "landscape" | "portrait" | "square";

  mimeType: string;

  size: number;

  lastModified: number;
}

export interface ThumbnailOptions {
  maxWidth?: number;

  maxHeight?: number;

  quality?: number;

  type?: "image/jpeg" | "image/webp" | "image/png";
}

export async function getImageMetadata(
  file: File
): Promise<ImageMetadata> {
  const bitmap = await createImageBitmap(file);

  const width = bitmap.width;

  const height = bitmap.height;

  bitmap.close();

  let orientation: ImageMetadata["orientation"] =
    "landscape";

  if (height > width) {
    orientation = "portrait";
  }

  if (width === height) {
    orientation = "square";
  }

  return {
    width,

    height,

    aspectRatio: width / height,

    orientation,

    mimeType: file.type,

    size: file.size,

    lastModified: file.lastModified,
  };
}

export async function generateThumbnail(
  file: File,
  options: ThumbnailOptions = {}
): Promise<Blob> {
  const {
    maxWidth = 500,
    maxHeight = 500,
    quality = 0.9,
    type = "image/jpeg",
  } = options;

  const bitmap = await createImageBitmap(file);

  let width = bitmap.width;

  let height = bitmap.height;

  const ratio = Math.min(
    maxWidth / width,
    maxHeight / height,
    1
  );

  width = Math.round(width * ratio);

  height = Math.round(height * ratio);

  const canvas =
    document.createElement("canvas");

  canvas.width = width;

  canvas.height = height;

  const context =
    canvas.getContext("2d");

  if (!context) {
    bitmap.close();

    throw new Error(
      "Canvas context unavailable."
    );
  }

  context.drawImage(
    bitmap,
    0,
    0,
    width,
    height
  );

  bitmap.close();

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(
            new Error(
              "Thumbnail generation failed."
            )
          );

          return;
        }

        resolve(blob);
      },
      type,
      quality
    );
  });
}

export async function getImageDimensions(
  file: File
) {
  const bitmap =
    await createImageBitmap(file);

  const dimensions = {
    width: bitmap.width,

    height: bitmap.height,
  };

  bitmap.close();

  return dimensions;
}

export async function isImageLandscape(
  file: File
) {
  const {
    width,
    height,
  } = await getImageDimensions(file);

  return width > height;
}

export async function isImagePortrait(
  file: File
) {
  const {
    width,
    height,
  } = await getImageDimensions(file);

  return height > width;
}

export async function isSquareImage(
  file: File
) {
  const {
    width,
    height,
  } = await getImageDimensions(file);

  return width === height;
}