export type UploadStatus =
  | "queued"
  | "uploading"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface UploadProgress {

  progress: number;

  transferredBytes: number;

  totalBytes: number;

}

export interface UploadItem {

  id: string;

  file: File;

  status: UploadStatus;

  progress: number;

  transferredBytes: number;

  totalBytes: number;

  assetId?: string;

  storagePath?: string;

  previewUrl?: string;

thumbnailUrl?: string;

  processingStatus?: string;

  error?: string;

}

export interface UploadManagerState {

  items: UploadItem[];

  isUploading: boolean;

  overallProgress: number;

}