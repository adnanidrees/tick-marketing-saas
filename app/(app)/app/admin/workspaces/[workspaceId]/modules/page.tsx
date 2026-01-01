import { requireWorkspaceContext } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { prisma } from "@/lib/db";
import { MODULES } from "@/lib/modules";
import { redirect, notFound } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Badge } from "@/components/ui";
import Link from "next/link";

export default async function AdminWorkspaceModulesPage({ params }: { params: { workspaceId: string } }) {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  if (!isSuperAdmin(ctx.user.globalRole)) redirect("/app");

  const ws = await prisma.workspace.findUnique({ where: { id: params.workspaceId } });
  if (!ws) return notFound();

  const current = await prisma.workspaceModule.findMany({ where: { workspaceId: ws.id } });
  const set = new Map(current.map((m) => [m.moduleKey, m.enabled]));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div>
          <div className="text-xl font-semibold">Admin • Modules</div>
          <div className="text-sm text-black/70">Workspace: <b>{ws.name}</b></div>
        </div>
        <Link href="/app/admin/workspaces"><Button variant="outline">Back</Button></Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enable / Disable Modules</CardTitle>
          <CardDescription>These controls define what the client can access.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/admin/modules/set" method="post" className="space-y-3">
            <input type="hidden" name="workspaceId" value={ws.id} />
            <div className="grid gap-3 md:grid-cols-2">
              {MODULES.map((m) => {
                const enabled = set.get(m.key) ?? false;
                return (
                  <label key={m.key} className="flex items-start justify-between gap-3 rounded-2xl border border-black/10 p-3">
                    <div>
                      <div className="font-medium">{m.name}</div>
                      <div className="text-xs text-black/60">{m.description}</div>
                      <div className="mt-2"><Badge>{m.key}</Badge></div>
                    </div>
                    <input
                      type="checkbox"
                      name={`module_${m.key}`}
                      defaultChecked={enabled}
                      className="mt-1 h-5 w-5"
                    />
                  </label>
                );
              })}
            </div>
            <Button type="submit" className="w-full">Save Changes</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
