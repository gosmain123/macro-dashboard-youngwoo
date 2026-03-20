import type { ReactNode } from "react";

import { TopNav } from "@/components/top-nav";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <div className="app-shell">
      <div className="app-backdrop" />
      <TopNav />
      <main className="relative mx-auto min-w-0 max-w-7xl overflow-x-clip px-4 py-6 sm:px-6 lg:px-8 lg:py-8">{children}</main>
    </div>
  );
}
