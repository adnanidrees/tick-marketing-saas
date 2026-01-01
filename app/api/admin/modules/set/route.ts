import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { MODULES } from "@/lib/modules";

export async function POST(req: Request) {
  const actor = await requireAuth();
  if (!actor) return jsonError("Unauthorized", 401);
  if (!isSuperAdmin(actor.globalRole)) return jsonError("Forbidden", 403);

  const form = await req.formData();
  const workspaceId = String(form.get("workspaceId") || "");
  if (!workspaceId) return jsonError("workspaceId required", 400);

  const ws = await prisma.workspace.findUnique({ where: { id: workspaceId } });
  if (!ws) return jsonError("Workspace not found", 404);

  const updates = MODULES.map((m) => {
    const enabled = form.get(`module_${m.key}`) ? true : false;
    return { moduleKey: m.key, enabled };
  });

  for (const u of updates) {
    await prisma.workspaceModule.upsert({
      where: { workspaceId_moduleKey: { workspaceId, moduleKey: u.moduleKey } },
      update: { enabled: u.enabled },
      create: { workspaceId, moduleKey: u.moduleKey, enabled: u.enabled }
    });
  }

  return NextResponse.redirect(
    new URL(`/app/admin/workspaces/${workspaceId}/modules`, process.env.APP_URL || "http://localhost:3000")
  );
}
