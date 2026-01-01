import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ✅ Always allow Next internal + API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon.ico")
  ) {
    return NextResponse.next();
  }

  // ...your existing auth logic below (redirect to /login etc.)
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};



export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApp = pathname.startsWith("/app");
  const isApi = pathname.startsWith("/api");
  const isPublic = pathname.startsWith("/login") || pathname === "/" || pathname.startsWith("/_next");

  if (!isApp && !isApi) return NextResponse.next();
  if (isPublic) return NextResponse.next();

  const token = req.cookies.get("tick_session")?.value;

  // Only a shallow check in middleware. Server components/API routes verify session properly.
  if (!token && !pathname.startsWith("/api/public")) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*", "/api/:path*"]
};
