import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 30;

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
  "Access-Control-Allow-Methods": "GET, HEAD, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Range",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// GET /api/corporate/photos/file?path=corporate/...
// Serves image binaries directly from Supabase Storage with CORS & caching.
// Fixes broken thumbnails on localhost, private buckets, and mobile browsers.
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const path = searchParams.get("path");

    if (!path) {
      return new NextResponse("Missing storage path parameter.", {
        status: 400,
        headers: corsHeaders,
      });
    }

    const supabase = getServerSupabase();

    const { data: fileBlob, error: downloadError } = await supabase.storage
      .from("assets")
      .download(path);

    if (downloadError || !fileBlob) {
      console.warn("[CorporatePhotoFile] Download notice:", path, downloadError);
      return new NextResponse("Photo file not found.", {
        status: 404,
        headers: corsHeaders,
      });
    }

    const arrayBuffer = await fileBlob.arrayBuffer();
    const contentType = fileBlob.type || "image/jpeg";

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err: any) {
    console.error("[CorporatePhotoFile] Server error:", err);
    return new NextResponse("Failed to stream image file.", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

