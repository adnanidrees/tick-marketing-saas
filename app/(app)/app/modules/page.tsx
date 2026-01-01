import { prisma } from "@/lib/db";
import { requireWorkspaceContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Badge, Button } from "@/components/ui";
import { MODULES } from "@/lib/modules";
import Link from "next/link";

export default async function ModulesPage() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  const selected = ctx.selectedMembership;
  if (!selected) redirect("/app/select-workspace");

  const enabled = await prisma.workspaceModule.findMany({
    where: { workspaceId: selected.workspaceId, enabled: true }
  });

  const enabledSet = new Set(enabled.map((m) => m.moduleKey));

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Modules</div>
        <div className="text-sm text-black/70">All tools share the same UI shell. Locked modules can be enabled by admin.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {MODULES.map((m) => {
          const isEnabled = enabledSet.has(m.key);
          return (
            <Card key={m.key}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <CardTitle>{m.name}</CardTitle>
                    <CardDescription>{m.group} • {m.description}</CardDescription>
                  </div>
                  <Badge className={isEnabled ? "border-black/10" : "bg-black text-white border-black"}>
                    {isEnabled ? "Enabled" : "Locked"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <div className="text-sm text-black/70">Key: <b>{m.key}</b></div>
                {isEnabled ? (
                  <Link href={`/app/modules/${m.key}`}><Button>Open</Button></Link>
                ) : (
                  <Button variant="outline" disabled>Request Access</Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
