export interface UploadChunk {
  index: number;

  start: number;

  end: number;

  size: number;

  blob: Blob;
}

export interface ChunkProgress {
  chunkIndex: number;

  uploadedChunks: number;

  totalChunks: number;

  uploadedBytes: number;

  totalBytes: number;

  progress: number;
}

export interface ChunkUploadOptions {
  chunkSize?: number;
}

export const DEFAULT_CHUNK_SIZE =
  5 * 1024 * 1024; // 5 MB

export function createChunks(
  file: File,
  options: ChunkUploadOptions = {}
): UploadChunk[] {
  const chunkSize =
    options.chunkSize ??
    DEFAULT_CHUNK_SIZE;

  const chunks: UploadChunk[] = [];

  let offset = 0;

  let index = 0;

  while (offset < file.size) {
    const end = Math.min(
      offset + chunkSize,
      file.size
    );

    chunks.push({
      index,

      start: offset,

      end,

      size: end - offset,

      blob: file.slice(offset, end),
    });

    offset = end;

    index++;
  }

  return chunks;
}

export async function uploadChunks(
  file: File,
  uploader: (
    chunk: UploadChunk
  ) => Promise<void>,
  onProgress?: (
    progress: ChunkProgress
  ) => void,
  options: ChunkUploadOptions = {}
): Promise<void> {
  const chunks = createChunks(
    file,
    options
  );

  let uploadedBytes = 0;

  for (const chunk of chunks) {
    await uploader(chunk);

    uploadedBytes += chunk.size;

    onProgress?.({
      chunkIndex: chunk.index,

      uploadedChunks:
        chunk.index + 1,

      totalChunks:
        chunks.length,

      uploadedBytes,

      totalBytes: file.size,

      progress: Math.round(
        (uploadedBytes /
          file.size) *
          100
      ),
    });
  }
}

export function calculateChunkCount(
  fileSize: number,
  chunkSize: number =
    DEFAULT_CHUNK_SIZE
) {
  return Math.ceil(
    fileSize / chunkSize
  );
}

export function getChunk(
  file: File,
  index: number,
  chunkSize: number =
    DEFAULT_CHUNK_SIZE
): UploadChunk | null {
  const start =
    index * chunkSize;

  if (start >= file.size) {
    return null;
  }

  const end = Math.min(
    start + chunkSize,
    file.size
  );

  return {
    index,

    start,

    end,

    size: end - start,

    blob: file.slice(start, end),
  };
}