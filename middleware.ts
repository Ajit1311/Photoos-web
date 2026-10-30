import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const hostname = req.headers.get("host") || "";

  // 1. Unify login: If someone hits /corporate/login, redirect to /login?mode=corporate
  if (pathname === "/corporate/login") {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("mode", "corporate");
    return NextResponse.redirect(url, 307);
  }

  // 2. Corporate Subdomain detection (corp.photoos.in, corporate.photoos.in, enterprise.photoos.in)
  const isCorporateSubdomain =
    hostname.startsWith("corp.") ||
    hostname.startsWith("corporate.") ||
    hostname.startsWith("enterprise.");

  if (isCorporateSubdomain) {
    // If accessing root, route to corporate dashboard or events
    if (pathname === "/") {
      const url = req.nextUrl.clone();
      url.pathname = "/corporate/dashboard";
      return NextResponse.rewrite(url);
    }

    // Never rewrite static assets, models, auth, legal, or gallery routes
    const isExempt =
      pathname.startsWith("/corporate") ||
      pathname.startsWith("/login") ||
      pathname.startsWith("/auth") ||
      pathname.startsWith("/legal-compliance") ||
      pathname.startsWith("/api") ||
      pathname.startsWith("/live") ||
      pathname.startsWith("/gallery") ||
      pathname.startsWith("/models") ||
      pathname.includes(".");

    if (!isExempt) {
      const targetPath = `/corporate${pathname}`;
      const url = req.nextUrl.clone();
      url.pathname = targetPath;
      return NextResponse.rewrite(url);
    }
  }

  // 3. Redirect legacy /admin routes to /ops-console
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
    "/((?!_next/static|_next/image|models|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|json|bin|ico)$).*)",
  ],
};
