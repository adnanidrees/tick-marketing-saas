import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tick Marketing SaaS",
  description: "Multi-tenant Marketing Operations Suite"
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white text-black">{children}</body>
    </html>
  );
}
