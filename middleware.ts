import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // 1. Redirect legacy /admin routes to /ops-console
  if (pathname === "/admin" || pathname === "/admin/login") {
    return NextResponse.redirect(new URL("/ops-console/dashboard", req.url), 307);
  }

  if (pathname.startsWith("/admin/")) {
    const target = pathname.replace(/^\/admin/, "/ops-console");
    return NextResponse.redirect(new URL(target, req.url), 307);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
