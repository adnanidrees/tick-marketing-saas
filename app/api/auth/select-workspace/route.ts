// app/api/auth/select-workspace/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError, setWorkspaceCookie } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    if (!actor) return jsonError("Unauthorized", 401);

    const body = await req.json().catch(() => ({} as any));
    const workspaceId = String(body?.workspaceId || "").trim();

    if (!workspaceId) return jsonError("workspaceId is required", 400);

    const membership = await prisma.membership.findUnique({
      where: {
        userId_workspaceId: {
          userId: actor.user.id, // FIX
          workspaceId,
        },
      },
    });

    if (!membership) {
      return jsonError("Not a member of this workspace", 403);
    }

    setWorkspaceCookie(workspaceId);

    return NextResponse.json({ ok: true, workspaceId });
  } catch (err: any) {
    if (String(err?.message || "").includes("UNAUTHORIZED")) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(err?.message || "Server error", 500);
  }
}
