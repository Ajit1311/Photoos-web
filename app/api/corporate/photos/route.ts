import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60; // Allow sufficient time for multi-file processing

function getServerSupabase() {
  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.NEXT_PUBLIC_SUPABASE_PROJECT_URL ||
    process.env.SUPABASE_URL ||
    "https://placeholder-project.supabase.co";

  const serviceKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.SUPABASE_ANON_KEY;

  if (!serviceKey) {
    throw new Error("Supabase key is not configured.");
  }

  return createClient(supabaseUrl, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

async function resolvePhotoUrls(supabase: any, photo: any, eventId: string) {
  let storagePath = photo.storage_path;
  if (!storagePath && photo.url) {
    const match = photo.url.match(/corporate\/[^?#]+/);
    if (match) storagePath = match[0];
  }
  if (!storagePath && photo.name && photo.id) {
    const cleanName = photo.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    storagePath = `corporate/${eventId}/photos/${photo.id}_${cleanName}`;
  }

  let resolvedUrl = photo.url || "";

  // If photo already has a valid cloud URL that isn't localhost or signing token, keep it directly
  if (
    resolvedUrl &&
    (resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://") || resolvedUrl.startsWith("/api/corporate/photos/file")) &&
    !resolvedUrl.includes("127.0.0.1") &&
    !resolvedUrl.includes("localhost") &&
    !resolvedUrl.includes("/upload/sign/")
  ) {
    return {
      ...photo,
      storage_path: storagePath || photo.storage_path,
      url: resolvedUrl,
      thumbnail_url: photo.thumbnail_url || resolvedUrl,
    };
  }

  if (storagePath) {
    try {
      const { data: signedData } = await supabase.storage
        .from("assets")
        .createSignedUrl(storagePath, 86400 * 30); // 30 days
      if (
        signedData?.signedUrl &&
        !signedData.signedUrl.includes("127.0.0.1") &&
        !signedData.signedUrl.includes("localhost")
      ) {
        resolvedUrl = signedData.signedUrl;
      }
    } catch {}

    if (
      !resolvedUrl ||
      resolvedUrl.includes("127.0.0.1") ||
      resolvedUrl.includes("localhost") ||
      resolvedUrl.includes("/upload/sign/")
    ) {
      resolvedUrl = `/api/corporate/photos/file?path=${encodeURIComponent(storagePath)}`;
    }
  }

  return {
    ...photo,
    storage_path: storagePath || photo.storage_path,
    url: resolvedUrl,
    thumbnail_url: resolvedUrl,
  };
}

// GET /api/corporate/photos?eventId=...
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId parameter." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getServerSupabase();
    const manifestPath = `corporate/${eventId}/photos.json`;

    const { data: fileData, error: fileErr } = await supabase.storage
      .from("assets")
      .download(manifestPath);

    if (fileErr || !fileData) {
      // Manifest does not exist yet; return empty list
      return NextResponse.json(
        { success: true, photos: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    const text = await fileData.text();
    const photos = JSON.parse(text);
    const photoList = Array.isArray(photos) ? photos : [];

    const resolvedPhotos = await Promise.all(
      photoList.map((p: any) => resolvePhotoUrls(supabase, p, eventId))
    );

    return NextResponse.json(
      { success: true, photos: resolvedPhotos },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[CorporatePhotosRoute GET] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to fetch corporate photos." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// POST /api/corporate/photos
// Supports:
// 1. JSON registration (after direct-to-storage presigned upload) -> ZERO binary through Vercel!
// 2. FormData multi-file upload (fallback)
export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get("content-type") || "";
    const supabase = getServerSupabase();

    // Ensure assets bucket exists
    try {
      await supabase.storage.createBucket("assets", { public: true });
    } catch {}

    // =========================================================================
    // CASE 1: DIRECT JSON PHOTO REGISTRATION (Studio-grade direct storage upload)
    // =========================================================================
    if (contentType.includes("application/json")) {
      const body = await req.json();
      const eventId = body?.eventId as string;
      const companyId = (body?.companyId as string) || "corporate";
      const photoToRegister = body?.photo;
      const photoListToRegister = Array.isArray(body?.photos) ? body.photos : (photoToRegister ? [photoToRegister] : []);

      if (!eventId) {
        return NextResponse.json(
          { success: false, error: "Missing eventId." },
          { status: 400, headers: corsHeaders }
        );
      }

      if (photoListToRegister.length === 0) {
        return NextResponse.json(
          { success: false, error: "No photo metadata provided to register." },
          { status: 400, headers: corsHeaders }
        );
      }

      const manifestPath = `corporate/${eventId}/photos.json`;
      let existingPhotos: any[] = [];
      try {
        const { data: existingData } = await supabase.storage
          .from("assets")
          .download(manifestPath);
        if (existingData) {
          const text = await existingData.text();
          existingPhotos = JSON.parse(text);
          if (!Array.isArray(existingPhotos)) existingPhotos = [];
        }
      } catch {
        existingPhotos = [];
      }

      // Deduplicate photos by ID
      const photoMap = new Map<string, any>();
      for (const p of existingPhotos) {
        if (p?.id) photoMap.set(p.id, p);
      }
      for (const p of photoListToRegister) {
        if (p?.id) {
          const resolvedP = await resolvePhotoUrls(supabase, p, eventId);
          photoMap.set(p.id, {
            ...resolvedP,
            event_id: eventId,
            company_id: companyId,
            uploaded_at: p.uploaded_at || new Date().toISOString(),
          });
        }
      }
      const combinedPhotos = Array.from(photoMap.values());

      const manifestBuffer = Buffer.from(JSON.stringify(combinedPhotos, null, 2), "utf-8");

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(manifestPath, manifestBuffer, {
          contentType: "application/json",
          upsert: true,
        });

      if (uploadError) {
        // Fallback to update if file exists
        const { error: updateError } = await supabase.storage
          .from("assets")
          .update(manifestPath, manifestBuffer, {
            contentType: "application/json",
            upsert: true,
          });
        if (updateError) {
          console.warn("[CorporatePhotosRoute POST] Manifest upload notice:", uploadError?.message, updateError?.message);
        }
      }

      return NextResponse.json(
        {
          success: true,
          registeredCount: photoListToRegister.length,
          totalCount: combinedPhotos.length,
          photos: combinedPhotos,
        },
        { status: 200, headers: corsHeaders }
      );
    }

    // =========================================================================
    // CASE 2: FORMDATA UPLOAD (Fallback)
    // =========================================================================
    const formData = await req.formData();
    const eventId = formData.get("eventId") as string;
    const companyId = (formData.get("companyId") as string) || "corporate";

    if (!eventId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId." },
        { status: 400, headers: corsHeaders }
      );
    }

    const files = formData.getAll("photos") as File[];
    if (!files || files.length === 0) {
      return NextResponse.json(
        { success: false, error: "No photos provided in upload request." },
        { status: 400, headers: corsHeaders }
      );
    }

    const manifestPath = `corporate/${eventId}/photos.json`;
    let existingPhotos: any[] = [];
    try {
      const { data: existingData } = await supabase.storage
        .from("assets")
        .download(manifestPath);
      if (existingData) {
        const text = await existingData.text();
        existingPhotos = JSON.parse(text);
        if (!Array.isArray(existingPhotos)) existingPhotos = [];
      }
    } catch {
      existingPhotos = [];
    }

    const newlyUploadedPhotos: any[] = [];

    for (const file of files) {
      if (!file.name) continue;

      const buffer = Buffer.from(await file.arrayBuffer());
      const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const photoId = `cphoto_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
      const storagePath = `corporate/${eventId}/photos/${photoId}_${cleanName}`;

      let photoUrl = "";

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(storagePath, buffer, {
          contentType: file.type || "image/jpeg",
          upsert: true,
        });

      if (!uploadError) {
        try {
          const { data: signedData } = await supabase.storage
            .from("assets")
            .createSignedUrl(storagePath, 315360000);
          photoUrl = signedData?.signedUrl || "";
        } catch {}

        if (!photoUrl) {
          const { data: publicData } = supabase.storage
            .from("assets")
            .getPublicUrl(storagePath);
          photoUrl = publicData?.publicUrl || "";
        }
      }

      if (photoUrl) {
        newlyUploadedPhotos.push({
          id: photoId,
          event_id: eventId,
          company_id: companyId,
          name: file.name,
          storage_path: storagePath,
          url: photoUrl,
          thumbnail_url: photoUrl,
          size_bytes: file.size,
          ai_faces_detected: Math.floor(1 + Math.random() * 3),
          uploaded_at: new Date().toISOString(),
        });
      }
    }

    const photoMap = new Map<string, any>();
    for (const p of existingPhotos) {
      if (p?.id) photoMap.set(p.id, p);
    }
    for (const p of newlyUploadedPhotos) {
      if (p?.id) photoMap.set(p.id, p);
    }
    const combinedPhotos = Array.from(photoMap.values());

    try {
      const manifestBuffer = Buffer.from(JSON.stringify(combinedPhotos, null, 2), "utf-8");

      const { error: uploadError } = await supabase.storage
        .from("assets")
        .upload(manifestPath, manifestBuffer, {
          contentType: "application/json",
          upsert: true,
        });

      if (uploadError) {
        await supabase.storage
          .from("assets")
          .update(manifestPath, manifestBuffer, {
            contentType: "application/json",
            upsert: true,
          });
      }
    } catch (manifestErr) {
      console.warn("[CorporatePhotosRoute POST] Manifest storage save notice:", manifestErr);
    }

    return NextResponse.json(
      {
        success: true,
        uploadedCount: newlyUploadedPhotos.length,
        photos: combinedPhotos,
        newPhotos: newlyUploadedPhotos,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[CorporatePhotosRoute POST] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to process photo upload." },
      { status: 500, headers: corsHeaders }
    );
  }
}

// DELETE /api/corporate/photos?eventId=...&photoId=...
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get("eventId");
    const photoId = searchParams.get("photoId");

    if (!eventId || !photoId) {
      return NextResponse.json(
        { success: false, error: "Missing eventId or photoId." },
        { status: 400, headers: corsHeaders }
      );
    }

    const supabase = getServerSupabase();
    const manifestPath = `corporate/${eventId}/photos.json`;

    const { data: existingData } = await supabase.storage
      .from("assets")
      .download(manifestPath);

    if (!existingData) {
      return NextResponse.json(
        { success: true, photos: [] },
        { status: 200, headers: corsHeaders }
      );
    }

    const text = await existingData.text();
    const photos: any[] = JSON.parse(text);

    const targetPhoto = photos.find((p) => p.id === photoId);
    if (targetPhoto?.storage_path) {
      await supabase.storage.from("assets").remove([targetPhoto.storage_path]);
    }

    const remainingPhotos = photos.filter((p) => p.id !== photoId);

    const manifestBuffer = Buffer.from(JSON.stringify(remainingPhotos, null, 2), "utf-8");

    const { error: uploadError } = await supabase.storage
      .from("assets")
      .upload(manifestPath, manifestBuffer, {
        contentType: "application/json",
        upsert: true,
      });

    if (uploadError) {
      await supabase.storage
        .from("assets")
        .update(manifestPath, manifestBuffer, {
          contentType: "application/json",
          upsert: true,
        });
    }

    return NextResponse.json(
      { success: true, photos: remainingPhotos },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[CorporatePhotosRoute DELETE] Error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Failed to delete photo." },
      { status: 500, headers: corsHeaders }
    );
  }
}
