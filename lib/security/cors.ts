import { NextResponse } from "next/server";
import { isAllowedOrigin } from "@/lib/supabase/config";

export function getCorsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get("origin");
  const headers: Record<string, string> = {
    "Access-Control-Allow-Methods": "GET, POST, PUT, PATCH, DELETE, OPTIONS",
    "Access-Control-Allow-Headers":
      "Content-Type, Authorization, X-Requested-With, x-studio-id, x-client-info, x-csrf-token",
    "Access-Control-Max-Age": "86400",
  };

  if (origin && isAllowedOrigin(origin)) {
    headers["Access-Control-Allow-Origin"] = origin;
    headers["Access-Control-Allow-Credentials"] = "true";
  } else {
    // Default to configured app url
    const defaultOrigin = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    headers["Access-Control-Allow-Origin"] = defaultOrigin;
    headers["Access-Control-Allow-Credentials"] = "true";
  }

  return headers;
}

export function handleOptionsCors(request: Request): NextResponse {
  return new NextResponse(null, {
    status: 204,
    headers: getCorsHeaders(request),
  });
}

