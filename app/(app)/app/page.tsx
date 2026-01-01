import { prisma } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import Link from "next/link";
import { MODULES } from "@/lib/modules";

export default async function DashboardPage() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  const selected = ctx.selectedMembership;
  if (!selected) redirect("/app/select-workspace");

  const enabled = await prisma.workspaceModule.findMany({
    where: { workspaceId: selected.workspaceId, enabled: true }
  });

  const enabledSet = new Set(enabled.map((m) => m.moduleKey));

  const enabledModules = MODULES.filter((m) => enabledSet.has(m.key));
  const lockedModules = MODULES.filter((m) => !enabledSet.has(m.key));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold tracking-tight">Marketing Operations</div>
        <div className="mt-1 text-sm text-black/70">
          Workspace: <b>{selected.workspace.name}</b> • Role: <b>{selected.role}</b>
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href="/app/modules"><Button>Open Modules</Button></Link>
          <Link href="/app/reports"><Button variant="outline">Weekly Report</Button></Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Enabled Modules</CardTitle>
            <CardDescription>Tools available in this workspace</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {enabledModules.map((m) => (
                <Badge key={m.key} className="border-black/10">{m.name}</Badge>
              ))}
              {!enabledModules.length ? <div className="text-sm text-black/70">None enabled yet.</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Locked Modules</CardTitle>
            <CardDescription>Upgrade or enable from admin</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {lockedModules.slice(0, 5).map((m) => (
                <Badge key={m.key} className="bg-black text-white border-black">{m.name}</Badge>
              ))}
              {lockedModules.length > 5 ? <div className="text-xs text-black/60">+{lockedModules.length - 5} more</div> : null}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Wins</CardTitle>
            <CardDescription>High-ROI playbooks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-black/70">
            <div>1) WhatsApp Abandoned Cart + COD Confirmation</div>
            <div>2) Profit ROAS dashboard (COGS + courier + returns)</div>
            <div>3) Lead follow-up sequences</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
