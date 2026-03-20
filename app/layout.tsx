import type { Metadata } from "next";

import { SiteShellFrame } from "@/components/site-shell-frame";

import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://macro-regime-dashboard.vercel.app"),
  title: "Macro Signal Deck",
  description: "A calmer macro dashboard built for fast signal reading, trust, and guided follow-up.",
  openGraph: {
    title: "Macro Signal Deck",
    description: "A calmer macro dashboard built for fast signal reading, trust, and guided follow-up.",
    type: "website"
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteShellFrame>{children}</SiteShellFrame>
      </body>
    </html>
  );
}
