// lib/auth.ts
import "server-only";

import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const SESSION_COOKIE = "tick_session";
const WORKSPACE_COOKIE = "tick_workspace";

const IS_PROD = process.env.NODE_ENV === "production";

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
    secure: IS_PROD, // dev: allow http
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    expires: new Date(0),
  });
}

export function setWorkspaceCookie(workspaceId: string) {
  cookies().set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "lax",
    path: "/",
    // long-lived
    expires: new Date(Date.now() + 1000 * 60 * 60 * 24 * 365),
  });
}

export function clearWorkspaceCookie() {
  cookies().set(WORKSPACE_COOKIE, "", {
    httpOnly: true,
    secure: IS_PROD,
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

/**
 * ✅ IMPORTANT CHANGE:
 * requireAuth() now returns null (no throw) to prevent runtime 500 on first visit.
 */
export async function requireAuth(): Promise<
  | {
      user: {
        id: string;
        email: string;
        name: string | null;
        globalRole: any;
        createdAt: Date;
        updatedAt: Date;
        passwordHash: string;
      };
      session: any;
    }
  | null
> {
  const token = getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;

  if (session.expiresAt.getTime() < Date.now()) {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }

  return { user: session.user, session };
}

/**
 * Workspace context:
 * - returns memberships + selectedMembership(with workspace)
 * - never throws; returns null if unauthenticated
 */
export async function requireWorkspaceContext() {
  const auth = await requireAuth();
  if (!auth) return null;

  const { user } = auth;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: {
      workspace: {
        select: { id: true, name: true, slug: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  let workspaceId = getWorkspaceIdFromCookie();

  // Find selected membership by cookie
  let selectedMembership =
    (workspaceId
      ? memberships.find((m) => m.workspaceId === workspaceId)
      : null) || null;

  // Auto-select if only 1 membership
  if (!selectedMembership && memberships.length === 1) {
    selectedMembership = memberships[0] || null;
    if (selectedMembership) {
      workspaceId = selectedMembership.workspaceId;
      setWorkspaceCookie(workspaceId);
    }
  }

  return {
    user,
    memberships,
    workspaceId: selectedMembership?.workspaceId ?? null,
    selectedMembership,
  };
}
