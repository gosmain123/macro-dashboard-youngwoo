"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { MiniLogicMap } from "@/lib/macro-flow";
import { cn } from "@/lib/utils";

function NodeLink({
  label,
  hint,
  href
}: {
  label: string;
  hint: string;
  href?: string;
}) {
  const content = (
    <>
      <p className="text-sm font-semibold text-[color:var(--text-primary)]">{label}</p>
      <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{hint}</p>
    </>
  );

  const className =
    "surface-inset block min-w-0 flex-1 rounded-[22px] border border-[color:var(--border-soft)] px-4 py-4 transition hover:border-[color:var(--border-strong)]";

  if (href) {
    return (
      <Link href={href} className={className}>
        {content}
      </Link>
    );
  }

  return <div className={className}>{content}</div>;
}

export function MiniLogicMap({
  map,
  className
}: {
  map: MiniLogicMap;
  className?: string;
}) {
  return (
    <section className={cn("surface-card overflow-hidden rounded-[28px] p-5 md:p-6", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div className="min-w-0 max-w-3xl">
          <p className="section-kicker">Mini Logic Map</p>
          <h2 className="mt-2 text-2xl font-semibold text-[color:var(--text-primary)]">{map.title}</h2>
          <p className="mt-2 text-sm leading-6 text-[color:var(--text-secondary)]">{map.summary}</p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 xl:flex-row xl:items-stretch xl:gap-2">
        {map.nodes.map((node, index) => (
          <div key={`${node.label}-${index}`} className="flex min-w-0 flex-col gap-3 xl:flex-1 xl:flex-row xl:items-stretch xl:gap-2">
            <NodeLink label={node.label} hint={node.hint} href={node.href} />
            {index < map.nodes.length - 1 ? (
              <>
                <div className="surface-inset flex h-8 w-8 items-center justify-center self-center rounded-full text-[color:var(--text-muted)] xl:self-auto">
                  <ArrowRight className="hidden h-4 w-4 xl:block" />
                  <ArrowRight className="h-4 w-4 rotate-90 xl:hidden" />
                </div>
              </>
            ) : null}
          </div>
        ))}
      </div>

      {map.footer ? (
        <p className="mt-4 text-sm text-[color:var(--text-muted)]">{map.footer}</p>
      ) : null}
    </section>
  );
}
