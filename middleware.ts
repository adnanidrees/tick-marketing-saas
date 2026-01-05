import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Auth gate:
 * - Only protect /app/*
 * - Never intercept /api/* (so login POSTs and API calls work)
 */
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Always allow Next internals + API routes
  if (
    pathname.startsWith("/api") ||
    pathname.startsWith("/_next") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  // Only /app/* is protected by matcher, but keep this as a safety check
  if (!pathname.startsWith("/app")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("tick_session")?.value;

  if (!token) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/app/:path*"],
};
