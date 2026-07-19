export interface CompleteUploadRequest {
  assetId: string;
  storageBucket: string;
  storagePath: string;
  storageFilename: string;
  mimeType: string;
  fileSize: number;
  checksum?: string;
  width?: number;
  height?: number;
  durationSeconds?: number;
}

export interface CompleteUploadResponse {
  id: string;
  storage_bucket: string;
  storage_path: string;
  processing_status: string;
}