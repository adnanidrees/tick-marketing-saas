// app/api/admin/modules/set/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";

export async function POST(req: Request) {
  try {
    const actor = await requireAuth(); // { user, session }
    if (!actor) return jsonError("Unauthorized", 401);

    // FIX: globalRole is on actor.user
    if (!isSuperAdmin(actor.user.globalRole)) return jsonError("Forbidden", 403);

    const form = await req.formData();
    const workspaceId = String(form.get("workspaceId") || "");
    const moduleKey = String(form.get("moduleKey") || "");
    const enabledRaw = String(form.get("enabled") || "false");

    if (!workspaceId) return jsonError("workspaceId is required", 400);
    if (!moduleKey) return jsonError("moduleKey is required", 400);

    const enabled = enabledRaw === "true" || enabledRaw === "1" || enabledRaw === "on";

    // Upsert workspace module enable/disable
    await prisma.workspaceModule.upsert({
      where: { workspaceId_moduleKey: { workspaceId, moduleKey } },
      update: { enabled },
      create: { workspaceId, moduleKey, enabled },
    });

    return NextResponse.json({ ok: true });
  } catch (err: any) {
    // Normalize auth error
    if (String(err?.message || "").includes("UNAUTHORIZED")) {
      return jsonError("Unauthorized", 401);
    }
    return jsonError(err?.message || "Server error", 500);
  }
}
