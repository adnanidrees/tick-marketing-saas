// lib/auth.ts
import { NextResponse } from "next/server";

export function setSessionCookie(res: NextResponse, token: string, expiresAt: Date) {
  res.cookies.set("tick_session", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function setWorkspaceCookie(res: NextResponse, workspaceId: string) {
  res.cookies.set("tick_workspace", workspaceId, {
    httpOnly: false,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
}
