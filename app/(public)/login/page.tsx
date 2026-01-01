import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input } from "@/components/ui";
import { redirect } from "next/navigation";

export default function LoginPage({ searchParams }: { searchParams?: { next?: string } }) {
  const next = searchParams?.next || "/app";
  return (
    <div className="mx-auto flex min-h-screen max-w-7xl items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Sign in</CardTitle>
          <CardDescription>Login to your Marketing SaaS workspace</CardDescription>
        </CardHeader>
        <CardContent>
          <form action="/api/auth/login" method="post" className="space-y-3">
            <input type="hidden" name="next" value={next} />
            <div className="space-y-1">
              <div className="text-sm font-medium">Email</div>
              <Input name="email" type="email" placeholder="you@company.com" required />
            </div>
            <div className="space-y-1">
              <div className="text-sm font-medium">Password</div>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full">Sign in</Button>
          </form>
          <div className="mt-4 rounded-2xl border border-black/10 p-3 text-xs text-black/70">
            Default seed admin: <b>admin@local</b> / <b>Admin@12345</b>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
