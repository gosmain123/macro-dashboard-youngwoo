"use client";

import { usePathname } from "next/navigation";

import { ClientErrorBoundary } from "@/components/client-error-boundary";
import { SiteShell } from "@/components/site-shell";

export function SiteShellFrame({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() ?? "/";

  return (
    <ClientErrorBoundary resetKey={pathname}>
      <SiteShell>{children}</SiteShell>
    </ClientErrorBoundary>
  );
}
