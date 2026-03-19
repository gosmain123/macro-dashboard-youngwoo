import type { Metadata } from "next";

import { WorkspaceProvider } from "@/components/workspace-provider";
import { SiteShell } from "@/components/site-shell";

import "./globals.css";

const themeScript = `
  (() => {
    try {
      const stored = window.localStorage.getItem("macro-signal-deck:theme");
      const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
      const theme = stored === "dark" || stored === "light" ? stored : system;
      document.documentElement.dataset.theme = theme;
    } catch {
      document.documentElement.dataset.theme = "light";
    }
  })();
`;

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
    <html lang="en" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <WorkspaceProvider>
          <SiteShell>{children}</SiteShell>
        </WorkspaceProvider>
      </body>
    </html>
  );
}
