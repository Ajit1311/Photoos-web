export interface UploadTransportRequest<T = void> {
  file: File;
  upload: (signal: AbortSignal) => Promise<T>;
  signal?: AbortSignal;
}

export interface UploadTransportCallbacks {
  onStart?: () => void;
  onProgress?: (
    progress: number,
    uploadedBytes: number,
    totalBytes: number,
  ) => void;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  onCancelled?: () => void;
}

export class UploadTransport {
  private cancelled = false;

  cancel() {
    this.cancelled = true;
  }

  async execute<T>(
    request: UploadTransportRequest<T>,
    callbacks: UploadTransportCallbacks = {},
  ): Promise<T | undefined> {
    const controller = new AbortController();
    const signal = request.signal ?? controller.signal;

    this.cancelled = false;

    callbacks.onStart?.();

    try {
      callbacks.onProgress?.(
        5,
        0,
        request.file.size,
      );

      if (this.cancelled) {
        callbacks.onCancelled?.();
        return undefined;
      }

      // upload() ला आता 'signal' पास केला आहे
      const result = await request.upload(signal);

      if (this.cancelled) {
        callbacks.onCancelled?.();
        return undefined;
      }

      callbacks.onProgress?.(
        100,
        request.file.size,
        request.file.size,
      );

      callbacks.onSuccess?.();

      return result;
    } catch (error) {
      // AbortError साठी स्पेशल हँडलिंग
      if (error instanceof DOMException && error.name === "AbortError") {
        callbacks?.onCancelled?.();
        return undefined; // return सोबत undefined दिला आहे जेणेकरून Promise return टाईप मॅच होईल
      }

      // जनरल एरर हँडलिंग
      callbacks?.onError?.(
        error instanceof Error
          ? error
          : new Error("Upload failed."),
      );

      return undefined;
    }
  }
}