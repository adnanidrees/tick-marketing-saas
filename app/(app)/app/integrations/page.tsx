import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

export default function IntegrationsPage() {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <div className="text-xl font-semibold">Integrations</div>
        <div className="text-sm text-black/70">Shopify/Woo, Meta, Google, WhatsApp, courier connectors.</div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Connectors</CardTitle>
          <CardDescription>Placeholder</CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-black/70">
          Add OAuth / API key configuration screens here.
        </CardContent>
      </Card>
    </div>
  );
}
