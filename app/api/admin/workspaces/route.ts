import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { requireAuth, jsonError } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { createWorkspaceSchema } from "@/lib/validation";

export async function POST(req: Request) {
  const user = await requireAuth();
  if (!user) return jsonError("Unauthorized", 401);
  if (!isSuperAdmin(user.globalRole)) return jsonError("Forbidden", 403);

  const form = await req.formData();
  const raw = { name: String(form.get("name") || ""), slug: String(form.get("slug") || "") };
  const parsed = createWorkspaceSchema.safeParse(raw);
  if (!parsed.success) return jsonError("Invalid workspace data", 400);

  await prisma.workspace.create({ data: parsed.data });
  return NextResponse.redirect(new URL("/app/admin/workspaces", process.env.APP_URL || "http://localhost:3000"));
}
