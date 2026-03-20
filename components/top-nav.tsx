"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { macroModules } from "@/lib/data/modules";
import { cn } from "@/lib/utils";

const primaryModuleSlugs = ["inflation", "growth", "labor", "rates-credit"] as const;
const layerLinks = [
  { href: "/liquidity", label: "Liquidity" },
  { href: "/global-spillover", label: "Global" },
  { href: "/policy-expectations", label: "Policy" },
  { href: "/positioning", label: "Positioning" }
] as const;

const topLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/macro-flow", label: "Macro Flow" },
  { href: "/workflow", label: "Workflow" },
  { href: "/calendar", label: "Calendar" },
  ...primaryModuleSlugs.map((slug) => {
    const moduleEntry = macroModules.find((entry) => entry.slug === slug);

    return {
      href: `/${slug}`,
      label: moduleEntry?.title ?? slug
    };
  }),
  ...layerLinks
];

export function TopNav() {
  const pathname = usePathname() ?? "/";

  return (
    <div className="sticky top-0 z-40 border-b border-[color:var(--border-soft)] bg-[color:var(--nav-surface)] backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-2">
          <Link href="/" className="space-y-1">
            <div className="section-kicker">Macro Signal Deck</div>
            <div className="text-base font-semibold text-[color:var(--text-primary)] sm:text-lg">Calmer macro dashboard</div>
          </Link>
        </div>

        <nav className="flex gap-1.5 overflow-x-auto pb-1" aria-label="Top navigation">
          {topLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium transition",
                  active ? "soft-nav-link-active" : "soft-nav-link"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
