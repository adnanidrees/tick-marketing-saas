import { prisma } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { MODULES, ModuleKey } from "@/lib/modules";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button } from "@/components/ui";
import Link from "next/link";

export default async function ModuleDetailPage({ params }: { params: { moduleKey: string } }) {
  const moduleKey = params.moduleKey as ModuleKey;
  const module = MODULES.find((m) => m.key === moduleKey);
  if (!module) return notFound();

  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  const selected = ctx.selectedMembership;
  if (!selected) redirect("/app/select-workspace");

  const enabled = await prisma.workspaceModule.findUnique({
    where: { workspaceId_moduleKey: { workspaceId: selected.workspaceId, moduleKey } }
  });

  if (!enabled?.enabled) {
    redirect("/app/modules");
  }

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">{module.name}</div>
        <div className="text-sm text-black/70">
          This is a placeholder page. You will plug real workflows here (tables, flows, inbox, rules).
        </div>
        <div className="mt-4 flex gap-2">
          <Link href="/app/modules"><Button variant="outline">Back</Button></Link>
          <Button>New Item</Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Workbench</CardTitle>
            <CardDescription>Main actions for {module.key}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-black/70">
            Add your main workflow UI here.
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Templates / Library</CardTitle>
            <CardDescription>Reusable assets</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-black/70">
            Add templates, scripts, rules, or content here.
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
