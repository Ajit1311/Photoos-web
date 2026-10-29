import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return new NextResponse("Missing url parameter", { status: 400 });
  }

  try {
    const parsed = new URL(targetUrl);
    // Security: Only allow http and https protocols
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return new NextResponse("Invalid protocol", { status: 400 });
    }

    const host = parsed.hostname.toLowerCase();

    // Block cloud metadata & internal loopback attacks (SSRF Prevention)
    if (
      host === "169.254.169.254" ||
      host === "metadata.google.internal" ||
      (process.env.NODE_ENV === "production" && (host === "localhost" || host === "127.0.0.1" || host.startsWith("10.") || host.startsWith("192.168.") || host.startsWith("172.")))
    ) {
      return new NextResponse("Access to internal network destinations is forbidden", { status: 403 });
    }

    // Whitelist permitted image storage domains
    const isAllowedHost =
      host.endsWith(".supabase.co") ||
      host.endsWith(".r2.cloudflarestorage.com") ||
      host === "photoos-e7ae5.firebasestorage.app" ||
      host.endsWith(".googleusercontent.com") ||
      host === "images.unsplash.com" ||
      (process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1"));

    if (!isAllowedHost) {
      return new NextResponse("Forbidden: Hostname is not allowed for proxying", { status: 403 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        Accept: "image/*",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, {
        status: response.status,
      });
    }

    const contentType = response.headers.get("content-type") || "image/jpeg";
    const buffer = await response.arrayBuffer();

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
      },
    });
  } catch (err: any) {
    console.error("[ImageProxy] Error proxying image:", err);
    return new NextResponse("Failed to proxy image", { status: 500 });
  }
}

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
