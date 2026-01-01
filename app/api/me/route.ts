import { NextResponse } from "next/server";
import { requireWorkspaceContext, jsonError } from "@/lib/auth";

export async function GET() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) return jsonError("Unauthorized", 401);
  return NextResponse.json({
    ok: true,
    user: { id: ctx.user.id, email: ctx.user.email, name: ctx.user.name, globalRole: ctx.user.globalRole },
    workspace: ctx.selectedMembership?.workspace ? { id: ctx.selectedMembership.workspace.id, name: ctx.selectedMembership.workspace.name, slug: ctx.selectedMembership.workspace.slug } : null,
    role: ctx.selectedMembership?.role || null
  });
}
