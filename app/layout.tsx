import type { Metadata } from "next";

import { SiteShell } from "@/components/site-shell";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://macro-regime-dashboard.vercel.app"),
  title: "Macro Signal Deck",
  description: "A regime-first macro dashboard for understanding the market cycle without chart clutter.",
  openGraph: {
    title: "Macro Signal Deck",
    description: "A regime-first macro dashboard for understanding the market cycle without chart clutter.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShell>{children}</SiteShell>
      </body>
    </html>
  );
}
