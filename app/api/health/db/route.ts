import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function GET() {
  const users = await prisma.user.count();
  const workspaces = await prisma.workspace.count();
  return NextResponse.json({ ok: true, users, workspaces });
}
