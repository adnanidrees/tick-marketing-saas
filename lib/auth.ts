import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/db";

const COOKIE_NAME = "tick_session";
const WS_COOKIE = "tick_ws";

function mustGetSecret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 16) throw new Error("SESSION_SECRET missing/too short");
  return s;
}

export async function createSession(userId: string) {
  mustGetSecret();
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14); // 14 days
  await prisma.session.create({ data: { token, userId, expiresAt } });
  return { token, expiresAt };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export function setSessionCookie(token: string, expiresAt: Date) {
  const secure = process.env.NODE_ENV === "production";
  cookies().set(COOKIE_NAME, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    expires: expiresAt,
    path: "/"
  });
}

export function clearSessionCookie() {
  cookies().set(COOKIE_NAME, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export function setWorkspaceCookie(workspaceId: string) {
  const secure = process.env.NODE_ENV === "production";
  cookies().set(WS_COOKIE, workspaceId, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/"
  });
}

export function clearWorkspaceCookie() {
  cookies().set(WS_COOKIE, "", { httpOnly: true, expires: new Date(0), path: "/" });
}

export function getSessionToken() {
  return cookies().get(COOKIE_NAME)?.value || null;
}

export function getWorkspaceIdFromCookie() {
  return cookies().get(WS_COOKIE)?.value || null;
}

export async function requireAuth() {
  const token = getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true }
  });
  if (!session) return null;
  if (session.expiresAt.getTime() < Date.now()) {
    await destroySession(token);
    return null;
  }
  return session.user;
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function requireWorkspaceContext() {
  const user = await requireAuth();
  if (!user) return null;

  const workspaceId = getWorkspaceIdFromCookie();
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { workspace: true }
  });

  const selected =
    (workspaceId && memberships.find((m) => m.workspaceId === workspaceId)) || memberships[0] || null;

  return { user, memberships, selectedMembership: selected };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}
