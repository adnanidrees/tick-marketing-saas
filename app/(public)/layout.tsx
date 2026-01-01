import "../globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tick Marketing SaaS",
  description: "Multi-tenant Marketing Operations Suite"
};

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-white text-black">{children}</div>;
}

  );
}
