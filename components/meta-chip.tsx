import { cn } from "@/lib/utils";

type MetaChipTone = "slate" | "cyan" | "emerald" | "amber" | "rose";

function toneStyles(tone: MetaChipTone) {
  if (tone === "cyan") {
    return "border-[color:var(--chip-cyan-border)] bg-[color:var(--chip-cyan-bg)] text-[color:var(--chip-cyan-text)]";
  }

  if (tone === "emerald") {
    return "border-[color:var(--chip-emerald-border)] bg-[color:var(--chip-emerald-bg)] text-[color:var(--chip-emerald-text)]";
  }

  if (tone === "amber") {
    return "border-[color:var(--chip-amber-border)] bg-[color:var(--chip-amber-bg)] text-[color:var(--chip-amber-text)]";
  }

  if (tone === "rose") {
    return "border-[color:var(--chip-rose-border)] bg-[color:var(--chip-rose-bg)] text-[color:var(--chip-rose-text)]";
  }

  return "border-[color:var(--chip-slate-border)] bg-[color:var(--chip-slate-bg)] text-[color:var(--chip-slate-text)]";
}

export function MetaChip({
  label,
  value,
  tone = "slate",
  className
}: {
  label: string;
  value: string;
  tone?: MetaChipTone;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
        toneStyles(tone),
        className
      )}
    >
      <span className="shrink-0 text-[color:var(--text-muted)]">{label}</span>
      <span className="min-w-0 truncate text-current">{value}</span>
    </span>
  );
}
