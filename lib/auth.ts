import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

export const SESSION_COOKIE = "tick_session";
export const WORKSPACE_COOKIE = "tick_workspace";

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ ok: false, error: message }, { status });
}

export async function hashPassword(password: string) {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function getSessionToken() {
  return cookies().get(SESSION_COOKIE)?.value || null;
}

export function setSessionCookie(token: string, expiresAt: Date) {
  cookies().set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export function clearSessionCookie() {
  cookies().set(SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export function setWorkspaceCookie(workspaceId: string) {
  cookies().set(WORKSPACE_COOKIE, workspaceId, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    // workspace selection long-lived
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export function clearWorkspaceCookie() {
  cookies().set(WORKSPACE_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: new Date(0),
  });
}

export async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  const session = await prisma.session.create({
    data: {
      token,
      userId,
      expiresAt,
    },
  });

  return session;
}

export async function destroySession(token: string) {
  await prisma.session.deleteMany({ where: { token } });
}

export async function requireAuth() {
  const token = getSessionToken();
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { token },
    include: { user: true },
  });

  if (!session) return null;
  if (session.expiresAt.getTime() <= Date.now()) return null;

  return session.user;
}

export type WorkspaceContext = {
  user: Awaited<ReturnType<typeof requireAuth>>;
  workspaceId: string;
  memberships: Array<{
    id: string;
    role: any;
    workspaceId: string;
    workspace: { id: string; name: string; slug: string };
  }>;
  selectedMembership: {
    id: string;
    role: any;
    workspaceId: string;
    workspace: { id: string; name: string; slug: string };
  };
};

export async function requireWorkspaceContext(): Promise<WorkspaceContext | null> {
  const user = await requireAuth();
  if (!user) return null;

  const workspaceId = cookies().get(WORKSPACE_COOKIE)?.value;
  if (!workspaceId) return null;

  const selectedMembership = await prisma.membership.findFirst({
    where: { userId: user.id, workspaceId },
    include: { workspace: true },
  });

  if (!selectedMembership) return null;

  const memberships = await prisma.membership.findMany({
    where: { userId: user.id },
    include: { workspace: true },
    orderBy: { createdAt: "asc" },
  });

  return {
    user,
    workspaceId,
    memberships: memberships.map((m) => ({
      id: m.id,
      role: m.role,
      workspaceId: m.workspaceId,
      workspace: { id: m.workspace.id, name: m.workspace.name, slug: m.workspace.slug },
    })),
    selectedMembership: {
      id: selectedMembership.id,
      role: selectedMembership.role,
      workspaceId: selectedMembership.workspaceId,
      workspace: {
        id: selectedMembership.workspace.id,
        name: selectedMembership.workspace.name,
        slug: selectedMembership.workspace.slug,
      },
    },
  };
}
