import type { Metadata } from "next";
import { Manrope, Space_Grotesk } from "next/font/google";

import { Providers } from "@/app/providers";
import { SiteShell } from "@/components/site-shell";

import "./globals.css";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body"
});

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading"
});

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
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>
        <Providers>
          <SiteShell>{children}</SiteShell>
        </Providers>
      </body>
    </html>
  );
}
