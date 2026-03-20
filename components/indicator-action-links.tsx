import Link from "next/link";
import { ArrowRight, Radar, Waypoints } from "lucide-react";

import { getIndicatorNavigation } from "@/lib/indicator-navigation";
import type { MacroIndicator } from "@/types/macro";

function LinkGroup({
  label,
  href,
  variant
}: {
  label: string;
  href: string;
  variant: "next" | "related" | "confirm";
}) {
  const icon =
    variant === "confirm" ? (
      <Radar className="h-3.5 w-3.5" />
    ) : variant === "related" ? (
      <Waypoints className="h-3.5 w-3.5" />
    ) : (
      <ArrowRight className="h-3.5 w-3.5" />
    );

  const tone =
    variant === "confirm"
      ? "border-[color:var(--accent-border)] bg-[color:var(--accent-soft)] text-[color:var(--accent-strong)]"
      : variant === "related"
        ? "border-[color:var(--border-soft)] bg-[color:var(--surface-muted)] text-[color:var(--text-primary)]"
        : "border-[rgba(5,150,105,0.18)] bg-[rgba(5,150,105,0.1)] text-[color:var(--positive-text)]";

  return (
    <Link
      href={href}
      className={`inline-flex max-w-full min-w-0 items-center gap-1.5 rounded-full border px-2.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.14em] transition hover:border-[color:var(--border-strong)] ${tone}`}
    >
      {icon}
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function IndicatorActionLinks({
  indicator,
  layout = "compact"
}: {
  indicator: Pick<MacroIndicator, "slug" | "module">;
  layout?: "compact" | "panel";
}) {
  const navigation = getIndicatorNavigation(indicator);

  if (
    navigation.checkNext.length === 0 &&
    navigation.related.length === 0 &&
    navigation.confirmIn.length === 0
  ) {
    return null;
  }

  if (layout === "panel") {
    return (
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="surface-inset rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Check next</p>
          {navigation.checkNext.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {navigation.checkNext.map((link) => (
                <LinkGroup key={link.href} label={link.label} href={link.href} variant="next" />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">Use the Playbook or Workflow links below.</p>
          )}
        </div>

        <div className="surface-inset rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Related indicator</p>
          {navigation.related.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {navigation.related.map((link) => (
                <LinkGroup key={link.href} label={link.label} href={link.href} variant="related" />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">No direct related jump is pinned yet.</p>
          )}
        </div>

        <div className="surface-inset rounded-[20px] p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-500">Confirm in</p>
          {navigation.confirmIn.length > 0 ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {navigation.confirmIn.map((link) => (
                <LinkGroup key={link.href} label={link.label} href={link.href} variant="confirm" />
              ))}
            </div>
          ) : (
            <p className="mt-3 text-sm leading-6 text-slate-500">Use Workflow to confirm the cross-check.</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-1.5">
      {navigation.checkNext[0] ? (
        <LinkGroup label={`Check ${navigation.checkNext[0].label}`} href={navigation.checkNext[0].href} variant="next" />
      ) : null}
      {navigation.related[0] ? (
        <LinkGroup label={navigation.related[0].label} href={navigation.related[0].href} variant="related" />
      ) : null}
      {navigation.confirmIn[0] ? (
        <LinkGroup label={`Confirm in ${navigation.confirmIn[0].label}`} href={navigation.confirmIn[0].href} variant="confirm" />
      ) : null}
    </div>
  );
}
