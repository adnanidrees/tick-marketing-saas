import { requireWorkspaceContext, setWorkspaceCookie } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default async function SelectWorkspacePage() {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");

  const { memberships } = ctx;
  if (memberships.length <= 1) {
    // Set automatically and continue
    if (memberships[0]) {
      setWorkspaceCookie(memberships[0].workspaceId);
    }
    redirect("/app");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Select Workspace</div>
        <div className="text-sm text-black/70">Choose which tenant to access.</div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {memberships.map((m) => (
          <Card key={m.workspaceId}>
            <CardHeader>
              <CardTitle>{m.workspace.name}</CardTitle>
              <CardDescription>Role: {m.role}</CardDescription>
            </CardHeader>
            <CardContent>
              <form action={`/api/auth/select-workspace`} method="post">
                <input type="hidden" name="workspaceId" value={m.workspaceId} />
                <Button type="submit" className="w-full">Open</Button>
              </form>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
