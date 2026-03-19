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
      ? "border-cyan-300/25 bg-cyan-300/10 text-cyan-100"
      : variant === "related"
        ? "border-white/10 bg-white/5 text-slate-200"
        : "border-emerald-300/25 bg-emerald-300/10 text-emerald-100";

  return (
    <Link
      href={href}
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-2 text-xs font-medium uppercase tracking-[0.16em] transition hover:border-white/30 ${tone}`}
    >
      {icon}
      {label}
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
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
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

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
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

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
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
    <div className="flex flex-wrap gap-2">
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
