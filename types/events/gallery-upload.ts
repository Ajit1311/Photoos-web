export type UploadStatus =
  | "queued"
  | "uploading"
  | "paused"
  | "uploaded"
  | "failed"
  | "cancelled";

export interface UploadQueueItem {
  id: string;

  file: File;

  progress: number;

  status: UploadStatus;

  createdAt: Date;

  startedAt?: Date;

  completedAt?: Date;

  error?: string;
}

export interface UploadQueueStats {
  total: number;

  queued: number;

  uploading: number;

  paused: number;

  uploaded: number;

  failed: number;

  cancelled: number;

  progress: number;

  totalBytes: number;

  uploadedBytes: number;
}

export interface UploadValidationResult {
  valid: boolean;

  message?: string;
}

export interface UploadManagerOptions {
  concurrentUploads?: number;

  retryAttempts?: number;

  autoStart?: boolean;
}

export interface UploadProgressEvent {
  uploadId: string;

  progress: number;

  bytesTransferred: number;

  totalBytes: number;

  speed?: number;

  remainingTime?: number;
}

export interface UploadResult {
  uploadId: string;

  success: boolean;

  error?: string;

  storagePath?: string;
}