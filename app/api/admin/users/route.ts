// app/api/admin/users/route.ts
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

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, users });
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

    const email = String(form.get("email") || "").trim().toLowerCase();
    const name = String(form.get("name") || "").trim();
    const globalRole = String(form.get("globalRole") || "").trim();

    if (!email) return jsonError("Email is required", 400);

    // If your schema enforces enum, you may validate against allowed values here.
    const user = await prisma.user.create({
      data: {
        email,
        name: name || null,
        // @ts-ignore (in case GlobalRole enum typing is strict)
        globalRole: globalRole || undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        globalRole: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, user });
  } catch (err: any) {
    return jsonError(err?.message || "Server error", 500);
  }
}
