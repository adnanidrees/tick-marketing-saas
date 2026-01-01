import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware policy:
 * - Only protect /app routes (UI).
 * - Never redirect /api routes from middleware. API routes should return 401/403 from the handler layer.
 */
export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  // Protect app shell
  if (pathname.startsWith("/app")) {
    const token = req.cookies.get("tick_session")?.value;

    if (!token) {
      const url = req.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname + (search ?? ""));
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
