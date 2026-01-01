export type ModuleKey =
  | "ads"
  | "crm"
  | "whatsapp"
  | "retention"
  | "profit"
  | "ugc"
  | "affiliate"
  | "seo"
  | "reputation"
  | "connectors";

export const MODULES: Array<{
  key: ModuleKey;
  name: string;
  group: "Acquisition" | "Retention" | "Analytics";
  description: string;
}> = [
  { key: "ads", name: "Ads Automation", group: "Acquisition", description: "Rules, pacing, fatigue, guardrails." },
  { key: "crm", name: "CRM & Leads", group: "Acquisition", description: "Lead inbox, pipeline, assignments, follow-ups." },
  { key: "whatsapp", name: "WhatsApp", group: "Retention", description: "Inbox, flows, templates, COD confirmation." },
  { key: "retention", name: "Retention", group: "Retention", description: "Email/SMS/WA lifecycle flows + segments." },
  { key: "profit", name: "Profit & Attribution", group: "Analytics", description: "Profit ROAS, cohorts, CAC payback, RTO." },
  { key: "ugc", name: "UGC / Creatives", group: "Acquisition", description: "Creators, briefs, assets, approvals." },
  { key: "affiliate", name: "Influencer/Affiliate", group: "Acquisition", description: "Tracking links, commissions, payouts." },
  { key: "seo", name: "SEO Content", group: "Retention", description: "Plans, clusters, audits, refresh alerts." },
  { key: "reputation", name: "Reputation", group: "Analytics", description: "Reviews, requests, multi-location." },
  { key: "connectors", name: "Connectors", group: "Analytics", description: "Sync, webhooks, logs, data routing." }
];
