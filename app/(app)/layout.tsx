import Link from "next/link";
import { requireWorkspaceContext } from "@/lib/auth";
import { isSuperAdmin } from "@/lib/rbac";
import { Button, Badge } from "@/components/ui";
import { redirect } from "next/navigation";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const ctx = await requireWorkspaceContext();
  if (!ctx) redirect("/login");

  const { user, memberships, selectedMembership } = ctx;

  if (!selectedMembership) {
    return (
      <div className="min-h-screen bg-white text-black">
        <div className="mx-auto max-w-3xl px-4 py-10">
          <div className="text-xl font-semibold">No workspace assigned</div>
          <div className="mt-2 text-sm text-black/70">
            Ask the administrator to assign you to a workspace.
          </div>
          <form action="/api/auth/logout" method="post" className="mt-6">
            <Button type="submit">Logout</Button>
          </form>
        </div>
      </div>
    );
  }

  const showAdmin = isSuperAdmin(user.globalRole);

  return (
    <div className="min-h-screen bg-white text-black">
      <div className="sticky top-0 z-40 border-b border-black/10 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black text-white shadow-sm">
              TM
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">Tick Marketing Ops</div>
              <div className="text-xs text-black/60">Multi-tenant • WhatsApp-first</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge className="border-black/10">{selectedMembership.workspace.name}</Badge>
            {memberships.length > 1 ? (
              <Link className="text-sm underline" href="/app/select-workspace">Switch</Link>
            ) : null}
            {showAdmin ? (
              <Link className="text-sm underline" href="/app/admin/workspaces">Admin</Link>
            ) : null}
            <form action="/api/auth/logout" method="post">
              <Button variant="outline" type="submit">Logout</Button>
            </form>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-4 pb-3">
          <nav className="flex flex-wrap gap-2 text-sm">
            <Link className="rounded-2xl border border-black/10 px-3 py-2 hover:bg-black/5" href="/app">Dashboard</Link>
            <Link className="rounded-2xl border border-black/10 px-3 py-2 hover:bg-black/5" href="/app/modules">Modules</Link>
            <Link className="rounded-2xl border border-black/10 px-3 py-2 hover:bg-black/5" href="/app/reports">Reports</Link>
            <Link className="rounded-2xl border border-black/10 px-3 py-2 hover:bg-black/5" href="/app/integrations">Integrations</Link>
            <Link className="rounded-2xl border border-black/10 px-3 py-2 hover:bg-black/5" href="/app/settings">Settings</Link>
          </nav>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 py-6">{children}</main>
    </div>
  );
}
