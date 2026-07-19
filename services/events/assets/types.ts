export interface CreateAssetRequest {
  albumId: string;

  assetType: string;

  originalFilename: string;

  storageFilename: string;

  storageBucket: string;

  storagePath: string;

  mimeType: string;

  fileSize: number;

  title?: string;

  description?: string;

  width?: number;

  height?: number;

  durationSeconds?: number;

  checksum?: string;

  metadata?: Record<string, unknown>;
}

export interface CreatedAsset {
  id: string;

  album_id: string;

  studio_id: string;

  uploaded_by: string;

  asset_type: string;

  storage_bucket: string;

  storage_path: string;

  storage_filename: string;

  original_filename: string;

  mime_type: string;

  file_size: number;

  processing_status?: string;

  status?: string;

  created_at?: string;
}

export interface CreateAssetResponse {
  success: boolean;

  asset?: CreatedAsset;

  error?: string;
}