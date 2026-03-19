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
        "inline-flex max-w-full items-center gap-1 rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.16em]",
        toneStyles(tone),
        className
      )}
    >
      <span className="text-[color:var(--text-muted)]">{label}</span>
      <span className="truncate text-current">{value}</span>
    </span>
  );
}
