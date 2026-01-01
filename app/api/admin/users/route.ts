import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { createUserSchema } from "@/lib/validation";
import bcrypt from "bcryptjs";
import { WorkspaceRole } from "@prisma/client";

export async function POST(req: Request) {
  const actor = await requireAuth();
  if (!actor) return jsonError("Unauthorized", 401);
  if (!isSuperAdmin(actor.globalRole)) return jsonError("Forbidden", 403);

  const form = await req.formData();
  const raw = {
    email: String(form.get("email") || ""),
    name: String(form.get("name") || "") || undefined,
    password: String(form.get("password") || ""),
    workspaceId: String(form.get("workspaceId") || ""),
    role: String(form.get("role") || "VIEWER")
  };

  const parsed = createUserSchema.safeParse(raw);
  if (!parsed.success) return jsonError("Invalid user data", 400);

  const passwordHash = await bcrypt.hash(parsed.data.password, 12);

  const user = await prisma.user.upsert({
    where: { email: parsed.data.email },
    update: { name: parsed.data.name ?? undefined },
    create: { email: parsed.data.email, name: parsed.data.name, passwordHash }
  });

  await prisma.membership.upsert({
    where: { userId_workspaceId: { userId: user.id, workspaceId: parsed.data.workspaceId } },
    update: { role: parsed.data.role as WorkspaceRole },
    create: { userId: user.id, workspaceId: parsed.data.workspaceId, role: parsed.data.role as WorkspaceRole }
  });

  return NextResponse.redirect(
    new URL(`/app/admin/workspaces/${parsed.data.workspaceId}/users`, process.env.APP_URL || "http://localhost:3000")
  );
}
