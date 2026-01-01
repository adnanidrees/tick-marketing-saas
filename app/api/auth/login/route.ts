import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { createSession, setSessionCookie, setWorkspaceCookie, jsonError, verifyPassword } from "@/lib/auth";
import { loginSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const form = await req.formData();
  const raw = { email: String(form.get("email") || ""), password: String(form.get("password") || "") };
  const next = String(form.get("next") || "/app");

  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return jsonError("Invalid email/password format", 400);

  const user = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (!user) return jsonError("Invalid credentials", 401);

  const ok = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!ok) return jsonError("Invalid credentials", 401);

  const session = await createSession(user.id);
  setSessionCookie(session.token, session.expiresAt);

  // auto-set workspace if only one membership
  const memberships = await prisma.membership.findMany({ where: { userId: user.id } });
  if (memberships.length === 1) setWorkspaceCookie(memberships[0].workspaceId);

  const res = NextResponse.redirect(new URL(next, process.env.APP_URL || "http://localhost:3000"));
  return res;
}
