import { supabase } from '../supabase/client';

/**
 * १. क्लायंट गॅलरीमध्ये फोटो सिलेक्ट/अनसिलेक्ट करणे (२०० फोटो लिमिट व्हॅलिडेशनसह)
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

  // डेटाबेसमधून जो रिस्पॉन्स येईल (उदा. 'Photo marked as favorite' किंवा 'Selection limit of 200 photos reached')
  return { success: true, message: data as string };
}

/**
 * २. AI फेस रेकग्निशनद्वारे सर्च करण्यासाठी सेल्फीचा युनिक टोकन रजिस्टर करणे
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

  return data as string; // रिटर्नमध्ये फेस प्रोफाइल आयडी (UUID) मिळेल
}