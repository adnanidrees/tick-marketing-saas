import { requireWorkspaceContext } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AdminWorkspaceUsersPage({ params }: { params: { workspaceId: string } }) {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  if (!isSuperAdmin(ctx.user.globalRole)) redirect("/app");

  const ws = await prisma.workspace.findUnique({ where: { id: params.workspaceId } });
  if (!ws) return notFound();

  const memberships = await prisma.membership.findMany({
    where: { workspaceId: ws.id },
    include: { user: true },
    orderBy: { createdAt: "desc" }
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div>
          <div className="text-xl font-semibold">Admin • Users</div>
          <div className="text-sm text-black/70">Workspace: <b>{ws.name}</b></div>
        </div>
        <Link href="/app/admin/workspaces"><Button variant="outline">Back</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create User</CardTitle>
          <CardDescription>User will be added to this workspace with selected role.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/users" method="post" className="grid gap-3 md:grid-cols-4">
            <input type="hidden" name="workspaceId" value={ws.id} />
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Name</div>
              <Input name="name" placeholder="Client User" />
            </div>
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Email</div>
              <Input name="email" type="email" placeholder="client@brand.com" required />
            </div>
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Password</div>
              <Input name="password" type="password" placeholder="StrongPass123" required />
            </div>
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Role</div>
              <select name="role" className="h-10 w-full rounded-2xl border border-black/10 bg-white px-3 text-sm">
                <option value="CLIENT_ADMIN">CLIENT_ADMIN</option>
                <option value="AGENT">AGENT</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>
            <div className="md:col-span-4">
              <Button type="submit" className="w-full">Create User</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Members</CardTitle>
          <CardDescription>{memberships.length} users in this workspace</CardDescription>
        </CardHeader>
        <CardContent className="space-y-2">
          {memberships.map((m) => (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-black/10 p-3">
              <div className="min-w-0">
                <div className="truncate font-medium">{m.user.name || m.user.email}</div>
                <div className="truncate text-xs text-black/60">{m.user.email}</div>
              </div>
              <Badge>{m.role}</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
