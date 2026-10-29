import { NextRequest, NextResponse } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect all /admin routes behind stealth gate
  if (pathname.startsWith("/admin")) {
    const opsSession = req.cookies.get("photoos_ops_session")?.value;

    // Disallow public access to /admin/login directly (returns 404 stealth)
    if (pathname === "/admin/login") {
      const url = req.nextUrl.clone();
      url.pathname = "/_not-found";
      return NextResponse.rewrite(url);
    }

    // If no verified admin session cookie, return 404
    if (!opsSession) {
      const url = req.nextUrl.clone();
      url.pathname = "/_not-found";
      return NextResponse.rewrite(url);
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};

