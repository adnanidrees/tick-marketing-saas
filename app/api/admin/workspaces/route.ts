// app/api/admin/workspaces/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";

export async function GET() {
  try {
    const actor = await requireAuth();
    if (!actor) return jsonError("Unauthorized", 401);

    // FIX: globalRole is on actor.user
    if (!isSuperAdmin(actor.user.globalRole)) return jsonError("Forbidden", 403);

    const workspaces = await prisma.workspace.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ ok: true, workspaces });
  } catch (err: any) {
    if (String(err?.message || "").includes("UNAUTHORIZED")) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(err?.message || "Server error", 500);
  }
}

export async function POST(req: Request) {
  try {
    const actor = await requireAuth();
    if (!actor) return jsonError("Unauthorized", 401);

    // FIX: globalRole is on actor.user
    if (!isSuperAdmin(actor.user.globalRole)) return jsonError("Forbidden", 403);

    const form = await req.formData();
    const raw = {
      name: String(form.get("name") || "").trim(),
      slug: String(form.get("slug") || "").trim(),
    };

    if (!raw.name) return jsonError("Workspace name is required", 400);
    if (!raw.slug) return jsonError("Workspace slug is required", 400);

    const workspace = await prisma.workspace.create({
      data: raw,
    });

    return NextResponse.json({ ok: true, workspace });
  } catch (err: any) {
    return jsonError(err?.message || "Server error", 500);
  }
}
