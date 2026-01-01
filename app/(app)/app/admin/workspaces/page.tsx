import { requireWorkspaceContext } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Divider } from "@/components/ui";
import Link from "next/link";

export default async function AdminWorkspacesPage() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  if (!isSuperAdmin(ctx.user.globalRole)) redirect("/app");

  const workspaces = await prisma.workspace.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Admin • Workspaces</div>
        <div className="text-sm text-black/70">Create tenants and manage module entitlements.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Create Workspace</CardTitle>
          <CardDescription>Slug must be lowercase with hyphens</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/workspaces" method="post" className="grid gap-3 md:grid-cols-3">
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Name</div>
              <Input name="name" placeholder="Kaichi" required />
            </div>
            <div className="md:col-span-1">
              <div className="text-sm font-medium">Slug</div>
              <Input name="slug" placeholder="kaichi" required />
            </div>
            <div className="md:col-span-1 flex items-end">
              <Button type="submit" className="w-full">Create</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>All Workspaces</CardTitle>
          <CardDescription>Open to manage users and modules</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {workspaces.map((w) => (
            <div key={w.id} className="flex items-center justify-between rounded-2xl border border-black/10 p-3">
              <div>
                <div className="font-medium">{w.name}</div>
                <div className="text-xs text-black/60">slug: {w.slug}</div>
              </div>
              <div className="flex gap-2">
                <Link href={`/app/admin/workspaces/${w.id}/users`}><Button variant="outline">Users</Button></Link>
                <Link href={`/app/admin/workspaces/${w.id}/modules`}><Button>Modules</Button></Link>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
