import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const maxDuration = 60;

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
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    const path = formData.get("path") as string | null;
    const bucket = (formData.get("bucket") as string | null) || "assets";

    if (!file || !path) {
      return NextResponse.json(
        { success: false, error: "File and path are required." },
        { status: 400, headers: corsHeaders }
      );
    }

    // Anti-Hacker Path Traversal & Injection Protection
    if (path.includes("..") || path.startsWith("/") || path.startsWith("\\") || path.includes("\0")) {
      return NextResponse.json(
        { success: false, error: "Access Denied: Invalid storage path traversal detected." },
        { status: 403, headers: corsHeaders }
      );
    }

    const supabaseAdmin = getServerSupabase();

    // Ensure bucket exists
    try {
      await supabaseAdmin.storage.createBucket(bucket, { public: true });
    } catch {}

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .upload(path, buffer, {
        contentType: file.type || "application/octet-stream",
        upsert: true,
      });

    if (error) {
      console.error("[/api/storage/upload] Upload error:", error);
      return NextResponse.json(
        { success: false, error: error.message },
        { status: 500, headers: corsHeaders }
      );
    }

    return NextResponse.json(
      {
        success: true,
        path: data.path,
        fullPath: data.fullPath,
      },
      { status: 200, headers: corsHeaders }
    );
  } catch (err: any) {
    console.error("[/api/storage/upload] Server error:", err);
    return NextResponse.json(
      { success: false, error: err?.message || "Storage upload failed." },
      { status: 500, headers: corsHeaders }
    );
  }
}

