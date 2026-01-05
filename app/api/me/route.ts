// app/api/me/route.ts
import { NextResponse } from "next/server";
import { requireWorkspaceContext } from "@/lib/auth";

export async function GET() {
  const ctx = await requireWorkspaceContext();

  return NextResponse.json({
    ok: true,
    user: {
      id: ctx.user.id,
      email: ctx.user.email,
      name: ctx.user.name,
      globalRole: ctx.user.globalRole,
    },
    workspace: ctx.selectedMembership?.workspace
      ? {
          id: ctx.selectedMembership.workspace.id,
          name: ctx.selectedMembership.workspace.name,
          // slug removed because workspace type doesn't have it
        }
      : null,
    role: ctx.selectedMembership?.role || null,
  });
}
