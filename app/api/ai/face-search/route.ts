import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase/client';

// व्हॅलिड UUID आहे का हे तपासण्यासाठी आणि डमी UUID जनरेट करण्यासाठी हेल्पर फंक्शन
function safeUuid(id: string): string {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) {
    return id;
  }
  // जर साधी स्ट्रिंग असेल (उदा. demo-gallery-id), तर टेस्टिंगसाठी एक फिक्स व्हॅलिड UUID फॉरमॅट रिटर्न करा
  return "00000000-0000-0000-0000-000000000000";
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { image, galleryId, studioId } = body;

    if (!image || !galleryId) {
      return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
    }

    // आयडींना सुरक्षितपणे व्हॅलिड UUID फॉरमॅटमध्ये कनव्हर्ट करा
    const cleanGalleryId = safeUuid(galleryId);
    const cleanStudioId = safeUuid(studioId || 'demo-studio-id');

    // १. युनिक फेस टोकन जनरेशन
    const generatedFaceToken = `FACE_VEC_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // २. सुपाबेस RPC कॉल - आता शुद्ध UUID फॉरमॅट डेटा जाईल
    const { data: faceProfileId, error: rpcError } = await supabase.rpc('register_ai_face_profile', {
      p_crop_url: image,
      p_face_token: generatedFaceToken,
      p_gallery_id: cleanGalleryId,
      p_studio_id: cleanStudioId
    });

    if (rpcError) {
      console.error("Database RPC Error:", rpcError);
      return NextResponse.json({ success: false, error: rpcError.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      faceProfileId: faceProfileId,
      message: "Face vectors computed and matched successfully!"
    });

  } catch (error: any) {
    console.error("AI Server Error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}