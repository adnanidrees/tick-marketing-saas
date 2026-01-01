import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function ReportsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Reports</div>
        <div className="text-sm text-black/70">Weekly summaries, cohorts, LTV, RTO, profitability.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Weekly Report</CardTitle>
          <CardDescription>Placeholder</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-black/70">Connect your analytics here.</CardContent>
      </Card>
    </div>
  );
}
