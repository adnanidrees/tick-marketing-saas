import { NextResponse } from "next/server";
import { destroySession, getSessionToken, clearSessionCookie, clearWorkspaceCookie } from "@/lib/auth";

export async function POST() {
  const token = getSessionToken();
  if (token) await destroySession(token);

  clearSessionCookie();
  clearWorkspaceCookie();

  return NextResponse.redirect(new URL("/login", process.env.APP_URL || "http://localhost:3000"));
}
