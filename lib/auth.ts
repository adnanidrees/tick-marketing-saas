// lib/auth.ts
import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { redirect } from "next/navigation";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "tick_session";
const WORKSPACE_COOKIE = "tick_workspace";

/** Standard JSON error helper */
export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

/** Password helpers */
export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}
export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

/** Cookie helpers */
export function setSessionCookie(token: string, expiresAt: Date) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export function setWorkspaceCookie(workspaceId: string) {
  cookies().set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    // workspace cookie long-lived
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}

export function clearWorkspaceCookie() {
  cookies().set(WORKSPACE_COOKIE, "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export function getSessionToken() {
  return cookies().get(SESSION_COOKIE)?.value || null;
}

export function getWorkspaceIdFromCookie() {
  return cookies().get(WORKSPACE_COOKIE)?.value || null;
}

/** Session helpers (Prisma) */
export async function createSession(userId: string) {
  const token = crypto.randomBytes(48).toString("hex");
  const days = Number(process.env.SESSION_DAYS || 7);
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000);

  // IMPORTANT:
  // Your Prisma model MUST have a "session" (or "Session") with fields:
  // token (unique), userId, expiresAt
  const session = await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return { token: session.token, expiresAt: session.expiresAt };
}

export async function destroySession(token: string) {
  // safe delete
  await prisma.session.deleteMany({ where: { token } });
}

/** Require user by session cookie */
export async function requireAuth() {
  const token = getSessionToken();
  if (!token) {
    // for API callers:
    // return null and let caller handle, but to match your usage we throw:
    throw new Error("UNAUTHORIZED");
  }

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) throw new Error("UNAUTHORIZED");
  if (session.expiresAt.getTime() < Date.now()) {
    // expired session cleanup
    await prisma.session.deleteMany({ where: { token } });
    throw new Error("UNAUTHORIZED");
  }

  return { user: session.user, session };
}

/**
 * Workspace context:
 * - reads workspace cookie
 * - if missing and user has exactly 1 membership -> auto set
 * - if missing and multiple -> redirect to select-workspace
 */
export async function requireWorkspaceContext() {
  const { user } = await requireAuth();

  let workspaceId = getWorkspaceIdFromCookie();

  if (!workspaceId) {
    const memberships = await prisma.membership.findMany({
      where: { userId: user.id },
      select: { workspaceId: true },
    });

    if (memberships.length === 1) {
      workspaceId = memberships[0].workspaceId;
      setWorkspaceCookie(workspaceId);
    } else {
      // user must select workspace
      redirect("/app/select-workspace");
    }
  }

  return { user, workspaceId };
}
