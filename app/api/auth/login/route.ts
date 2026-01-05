// app/api/auth/login/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import {
  jsonError,
  verifyPassword,
  createSession,
  setSessionCookie,
} from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const email = String(form.get("email") || "").trim().toLowerCase();
    const password = String(form.get("password") || "");

    if (!email || !password) return jsonError("Email and password are required", 400);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return jsonError("Invalid credentials", 401);

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) return jsonError("Invalid credentials", 401);

    const { token, expiresAt } = await createSession(user.id);

    // IMPORTANT: cookie must be set on the SAME response object returned
    const res = NextResponse.redirect(new URL("/app", req.url));
    res.cookies.set("tick_session", token, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      expires: expiresAt,
    });

    return res;
  } catch (err: any) {
    return jsonError(err?.message || "Server error", 500);
  }
}
