"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { macroModules } from "@/lib/data/modules";
import { cn } from "@/lib/utils";

const primaryModuleSlugs = ["inflation", "growth", "labor", "rates-credit"] as const;

const topLinks = [
  { href: "/", label: "Dashboard" },
  { href: "/workflow", label: "Workflow" },
  ...primaryModuleSlugs.map((slug) => {
    const moduleEntry = macroModules.find((entry) => entry.slug === slug);

    return {
      href: `/${slug}`,
      label: moduleEntry?.title ?? slug
    };
  }),
  { href: "/calendar", label: "Calendar" }
];

export function TopNav() {
  const pathname = usePathname();

  return (
    <div className="sticky top-0 z-40 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4">
          <Link href="/" className="space-y-1">
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200">
              Macro Signal Deck
            </div>
            <div className="text-lg font-semibold text-white">Daily macro monitor</div>
          </Link>
        </div>
        <nav className="flex gap-2 overflow-x-auto pb-1">
          {topLinks.map((link) => {
            const active = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "whitespace-nowrap rounded-full border px-3 py-2 text-sm font-medium transition",
                  active
                    ? "border-cyan-300/70 bg-cyan-300/15 text-white"
                    : "border-white/10 bg-white/5 text-slate-300 hover:border-white/20 hover:bg-white/10 hover:text-white"
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
