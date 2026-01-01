import { NextResponse } from "next/server";
import { requireAuth, setWorkspaceCookie, jsonError } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return jsonError("Unauthorized", 401);

  const form = await req.formData();
  const workspaceId = String(form.get("workspaceId") || "");
  if (!workspaceId) return jsonError("workspaceId required", 400);

  const membership = await prisma.membership.findUnique({
    where: { userId_workspaceId: { userId: user.id, workspaceId } }
  });

  if (!membership) return jsonError("Not a member of this workspace", 403);

  setWorkspaceCookie(workspaceId);
  return NextResponse.redirect(new URL("/app", process.env.APP_URL || "http://localhost:3000"));
}
