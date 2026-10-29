import { supabase } from '../supabase/client';

/**
 * 1. Toggle photo selection in client gallery)
 */
export async function toggleGalleryPhotoFavorite(
  assetId: string, 
  galleryId: string
): Promise<{ success: boolean; message: string }> {
  const { data, error } = await supabase.rpc('toggle_gallery_photo_favorite', {
    p_asset_id: assetId,
    p_gallery_id: galleryId
  });

  if (error) {
    console.error('Error toggling photo favorite:', error);
    return { success: false, message: error.message };
  }

  // Database response messageon limit of 200 photos reached')
  return { success: true, message: data as string };
}

/**
 * 2. Register selfie vector token for AI face search
 */
export async function registerAiDetectedFace(params: {
  galleryId: string;
  studioId: string;
  cropUrl: string;
  token: string;
}): Promise<string | null> {
  const { data, error } = await supabase.rpc('register_ai_detected_face', {
    p_gallery_id: params.galleryId,
    p_studio_id: params.studioId,
    p_crop_url: params.cropUrl,
    p_token: params.token
  });

  if (error) {
    console.error('Error registering AI face profile:', error);
    return null;
  }

  return data as string; // Returns face profile UUID
}