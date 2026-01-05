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

  const session = await prisma.session.create({
    data: { token, userId, expiresAt },
  });

  return { token: session.token, expiresAt: session.expiresAt };
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

/** Require user by session cookie */
export async function requireAuth() {
  const token = getSessionToken();
  if (!token) throw new Error("UNAUTHORIZED");

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) throw new Error("UNAUTHORIZED");

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token } });
    throw new Error("UNAUTHORIZED");
  }

  return { user: session.user, session };
}

/**
 * Workspace context:
 * - reads workspace cookie
 * - returns memberships (for /select-workspace page)
 * - selectedMembership for current workspace
 */
export async function requireWorkspaceContext() {
  const { user } = await requireAuth();

  // Always load memberships so select-workspace page can use them
  // Keep select minimal so it matches any schema and avoids TS issues.
  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    select: {
      id: true,
      workspaceId: true,
      role: true, // if role doesn't exist in schema, remove this line
      workspace: { select: { id: true, name: true } }, // if workspace relation doesn't exist, remove this block
    } as any,
  });

  let workspaceId = getWorkspaceIdFromCookie();

  // If no cookie, auto pick when single membership
  if (!workspaceId) {
    if (memberships.length === 1) {
      workspaceId = memberships[0].workspaceId;
      setWorkspaceCookie(workspaceId);
    } else {
      redirect("/app/select-workspace");
    }
  }

  // Ensure selected membership exists (cookie may be stale)
  const selectedMembership =
    memberships.find((m: any) => m.workspaceId === workspaceId) ??
    (await prisma.membership.findFirst({
      where: { userId: user.id, workspaceId: workspaceId! },
    }));

  if (!selectedMembership) {
    clearWorkspaceCookie();
    redirect("/app/select-workspace");
  }

  return {
    user,
    workspaceId: workspaceId!,
    selectedMembership,
    memberships,
  };
}
