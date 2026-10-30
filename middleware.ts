import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // 1. Corporate Subdomain detection (corp.photoos.in, corporate.photoos.in, enterprise.photoos.in)
  const isCorporateSubdomain =
    hostname.startsWith("corp.") ||
    hostname.startsWith("corporate.") ||
    hostname.startsWith("enterprise.");

  if (isCorporateSubdomain) {
    // If not already accessing /corporate, /api, /gallery, or /live, rewrite path internally
    if (
      !pathname.startsWith("/corporate") &&
      !pathname.startsWith("/api") &&
      !pathname.startsWith("/live") &&
      !pathname.startsWith("/gallery")
    ) {
      const targetPath = pathname === "/" ? "/corporate" : `/corporate${pathname}`;
      const url = req.nextUrl.clone();
      url.pathname = targetPath;
      return NextResponse.rewrite(url);
    }
  }

  // 2. Redirect legacy /admin routes to /ops-console
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
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
