import { requireWorkspaceContext } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default async function SettingsPage() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");
  const selected = ctx.selectedMembership;
  if (!selected) redirect("/app/select-workspace");

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Settings</div>
        <div className="text-sm text-black/70">Team, roles, billing, branding.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Workspace</CardTitle>
          <CardDescription>Current tenant configuration</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-black/70">
          Workspace: <b>{selected.workspace.name}</b>
          <br />
          Role: <b>{selected.role}</b>
        </CardContent>
      </Card>
    </div>
  );
}
